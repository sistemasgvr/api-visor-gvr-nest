import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  ActivityDocumentsPort,
  type ReporteActividadesPrimeraPaginaInput,
} from '../../application/ports/activity-documents.port';
import { MinioStorageService } from '../storage/minio-storage.service';
import { rasterBufferToDocxRaster } from '../images/raster-buffer-to-docx-raster';
import { buildReporteActividadesPrimeraPaginaBuffer } from './reporte-actividades-docx';
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
@Injectable()
export class ActivityDocumentsAdapter extends ActivityDocumentsPort {
  constructor(private readonly storage: MinioStorageService) {
    super();
  }
  loadImage(stored: string, options?: { maxEdgePx?: number }) {
    return fetchLogoBufferParaDocx(this.storage, stored, options);
  }
  render(input: ReporteActividadesPrimeraPaginaInput) {
    return buildReporteActividadesPrimeraPaginaBuffer(input);
  }
}
