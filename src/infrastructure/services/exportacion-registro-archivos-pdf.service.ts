import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ACC_REPOSITORY, type IAccRepository } from '../../domain/repositories/acc.repository.interface';
import { AutodeskApiService } from './autodesk-api.service';
import {
  HTML_PDF_GENERATOR,
  type IHtmlPdfGenerator,
} from '../../domain/services/html-pdf-generator.interface';
import type { ExportarRegistroArchivosPdfDto } from '../../application/dtos/data-management/folders/exportar-registro-archivos-pdf.dto';

const MAX_FILES = 4000;
const MAX_CARPETAS = 500;
const TIP_FETCH_CONCURRENCY = 6;

type Fila = {
  ruta: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  version: string;
  modificado: string;
  atributosExtra: string;
};

function fmtFecha(iso: string | null | undefined): string {
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

@Injectable()
export class ExportacionRegistroArchivosPdfService {
  constructor(
    @Inject(ACC_REPOSITORY)
    private readonly accRepository: IAccRepository,
    private readonly autodeskApiService: AutodeskApiService,
    @Inject(HTML_PDF_GENERATOR)
    private readonly htmlPdf: IHtmlPdfGenerator,
  ) {}

  async generarPdf(
    userId: number,
    projectId: string,
    folderId: string,
    dto: ExportarRegistroArchivosPdfDto,
  ): Promise<Buffer> {
    const token = await this.accRepository.obtenerToken3LeggedPorUsuario(userId);
    if (!token) {
      throw new ForbiddenException(
        'No se encontró token de acceso. Autoriza Autodesk primero.',
      );
    }
    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new ForbiddenException('El token de Autodesk ha expirado.');
    }

    const dmId = projectId.startsWith('b.') ? projectId : `b.${projectId}`;

    let proyectoLabel = dmId;
    if (dto.hubId?.trim()) {
      try {
        const proy = await this.autodeskApiService.obtenerProyectoPorId(
          token.tokenAcceso,
          dto.hubId.trim(),
          dmId,
        );
        const a = proy?.data?.attributes;
        const n = a?.name || a?.title || a?.displayName;
        if (n && String(n).trim()) {
          proyectoLabel = `${String(n).trim()} (${dmId})`;
        }
      } catch {
        // sin nombre, se mantiene el id del proyecto
      }
    }

    let carpetaBaseLabel = folderId;
    try {
      const carp = await this.autodeskApiService.obtenerCarpetaPorId(
        token.tokenAcceso,
        projectId,
        folderId,
      );
      const a = carp?.data?.attributes;
      const n = a?.displayName || a?.name;
      if (n && String(n).trim()) {
        carpetaBaseLabel = `${String(n).trim()} (${folderId})`;
      }
    } catch {
      // sin nombre, se muestra el URN/id de carpeta
    }

    const { rows, truncated, carpetasVisitadas } = await this.recolectarFilas(
      token.tokenAcceso,
      projectId,
      folderId,
      dto,
    );

    await this.rellenarVersionesFaltantes(token.tokenAcceso, projectId, rows);

    return this.htmlPdf.renderPdfFromTemplate(
      'docs-file-registry-report',
      {
        tituloReporte: dto.titulo,
        proyectoLabel,
        carpetaBaseLabel,
        fechaGeneracion: fmtFecha(new Date().toISOString()),
        incluirSubcarpetas: dto.incluirSubcarpetas,
        atributosPersonalizados: dto.incluirAtributosPersonalizados,
        totalFilas: rows.length,
        carpetasVisitadas,
        listadoParcial: truncated,
        filas: rows,
      },
      {
        format: 'A4',
        landscape: true,
        margin: { top: '10mm', right: '8mm', bottom: '10mm', left: '8mm' },
      },
    );
  }

  private buildIncludedMap(included: any[]): Map<string, any> {
    const m = new Map<string, any>();
    for (const r of included || []) {
      if (r?.type && r?.id) {
        m.set(`${r.type}:${r.id}`, r);
      }
    }
    return m;
  }

  private versionLabelFromAttributes(attributes: any): string | null {
    if (!attributes) return null;
    const n = attributes.versionNumber;
    if (n == null || n === '') return null;
    return `V${n}`;
  }

  private versionDeItem(
    item: any,
    includedMap: Map<string, any>,
  ): string {
    const direct = this.versionLabelFromAttributes(item?.attributes);
    if (direct) return direct;

    const tip = item?.relationships?.tip?.data;
    if (tip?.type && tip?.id) {
      const res = includedMap.get(`${tip.type}:${tip.id}`);
      const fromInc = this.versionLabelFromAttributes(res?.attributes);
      if (fromInc) return fromInc;
    }
    return '—';
  }

  private atributosStr(item: any, incluir: boolean): string {
    if (!incluir) return '—';
    const data = item?.attributes?.extension?.data;
    if (data == null) return '—';
    try {
      const s = JSON.stringify(data);
      return s.length > 200 ? s.slice(0, 200) + '…' : s;
    } catch {
      return '—';
    }
  }

  private descripcionDe(item: any): string {
    return (
      item?.attributes?.extension?.data?.description ||
      item?.attributes?.description ||
      '—'
    );
  }

  private rutaCelda(pathPrefix: string): string {
    return pathPrefix ? pathPrefix : '.';
  }

  private async rellenarVersionesFaltantes(
    accessToken: string,
    projectId: string,
    rows: Fila[],
  ): Promise<void> {
    const needIndex: { idx: number; itemId: string }[] = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (r.tipo !== 'Archivo' || r.version !== '—') continue;
      const id = (r as Fila & { _itemId?: string })._itemId;
      if (id) needIndex.push({ idx: i, itemId: id });
    }
    for (let i = 0; i < needIndex.length; i += TIP_FETCH_CONCURRENCY) {
      const batch = needIndex.slice(i, i + TIP_FETCH_CONCURRENCY);
      const out = await Promise.all(
        batch.map(async ({ idx, itemId }) => {
          try {
            const tip = await this.autodeskApiService.obtenerTipVersion(
              accessToken,
              projectId,
              itemId,
            );
            const a = tip?.data?.attributes;
            const v = this.versionLabelFromAttributes(a);
            return { idx, v };
          } catch {
            return { idx, v: null as string | null };
          }
        }),
      );
      for (const { idx, v } of out) {
        if (v) rows[idx].version = v;
      }
    }
    for (const r of rows) {
      delete (r as Fila & { _itemId?: string })._itemId;
    }
  }

  private async recolectarFilas(
    accessToken: string,
    projectId: string,
    folderId: string,
    dto: ExportarRegistroArchivosPdfDto,
  ): Promise<{
    rows: (Fila & { _itemId?: string })[];
    truncated: boolean;
    carpetasVisitadas: number;
  }> {
    const rows: (Fila & { _itemId?: string })[] = [];
    const cola: { id: string; ruta: string }[] = [{ id: folderId, ruta: '' }];
    const visto = new Set<string>();
    let carpetasVisitadas = 0;
    let truncated = false;

    while (cola.length > 0 && rows.length < MAX_FILES && carpetasVisitadas < MAX_CARPETAS) {
      const { id, ruta: pathPrefix } = cola.shift()!;
      if (visto.has(id)) continue;
      visto.add(id);
      carpetasVisitadas += 1;

      const { data: itemList, included } =
        await this.autodeskApiService.obtenerContenidoCarpetaTodasLasPaginas(
          accessToken,
          projectId,
          id,
          {},
        );
      const includedMap = this.buildIncludedMap(included);

      for (const item of itemList) {
        if (rows.length >= MAX_FILES) {
          truncated = true;
          break;
        }
        const nombre = item.attributes?.displayName || item.attributes?.name || '—';
        const t = String(item.type || '');

        if (t === 'folders') {
          const subRuta = pathPrefix ? `${pathPrefix}/${nombre}` : nombre;
          if (dto.incluirSubcarpetas) {
            cola.push({ id: item.id, ruta: subRuta });
          }
          rows.push({
            ruta: this.rutaCelda(pathPrefix),
            nombre,
            tipo: 'Carpeta',
            descripcion: this.descripcionDe(item),
            version: '—',
            modificado: fmtFecha(
              item.attributes?.lastModifiedTime || item.attributes?.createTime,
            ),
            atributosExtra: this.atributosStr(item, dto.incluirAtributosPersonalizados),
          });
        } else if (t === 'items') {
          const ver = this.versionDeItem(item, includedMap);
          const row: Fila & { _itemId?: string } = {
            ruta: this.rutaCelda(pathPrefix),
            nombre,
            tipo: 'Archivo',
            descripcion: this.descripcionDe(item),
            version: ver,
            modificado: fmtFecha(item.attributes?.lastModifiedTime),
            atributosExtra: this.atributosStr(item, dto.incluirAtributosPersonalizados),
          };
          if (ver === '—' && item.id) {
            row._itemId = item.id;
          }
          rows.push(row);
        }
      }
    }
    if (rows.length >= MAX_FILES || carpetasVisitadas >= MAX_CARPETAS) {
      truncated = true;
    }

    return { rows, truncated, carpetasVisitadas };
  }
}
