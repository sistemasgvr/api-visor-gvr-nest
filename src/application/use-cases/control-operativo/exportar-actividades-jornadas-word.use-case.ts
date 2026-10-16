import { NotFoundError } from '../../errors/application.error';
import { ActivityDocumentsPort } from '../../ports/activity-documents.port';

import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';

export type ExportarActividadesJornadasWordInput = {
  idTrabajador: number;
  fechaInicio?: string;
  fechaFin?: string;
  /** YYYY-MM-DD; define el año del eslogan (genconfiguraciongeneral). Por defecto hoy. */
  fechaEmision?: string;
  /** Solo roles administrativos (ver constantes); por defecto false (no horas en Word). */
  incluirHorasDedicadasEnWord?: boolean;
};

function anioDesdeYmd(ymd: string): number {
  const y = parseInt(String(ymd).trim().slice(0, 4), 10);
  if (!Number.isFinite(y) || y < 1990 || y > 2100) {
    return new Date().getFullYear();
  }
  return y;
}

function defaultPeriodoMesActual(): { ini: string; fin: string } {
  const t = new Date();
  const y = t.getFullYear();
  const m = t.getMonth() + 1;
  const last = new Date(y, m, 0).getDate();
  const p = (n: number) => String(n).padStart(2, '0');
  return { ini: `${y}-${p(m)}-01`, fin: `${y}-${p(m)}-${p(last)}` };
}

function todayYmd(): string {
  const t = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
}

/** YYYY-MM-DD (flexible) → YYYYMMDD para nombres de archivo compactos. */
export function compactoYmdDesdeTexto(ymd: string): string {
  const d = String(ymd ?? '').replace(/\D/g, '');
  return d.length >= 8 ? d.slice(0, 8) : '00000000';
}

function safeSegmentNombreArchivo(s: string): string {
  const t = String(s || '')
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .trim()
    .replace(/^\.+/, '');
  return t || 'x';
}

function buildNombreArchivoReporteActividadesWord(params: {
  nrodocumento: string | null | undefined;
  nombreCompleto: string | null | undefined;
  fechaInicioYmd: string;
  fechaFinYmd: string;
}): string {
  const doc = String(params.nrodocumento ?? '').trim();
  const dniSeg = safeSegmentNombreArchivo(doc !== '' ? doc : 'SIN-DOC');
  const nombreSeg = safeSegmentNombreArchivo(
    String(params.nombreCompleto ?? '').trim() || 'colaborador',
  ).slice(0, 100);
  const rango = `${compactoYmdDesdeTexto(params.fechaInicioYmd)}-${compactoYmdDesdeTexto(params.fechaFinYmd)}`;
  return `${dniSeg}-${nombreSeg}_${rango}.docx`;
}

/**
 * Descarga el logo con URL firmada si el archivo está en nuestro MinIO (bucket privado);
 * convierte WebP u otros raster a PNG/JPEG para el encabezado del .docx.
 */

/**
 * Genera un .docx del reporte de actividades: portada del informe de servicio y,
 * tras salto de página, registro detallado por actividad (modalidad, horas, estado, descripción).
 */

export class ExportarActividadesJornadasWordUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
    private readonly documents: ActivityDocumentsPort,
  ) {}

  async execute(
    input: ExportarActividadesJornadasWordInput,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const def = defaultPeriodoMesActual();
    const fi = (input.fechaInicio && input.fechaInicio.trim()) || def.ini;
    const ff = (input.fechaFin && input.fechaFin.trim()) || def.fin;
    const fechaEmision =
      (input.fechaEmision && input.fechaEmision.trim()) || todayYmd();
    const anioInforme = anioDesdeYmd(fechaEmision);

    const row =
      await this.controlOperativoRepository.obtenerDatosReporteActividades(
        input.idTrabajador,
        anioInforme,
      );
    if (!row) {
      throw new NotFoundError(
        'No se encontraron datos del trabajador para el informe de servicio',
      );
    }

    const actividadesDetalle =
      await this.controlOperativoRepository.listarActividadesPeriodoReporte(
        input.idTrabajador,
        fi,
        ff,
      );

    let logoBuffer: Buffer | null = null;
    let logoMime: 'png' | 'jpg' | null = null;
    const urlLogo = row.urllogo != null ? String(row.urllogo).trim() : '';
    if (urlLogo) {
      const logo = await this.documents.loadImage(urlLogo);
      if (logo) {
        logoBuffer = logo.buffer;
        logoMime = logo.mime;
      }
    }

    let firmaBuffer: Buffer | null = null;
    let firmaMime: 'png' | 'jpg' | null = null;
    const urlFirma =
      row.url_firma_trabajador != null
        ? String(row.url_firma_trabajador).trim()
        : '';
    if (urlFirma) {
      const firma = await this.documents.loadImage(urlFirma, {
        maxEdgePx: 420,
      });
      if (firma) {
        firmaBuffer = firma.buffer;
        firmaMime = firma.mime;
      }
    }

    const buffer = await this.documents.render({
      row,
      fechaInicioYmd: fi,
      fechaFinYmd: ff,
      fechaEmisionYmd: fechaEmision,
      actividadesDetalle,
      logoBuffer,
      logoMime,
      firmaBuffer,
      firmaMime,
      incluirHorasDedicadasEnDetalle:
        input.incluirHorasDedicadasEnWord === true,
    });

    const fileName = buildNombreArchivoReporteActividadesWord({
      nrodocumento: row.nrodocumento,
      nombreCompleto: row.nombrecompletotrabajador,
      fechaInicioYmd: fi,
      fechaFinYmd: ff,
    });

    return { buffer, fileName };
  }
}
