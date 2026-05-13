import sharp from 'sharp';

export type DocxRasterMime = 'png' | 'jpg';

export type RasterBufferToDocxRasterResult = {
  buffer: Buffer;
  mime: DocxRasterMime;
};

export type RasterBufferToDocxRasterOptions = {
  /** Misma magnitud que evidencias en almacenamiento (evita explosión de memoria). */
  limitInputPixels?: number;
  /** Borde máximo (px) del lado largo tras `fit: inside`. */
  maxEdgePx?: number;
  jpegQuality?: number;
};

const DEFAULT_LIMIT_INPUT_PIXELS = 100_000_000;
/** Borde máximo del raster embebido (capturas de laptop suelen ser ≥1366 px de ancho). */
const DEFAULT_MAX_EDGE_PX = 2400;
const DEFAULT_JPEG_QUALITY = 86;

const DEFAULT_DOCX_DISPLAY_MAX_W = 640;
const DEFAULT_DOCX_DISPLAY_MAX_H = 480;

export type RasterBufferDocxDisplayOptions = {
  maxDisplayWidth?: number;
  maxDisplayHeight?: number;
};

/**
 * Tamaño en el documento Word (mismas unidades que `ImageRun.transformation`),
 * manteniendo proporción para capturas anchas (16:9, etc.).
 */
export async function rasterBufferDocxDisplayTransformation(
  buffer: Buffer,
  options?: RasterBufferDocxDisplayOptions,
): Promise<{ width: number; height: number }> {
  const maxW = options?.maxDisplayWidth ?? DEFAULT_DOCX_DISPLAY_MAX_W;
  const maxH = options?.maxDisplayHeight ?? DEFAULT_DOCX_DISPLAY_MAX_H;
  try {
    const meta = await sharp(buffer).metadata();
    const w = meta.width;
    const h = meta.height;
    if (!w || !h || w < 1 || h < 1) {
      return { width: maxW, height: Math.round((maxW * 9) / 16) };
    }
    const scale = Math.min(maxW / w, maxH / h, 1);
    return {
      width: Math.max(1, Math.round(w * scale)),
      height: Math.max(1, Math.round(h * scale)),
    };
  } catch {
    return { width: maxW, height: Math.round((maxW * 9) / 16) };
  }
}

/**
 * Convierte con sharp (WebP, PNG, JPEG, etc.) a PNG o JPEG compatible con Word/docx.
 * Canal alfa → PNG; si no → JPEG.
 */
export async function rasterBufferToDocxRaster(
  buffer: Buffer,
  options?: RasterBufferToDocxRasterOptions,
): Promise<RasterBufferToDocxRasterResult | null> {
  const limitInputPixels =
    options?.limitInputPixels ?? DEFAULT_LIMIT_INPUT_PIXELS;
  const maxEdgePx = options?.maxEdgePx ?? DEFAULT_MAX_EDGE_PX;
  const jpegQuality = options?.jpegQuality ?? DEFAULT_JPEG_QUALITY;

  try {
    const sharpOpts = {
      limitInputPixels,
      sequentialRead: true as const,
      pages: 1,
      animated: false,
      page: 0,
    };
    const meta = await sharp(buffer, sharpOpts).metadata();
    if (!meta.format) return null;
    if (meta.format === 'svg' || meta.format === 'pdf') return null;

    const pipeline = sharp(buffer, sharpOpts)
      .rotate()
      .resize({
        width: maxEdgePx,
        height: maxEdgePx,
        fit: 'inside',
        withoutEnlargement: true,
      });

    if (meta.hasAlpha) {
      const out = await pipeline.png({ compressionLevel: 7 }).toBuffer();
      return out.length > 0 ? { buffer: out, mime: 'png' } : null;
    }
    const out = await pipeline
      .jpeg({ quality: jpegQuality, mozjpeg: true })
      .toBuffer();
    return out.length > 0 ? { buffer: out, mime: 'jpg' } : null;
  } catch {
    return null;
  }
}
