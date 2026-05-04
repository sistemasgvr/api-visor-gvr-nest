import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';

const MAX_INPUT_PIXELS = 100_000_000;

export interface PreparedAccProjectImage {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

@Injectable()
export class SharpAccProjectImagePreparerService {
  private readonly logger = new Logger(SharpAccProjectImagePreparerService.name);
  private readonly enabled: boolean;
  private readonly maxEdgeStart: number;

  constructor(private readonly config: ConfigService) {
    this.enabled =
      (this.config.get<string>('ACC_PROJECT_IMAGE_OPTIMIZE') ?? 'true')
        .toLowerCase() !== 'false';
    const edge = parseInt(
      this.config.get<string>('ACC_PROJECT_IMAGE_MAX_EDGE_PX') ?? '',
      10,
    );
    this.maxEdgeStart = Number.isFinite(edge)
      ? Math.min(4096, Math.max(320, edge))
      : 1920;
  }

  /**
   * Redimensiona y recompone la imagen para acercarse al límite que tolera el gateway de Autodesk.
   * Salida siempre `image/jpeg` o `image/png` (aceptados por la API HQ).
   */
  async prepareForAcc(
    file: Express.Multer.File,
    targetMaxBytes: number,
  ): Promise<PreparedAccProjectImage> {
    const name0 = (file.originalname ?? 'imagen').trim() || 'imagen';
    const buffer = file.buffer;
    if (!buffer?.length) {
      throw new BadRequestException('El archivo de imagen está vacío');
    }

    if (!this.enabled) {
      return {
        buffer,
        mimetype: file.mimetype,
        originalname: name0,
        size: buffer.length,
      };
    }

    let meta: sharp.Metadata;
    try {
      meta = await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
    } catch {
      throw new BadRequestException(
        'No se pudo leer la imagen. Verifique que el archivo no esté dañado.',
      );
    }

    const format = meta.format;
    if (!format) {
      throw new BadRequestException('Formato de imagen no reconocido');
    }
    if (format === 'svg') {
      throw new BadRequestException('SVG no está soportado para la imagen de proyecto');
    }

    /** Siempre re-encode: el gateway de ACC suele ser <~1 MB; un JPEG “pequeño” en disco aún puede superarlo sin recomponer. */

    const pages = meta.pages ?? 1;
    const useGifFirstFrame = format === 'gif' && pages > 1;
    const hasAlpha = !!meta.hasAlpha;

    try {
      const encoded = await this.encodeUnderLimit(
        buffer,
        targetMaxBytes,
        name0,
        useGifFirstFrame,
        hasAlpha,
      );
      if (encoded.buffer.length <= targetMaxBytes) {
        return {
          buffer: encoded.buffer,
          mimetype: encoded.mimetype,
          originalname: encoded.originalname,
          size: encoded.buffer.length,
        };
      }
    } catch (e) {
      this.logger.warn('ACC imagen proyecto: error al optimizar con Sharp');
      this.logger.debug(e);
    }

    if (buffer.length <= targetMaxBytes) {
      return {
        buffer,
        mimetype: file.mimetype,
        originalname: name0,
        size: buffer.length,
      };
    }

    return {
      buffer,
      mimetype: file.mimetype,
      originalname: name0,
      size: buffer.length,
    };
  }

  private async encodeUnderLimit(
    buffer: Buffer,
    targetMaxBytes: number,
    originalname: string,
    gifFirstFrameOnly: boolean,
    hasAlpha: boolean,
  ): Promise<{ buffer: Buffer; mimetype: string; originalname: string }> {
    const edges = this.buildEdgeSteps();
    const jpegQualities = [86, 80, 74, 68, 62, 56, 50, 44, 38, 32, 28, 24];

    for (const edge of edges) {
      const pipelineBase = () =>
        sharp(buffer, {
          limitInputPixels: MAX_INPUT_PIXELS,
          animated: false,
          ...(gifFirstFrameOnly ? { pages: 1 } : {}),
        })
          .rotate()
          .resize({
            width: edge,
            height: edge,
            fit: 'inside',
            withoutEnlargement: true,
          });

      if (hasAlpha) {
        for (const compressionLevel of [9, 8, 7, 6]) {
          const buf = await pipelineBase()
            .clone()
            .png({ compressionLevel, adaptiveFiltering: true })
            .toBuffer();
          if (buf.length <= targetMaxBytes) {
            return {
              buffer: buf,
              mimetype: 'image/png',
              originalname: this.replaceExt(originalname, 'png'),
            };
          }
        }

        for (const q of jpegQualities) {
          const buf = await pipelineBase()
            .clone()
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .jpeg({ quality: q, mozjpeg: true, chromaSubsampling: '4:2:0' })
            .toBuffer();
          if (buf.length <= targetMaxBytes) {
            return {
              buffer: buf,
              mimetype: 'image/jpeg',
              originalname: this.replaceExt(originalname, 'jpg'),
            };
          }
        }
      } else {
        for (const q of jpegQualities) {
          const buf = await pipelineBase()
            .clone()
            .jpeg({ quality: q, mozjpeg: true, chromaSubsampling: '4:2:0' })
            .toBuffer();
          if (buf.length <= targetMaxBytes) {
            return {
              buffer: buf,
              mimetype: 'image/jpeg',
              originalname: this.replaceExt(originalname, 'jpg'),
            };
          }
        }
      }
    }

    let last = sharp(buffer, {
      limitInputPixels: MAX_INPUT_PIXELS,
      animated: false,
      ...(gifFirstFrameOnly ? { pages: 1 } : {}),
    })
      .rotate()
      .resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true });
    if (hasAlpha) {
      last = last.flatten({ background: { r: 255, g: 255, b: 255 } });
    }
    let buf = await last
      .jpeg({ quality: 26, mozjpeg: true, chromaSubsampling: '4:2:0' })
      .toBuffer();

    if (buf.length > targetMaxBytes) {
      buf = await sharp(buf)
        .resize({ width: 320, height: 320, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 22, mozjpeg: true, chromaSubsampling: '4:2:0' })
        .toBuffer();
    }

    return {
      buffer: buf,
      mimetype: 'image/jpeg',
      originalname: this.replaceExt(originalname, 'jpg'),
    };
  }

  private buildEdgeSteps(): number[] {
    const steps = new Set<number>();
    let e = this.maxEdgeStart;
    const mins = [1600, 1280, 1024, 800, 640, 512, 448, 384, 320];
    steps.add(e);
    for (const m of mins) {
      if (m < e) {
        steps.add(m);
      }
    }
    return [...steps].sort((a, b) => b - a);
  }

  private replaceExt(filename: string, extWithoutDot: string): string {
    const base = (filename || 'imagen').replace(/[/\\]/g, '');
    const t = extWithoutDot.replace(/^\./, '').toLowerCase();
    if (!base.includes('.')) {
      return `${base}.${t}`;
    }
    return base.replace(/\.[a-zA-Z0-9]{1,12}$/, '') + '.' + t;
  }
}
