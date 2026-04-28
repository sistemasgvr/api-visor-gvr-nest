import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import type {
  IEvidenciaImageOptimizer,
  EvidenciaImageOptimizerInput,
  EvidenciaImageOptimizerResult,
} from '../../domain/services/evidencia-image-optimizer.interface';

const DEFAULT_MAX_EDGE = 2560;
const DEFAULT_WEBP_QUALITY = 82;
/** 0 (rápido) - 6 (más lento, menos peso). */
const DEFAULT_WEBP_EFFORT = 5;
/** píxeles máximos de entrada (evita explosión de memoria). */
const MAX_INPUT_PIXELS = 100_000_000;

@Injectable()
export class SharpEvidenciaImageOptimizerService
  implements IEvidenciaImageOptimizer
{
  private readonly logger = new Logger(SharpEvidenciaImageOptimizerService.name);
  private readonly enabled: boolean;
  private readonly maxEdge: number;
  private readonly webpQ: number;
  /** 1-6, recomendado 4-5. */
  private readonly webpEffort: number;

  constructor(private readonly config: ConfigService) {
    this.enabled =
      (this.config.get<string>('EVIDENCIA_IMAGE_OPTIMIZE') ?? 'true')
        .toLowerCase() !== 'false';
    const me = parseInt(
      this.config.get<string>('EVIDENCIA_IMAGE_MAX_EDGE_PX') ?? '',
      10,
    );
    this.maxEdge = Number.isFinite(me)
      ? Math.min(8192, Math.max(256, me))
      : DEFAULT_MAX_EDGE;
    const wq = parseInt(
      this.config.get<string>('EVIDENCIA_WEBP_QUALITY') ?? '',
      10,
    );
    this.webpQ = Number.isFinite(wq)
      ? Math.min(100, Math.max(40, wq))
      : DEFAULT_WEBP_QUALITY;
    const we = parseInt(
      this.config.get<string>('EVIDENCIA_WEBP_EFFORT') ?? '',
      10,
    );
    this.webpEffort = Number.isFinite(we)
      ? Math.min(6, Math.max(0, we))
      : DEFAULT_WEBP_EFFORT;
  }

  /**
   * Convierte imágenes raster a **WebP** (mantiene canal alfa vía WebP);
   * SVG, GIF animado, no-imagen, u error → sin cambios.
   */
  async optimizeForStorage(
    input: EvidenciaImageOptimizerInput,
  ): Promise<EvidenciaImageOptimizerResult> {
    const { buffer, mimetype, originalname } = input;
    const name0 = (originalname ?? 'archivo').trim() || 'archivo';
    if (!this.enabled || !buffer?.length) {
      return { buffer, mimetype, originalname: name0 };
    }
    const mt = (mimetype || '').toLowerCase();
    if (!mt.startsWith('image/')) {
      return { buffer, mimetype, originalname: name0 };
    }
    if (mt === 'image/svg+xml' || /svg/i.test(mimetype)) {
      return { buffer, mimetype, originalname: name0 };
    }

    let meta: sharp.Metadata;
    try {
      meta = await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
    } catch (e) {
      this.logger.warn(
        'Evidencia: metadatos de imagen no legibles; se mantiene original',
      );
      this.logger.debug(e);
      return { buffer, mimetype, originalname: name0 };
    }

    const format = meta.format;
    if (!format) {
      return { buffer, mimetype, originalname: name0 };
    }
    if (format === 'gif' && (meta.pages ?? 1) > 1) {
      return { buffer, mimetype, originalname: name0 };
    }

    try {
      const base = sharp(buffer, {
        limitInputPixels: MAX_INPUT_PIXELS,
        page: 0,
        pages: 1,
        animated: false,
        sequentialRead: true,
      }).rotate();
      const resized = base.resize({
        width: this.maxEdge,
        height: this.maxEdge,
        fit: 'inside',
        withoutEnlargement: true,
      });
      const out = await resized
        .webp({
          quality: this.webpQ,
          effort: this.webpEffort,
          smartSubsample: true,
          alphaQuality: 100,
        })
        .toBuffer();
      const outMime = 'image/webp';
      const newName = this.replaceFileExtension(name0, 'webp');

      if (out.length >= buffer.length) {
        return { buffer, mimetype, originalname: name0 };
      }
      return { buffer: out, mimetype: outMime, originalname: newName };
    } catch (e) {
      this.logger.warn('Evidencia: error al optimizar imagen; se mantiene original');
      this.logger.debug(e);
      return { buffer, mimetype, originalname: name0 };
    }
  }

  private replaceFileExtension(filename: string, extWithoutDot: string): string {
    const base = (filename || 'archivo').replace(/[/\\]/g, '');
    const t = extWithoutDot.replace(/^\./, '').toLowerCase();
    if (!base.includes('.')) {
      return `${base}.${t}`;
    }
    return base.replace(/\.[a-zA-Z0-9]{1,12}$/, '') + '.' + t;
  }
}
