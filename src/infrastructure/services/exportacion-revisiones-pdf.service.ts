import { Inject, Injectable } from '@nestjs/common';
import {
  HTML_PDF_GENERATOR,
  type IHtmlPdfGenerator,
} from '../../domain/services/html-pdf-generator.interface';
import { ObtenerRevisionesUseCase } from '../../application/use-cases/acc/reviews/obtener-revisiones.use-case';
import type { ExportarRevisionesPdfQueryDto } from '../../application/dtos/acc/reviews/exportar-revisiones-pdf-query.dto';
import type { ObtenerRevisionesDto } from '../../application/dtos/acc/reviews/obtener-revisiones.dto';

const PAGE_SIZE = 50;
const MAX_EXPORT_ROWS = 3000;

type RevisionRow = Record<string, unknown>;

function formatDateEs(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return String(iso);
  }
}

function statusLabel(status: string | undefined): string {
  const s = String(status ?? '').toUpperCase();
  if (s === 'OPEN') return 'Abierto';
  if (s === 'CLOSED') return 'Cerrado';
  if (s === 'VOID') return 'Anulado';
  if (s === 'FAILED') return 'Fallido';
  return status || '—';
}

function nextActionSummary(row: RevisionRow): string {
  const wf = String(row.nextActionByWorkflow ?? '').trim();
  if (wf) return wf;
  const gvr = row.gvrNextActionBy as { nombre?: string }[] | undefined;
  if (gvr?.length) return gvr.map((c) => c.nombre).join(', ');
  const next = row.nextActionBy as {
    claimedBy?: { name?: string }[];
    candidates?: {
      users?: { name?: string }[];
      roles?: { name?: string }[];
    };
  } | null;
  if (!next) return '—';
  if (next.claimedBy?.length) return next.claimedBy.map((u) => u.name).join(', ');
  const users = next.candidates?.users;
  if (users?.length) return users.map((u) => u.name).join(', ');
  const roles = next.candidates?.roles;
  if (roles?.length) return roles.map((r) => r.name).join(', ');
  return '—';
}

function initiatedSummary(row: RevisionRow): string {
  const wf = String(row.initiatedByWorkflow ?? '').trim();
  if (wf) return wf;
  const gvr = row.gvrCreadoPor as { nombre?: string } | undefined;
  if (gvr?.nombre) return gvr.nombre;
  const created = row.createdBy as { name?: string } | undefined;
  return created?.name || '—';
}

@Injectable()
export class ExportacionRevisionesPdfService {
  constructor(
    private readonly obtenerRevisionesUseCase: ObtenerRevisionesUseCase,
    @Inject(HTML_PDF_GENERATOR)
    private readonly htmlPdfGenerator: IHtmlPdfGenerator,
  ) {}

  async generarPdf(
    userId: number,
    projectId: string,
    query: ExportarRevisionesPdfQueryDto,
  ): Promise<Buffer> {
    const lista = await this.obtenerTodasLasRevisionesFiltradas(userId, projectId, query);
    const totalEnSistema = lista.totalResults;
    const rows = lista.rows.map((r) => ({
      estado: statusLabel(r.status as string),
      nombre: String((r.name as string) || '—'),
      iniciadoPor: initiatedSummary(r),
      siguienteAccion: nextActionSummary(r),
      vence: formatDateEs(r.currentStepDueDate as string),
      creado: formatDateEs(r.createdAt as string),
      finalizado: formatDateEs(r.finishedAt as string | null),
      archivos: String(r.filesCount ?? 0),
      aprobados: String(r.approvedCount ?? 0),
      rechazados: String(r.rejectedCount ?? 0),
      progreso: `${Number(r.progressPercent ?? 0).toFixed(0)} %`,
    }));

    const filtrosResumen = this.buildFiltrosResumen(query);
    const fechaGeneracion = formatDateEs(new Date().toISOString());

    return this.htmlPdfGenerator.renderPdfFromTemplate(
      'acc-revisions-list-report',
      {
        tituloReporte: 'Listado de revisiones',
        projectId,
        fechaGeneracion,
        totalListadas: rows.length,
        totalEnSistema,
        listadoParcial: lista.truncated,
        filtrosResumen,
        rows,
      },
      {
        format: 'A4',
        landscape: true,
        margin: { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' },
      },
    );
  }

  private buildFiltrosResumen(q: ExportarRevisionesPdfQueryDto): { etiqueta: string; valor: string }[] {
    const out: { etiqueta: string; valor: string }[] = [];
    if (q.filter_name?.trim()) out.push({ etiqueta: 'Nombre', valor: q.filter_name.trim() });
    if (q.filter_status?.trim()) out.push({ etiqueta: 'Estado', valor: statusLabel(q.filter_status) });
    if (q.filter_workflowId?.trim()) out.push({ etiqueta: 'Flujo (ID)', valor: q.filter_workflowId.trim() });
    if (q.filter_createdAt?.trim()) out.push({ etiqueta: 'Creado', valor: q.filter_createdAt.trim() });
    if (q.filter_finishedAt?.trim()) out.push({ etiqueta: 'Finalizado', valor: q.filter_finishedAt.trim() });
    if (q.filter_currentStepDueDate?.trim())
      out.push({ etiqueta: 'Vence (paso actual)', valor: q.filter_currentStepDueDate.trim() });
    if (!out.length) out.push({ etiqueta: 'Filtros', valor: 'Ninguno (todas las revisiones del proyecto)' });
    return out;
  }

  private async obtenerTodasLasRevisionesFiltradas(
    userId: number,
    projectId: string,
    query: ExportarRevisionesPdfQueryDto,
  ): Promise<{ rows: RevisionRow[]; totalResults: number; truncated: boolean }> {
    const baseDto: ObtenerRevisionesDto = {
      limit: PAGE_SIZE,
      offset: 0,
      filter_status: query.filter_status,
      filter_name: query.filter_name,
      filter_createdAt: query.filter_createdAt,
      filter_finishedAt: query.filter_finishedAt,
      filter_currentStepDueDate: query.filter_currentStepDueDate,
      filter_workflowId: query.filter_workflowId,
    };

    const first = await this.obtenerRevisionesUseCase.execute(userId, projectId, baseDto);
    const totalResults = first.pagination?.totalResults ?? (first.results?.length ?? 0);
    const results: RevisionRow[] = [...((first.results ?? []) as RevisionRow[])];
    let offset = PAGE_SIZE;

    while (results.length < Math.min(totalResults, MAX_EXPORT_ROWS) && offset < totalResults) {
      const batch = await this.obtenerRevisionesUseCase.execute(userId, projectId, {
        ...baseDto,
        offset,
      });
      const chunk = (batch.results ?? []) as RevisionRow[];
      if (!chunk.length) break;
      for (const row of chunk) {
        if (results.length >= MAX_EXPORT_ROWS) break;
        results.push(row);
      }
      if (chunk.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    const truncated = totalResults > results.length;
    return { rows: results, totalResults, truncated };
  }
}
