import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  HTML_PDF_GENERATOR,
  type IHtmlPdfGenerator,
} from '../../domain/services/html-pdf-generator.interface';
import { ObtenerRevisionPorIdUseCase } from '../../application/use-cases/acc/reviews/obtener-revision-por-id.use-case';
import { GetComentariosArchivoUseCase } from '../../application/use-cases/acc/reviews/get-comentarios-archivo.use-case';
import { ObtenerReferenciasRevisionUseCase } from '../../application/use-cases/acc/reviews/obtener-referencias-revision.use-case';

function formatDateEs(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = iso instanceof Date ? iso : new Date(String(iso));
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(iso);
  }
}

/** ID numérico interno (GVR) para comentarios y referencias; null si no aplica (p. ej. solo ACC). */
function resolveInternalRevisionId(
  reviewIdParam: string,
  sequenceId: number,
): number | null {
  const cleaned = String(reviewIdParam).replace(/^GVR-/i, '').trim();
  const parsed = parseInt(cleaned, 10);
  if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  if (sequenceId > 0) return sequenceId;
  return null;
}

@Injectable()
export class ExportacionRevisionDetallePdfService {
  constructor(
    private readonly obtenerRevisionPorIdUseCase: ObtenerRevisionPorIdUseCase,
    private readonly getComentariosArchivoUseCase: GetComentariosArchivoUseCase,
    private readonly obtenerReferenciasRevisionUseCase: ObtenerReferenciasRevisionUseCase,
    @Inject(HTML_PDF_GENERATOR)
    private readonly htmlPdfGenerator: IHtmlPdfGenerator,
  ) {}

  async generarPdf(
    userId: number,
    projectId: string,
    reviewIdParam: string,
  ): Promise<Buffer> {
    const detail = await this.obtenerRevisionPorIdUseCase.execute(
      userId,
      projectId,
      reviewIdParam,
    );
    if (!detail || typeof detail !== 'object') {
      throw new BadRequestException('No se encontró la revisión.');
    }

    const sequenceId = Number(detail.sequenceId ?? 0);
    const internalId = resolveInternalRevisionId(reviewIdParam, sequenceId);

    const filesRaw: any[] = Array.isArray(detail.files) ? detail.files : [];
    const fileRows: Record<string, unknown>[] = [];

    for (const f of filesRaw) {
      const fileId = Number(f.id ?? 0);
      let commentsHtml = '';
      if (fileId > 0 && internalId != null) {
        try {
          const comments = await this.getComentariosArchivoUseCase.execute(
            internalId,
            fileId,
          );
          commentsHtml = (comments ?? [])
            .map(
              (c) =>
                `<li><strong>${this.escapeHtml(c.nombreAutor)}</strong> (${formatDateEs(c.fechaCreacion)}): ${this.escapeHtml(c.contenido)}</li>`,
            )
            .join('');
        } catch {
          commentsHtml = '<li>—</li>';
        }
      } else if (fileId > 0) {
        commentsHtml = '<li>—</li>';
      }
      const status = String(f.approvalStatus ?? f.badge?.label ?? '—');
      fileRows.push({
        nombre: String(f.name ?? '—'),
        ruta: String(f.path ?? '—'),
        version: String(f.version ?? '—'),
        estado: status,
        comentariosLista: commentsHtml || '<li>Sin comentarios</li>',
      });
    }

    let referencias: Record<string, unknown>[] = [];
    try {
      if (internalId == null) throw new Error('skip refs');
      const refs =
        await this.obtenerReferenciasRevisionUseCase.execute(internalId);
      referencias = (refs ?? []).map((r) => ({
        tipo: String(r.tipoReferencia ?? '—'),
        idExterno: String(r.idReferenciaExterna ?? '—'),
        notas: String(r.notasReferencia ?? '—'),
        url: r.urlDeepLink ? String(r.urlDeepLink) : '',
        creado: formatDateEs(r.fechaCreacion),
      }));
    } catch {
      referencias = [];
    }

    const createdBy = detail.createdBy;
    const iniciadorNombre = String(createdBy?.nombre ?? createdBy?.name ?? '—');
    const iniciadorCorreo = String(createdBy?.correo ?? createdBy?.email ?? '');

    const stepsRaw: any[] = Array.isArray(detail.workflow?.steps)
      ? detail.workflow.steps
      : [];
    const pasos = stepsRaw.map((s, idx) => ({
      orden: String(s.order ?? idx + 1),
      nombre: String(s.name ?? `Paso ${idx + 1}`),
      tipo: String(s.type ?? '—'),
      candidatos: Array.isArray(s.candidates)
        ? s.candidates
            .map((c: any) => String(c.nombre ?? c.name ?? ''))
            .filter(Boolean)
            .join(', ') || '—'
        : '—',
    }));

    const activityRaw: any[] = Array.isArray(detail.activity)
      ? detail.activity
      : [];
    const actividades = activityRaw.map((a) => ({
      autor: String(a.author ?? 'Sistema'),
      cuando: formatDateEs(a.createdAt),
      mensaje: String(a.message ?? ''),
      evento: String(a.eventType ?? ''),
    }));

    const stats = detail.stats ?? {};
    const wf = detail.workflow ?? {};

    const templateData: Record<string, unknown> = {
      titulo: String(detail.name ?? 'Revisión'),
      projectId,
      reviewIdExterno: String(detail.id ?? reviewIdParam),
      estado: String(detail.status ?? '—'),
      sequenceId: String(sequenceId || '—'),
      ronda: String(detail.round ?? '1'),
      creado: formatDateEs(detail.createdAt),
      actualizado: formatDateEs(detail.updatedAt),
      finalizado: formatDateEs(detail.finishedAt),
      notasRevision: String(detail.notes ?? ''),
      flujoNombre: String(wf.name ?? '—'),
      flujoNotas: String(wf.notes ?? ''),
      progresoPct: String(Number(stats.progressPercent ?? 0).toFixed(0)),
      archivosTotal: String(stats.total ?? 0),
      archivosAprobados: String(stats.approved ?? 0),
      archivosRechazados: String(stats.rejected ?? 0),
      iniciadorNombre,
      iniciadorCorreo,
      pasos,
      fileRows,
      actividades,
      referencias,
      fechaInforme: formatDateEs(new Date().toISOString()),
      sinReferencias: referencias.length === 0,
      sinActividad: actividades.length === 0,
      sinArchivos: fileRows.length === 0,
    };

    return this.htmlPdfGenerator.renderPdfFromTemplate(
      'acc-revision-detail-report',
      templateData,
      {
        format: 'A4',
        landscape: false,
        margin: { top: '14mm', right: '12mm', bottom: '14mm', left: '12mm' },
      },
    );
  }

  private escapeHtml(s: string): string {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
