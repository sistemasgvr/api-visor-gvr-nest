import sharp from 'sharp';
import { rasterBufferToDocxRaster } from './raster-buffer-to-docx-raster';

describe('rasterBufferToDocxRaster', () => {
  it('rasterizes SVG evidence bytes even when stored with a .bin filename', async () => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="red"/></svg>',
    );

    const result = await rasterBufferToDocxRaster(svg, { maxEdgePx: 400 });

    expect(result).not.toBeNull();
    const metadata = await sharp(result!.buffer).metadata();
    expect(['png', 'jpg']).toContain(result!.mime);
    expect(['png', 'jpeg']).toContain(metadata.format);
    expect(metadata.width).toBe(400);
    expect(metadata.height).toBe(200);
    const { data } = await sharp(result!.buffer)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect(data[0]).toBeGreaterThan(240);
    expect(data[1]).toBeLessThan(15);
    expect(data[2]).toBeLessThan(15);
  });

  it('still converts raster evidence', async () => {
    const webp = await sharp({
      create: { width: 30, height: 20, channels: 3, background: 'blue' },
    })
      .webp()
      .toBuffer();
    const result = await rasterBufferToDocxRaster(webp);
    expect(result).not.toBeNull();
    const metadata = await sharp(result!.buffer).metadata();
    expect(metadata.width).toBe(30);
    expect(metadata.height).toBe(20);
  });

  it('returns null for invalid image data so the export can retain its link', async () => {
    expect(
      await rasterBufferToDocxRaster(Buffer.from('invalid image')),
    ).toBeNull();
  });
});
