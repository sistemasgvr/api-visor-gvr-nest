import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { rasterBufferToDocxRaster } from '../../../infrastructure/images/raster-buffer-to-docx-raster';
import { MinioStorageService } from '../../../infrastructure/storage/minio-storage.service';
import { buildReporteActividadesPrimeraPaginaBuffer } from '../../../infrastructure/word/reporte-actividades-docx';

export type ExportarActividadesJornadasWordInput = {
  idTrabajador: number;
  fechaInicio?: string;
  fechaFin?: string;
  /** YYYY-MM-DD; define el año del eslogan (genconfiguraciongeneral). Por defecto hoy. */
  fechaEmision?: string;
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

function sniffPngJpeg(buf: Buffer): 'png' | 'jpg' | null {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) return 'jpg';
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return 'png';
  }
  return null;
}

/**
 * Descarga el logo con URL firmada si el archivo está en nuestro MinIO (bucket privado);
 * convierte WebP u otros raster a PNG/JPEG para el encabezado del .docx.
 */
async function fetchLogoBufferParaDocx(
  minioStorage: MinioStorageService,
  stored: string,
  options?: { maxEdgePx?: number },
): Promise<{ buffer: Buffer; mime: 'png' | 'jpg' } | null> {
  const raw = (stored ?? '').trim();
  if (!raw) return null;
  try {
    const url = await minioStorage.resolveViewUrlForEvidenciaStoredUrl(raw);
    const res = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      timeout: 20_000,
      maxContentLength: 2_500_000,
      validateStatus: (s) => s >= 200 && s < 400,
    });
    const buf = Buffer.from(res.data);
    if (buf.length === 0) return null;

    const converted = await rasterBufferToDocxRaster(buf, {
      maxEdgePx: options?.maxEdgePx ?? 640,
    });
    if (converted) {
      return { buffer: converted.buffer, mime: converted.mime };
    }

    const ct = String(res.headers['content-type'] || '').toLowerCase();
    if (ct.includes('jpeg') || ct.includes('jpg')) {
      return { buffer: buf, mime: 'jpg' };
    }
    if (ct.includes('png')) {
      return { buffer: buf, mime: 'png' };
    }
    const sniffed = sniffPngJpeg(buf);
    return sniffed ? { buffer: buf, mime: sniffed } : null;
  } catch {
    return null;
  }
}

/**
 * Genera un .docx del reporte de actividades: portada del informe de servicio y,
 * tras salto de página, registro detallado por actividad (modalidad, horas, estado, descripción).
 */
@Injectable()
export class ExportarActividadesJornadasWordUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
    private readonly minioStorage: MinioStorageService,
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
      throw new NotFoundException(
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
      const logo = await fetchLogoBufferParaDocx(this.minioStorage, urlLogo);
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
      const firma = await fetchLogoBufferParaDocx(this.minioStorage, urlFirma, {
        maxEdgePx: 420,
      });
      if (firma) {
        firmaBuffer = firma.buffer;
        firmaMime = firma.mime;
      }
    }

    const buffer = await buildReporteActividadesPrimeraPaginaBuffer({
      row,
      fechaInicioYmd: fi,
      fechaFinYmd: ff,
      fechaEmisionYmd: fechaEmision,
      actividadesDetalle,
      logoBuffer,
      logoMime,
      firmaBuffer,
      firmaMime,
    });

    const safe = (s: string) =>
      String(s || '')
        .replace(/[/\\?%*:|"<>]/g, '-')
        .trim() || 'sin-fecha';
    const fileName = `Reporte_actividades_${input.idTrabajador}_${safe(fi)}_${safe(ff)}.docx`;

    return { buffer, fileName };
  }
}
