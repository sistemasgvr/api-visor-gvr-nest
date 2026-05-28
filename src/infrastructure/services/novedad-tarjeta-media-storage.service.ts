import {
  Injectable,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MinioStorageService } from '../storage/minio-storage.service';
import type { IEvidenciaImageOptimizer } from '../../domain/services/evidencia-image-optimizer.interface';
import { EVIDENCIA_IMAGE_OPTIMIZER } from '../../domain/services/evidencia-image-optimizer.interface';
import {
  extensionDesdeArchivoEvidencia,
  objectKeyFromStoredFileUrl,
  sanitizeFilename,
} from '../storage/storage-path.util';

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_NOVEDAD_TARJETA_MEDIA_BYTES = 20 * 1024 * 1024;

export interface SavedNovedadTarjetaMedia {
  url: string;
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: number;
}

@Injectable()
export class NovedadTarjetaMediaStorageService {
  constructor(
    private readonly minioStorage: MinioStorageService,
    @Inject(EVIDENCIA_IMAGE_OPTIMIZER)
    private readonly imageOptimizer: IEvidenciaImageOptimizer,
  ) {}

  async save(
    idLanzamiento: number,
    tipoMultimedia: 'imagen' | 'video',
    file: Express.Multer.File,
  ): Promise<SavedNovedadTarjetaMedia> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    const mime = (file.mimetype ?? '').toLowerCase();
    const prefix = `novedades/lanzamientos/${idLanzamiento}`;

    if (tipoMultimedia === 'imagen') {
      if (!IMAGE_MIMES.includes(mime)) {
        throw new BadRequestException(
          'Formato de imagen no permitido. Use JPEG, PNG, WebP o GIF.',
        );
      }
      if ((file.size ?? 0) > MAX_NOVEDAD_TARJETA_MEDIA_BYTES) {
        throw new BadRequestException('La imagen no debe superar 20 MB.');
      }

      /** GIF: conservar animación y formato (no convertir a WebP). */
      if (mime === 'image/gif') {
        const base = sanitizeFilename(file.originalname || 'imagen.gif');
        const filename = `tarjeta-${Date.now()}-${randomUUID().slice(0, 8)}-${base}`;
        const uploaded = await this.minioStorage.uploadUnderPrefix({
          prefix,
          file,
          filename,
        });
        return {
          url: uploaded.publicUrl,
          nombreOriginal: file.originalname || 'imagen.gif',
          tipoMime: mime,
          tamanoBytes: uploaded.size,
        };
      }

      const optimized = await this.imageOptimizer.optimizeForStorage({
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname || 'imagen',
      });
      const ext = extensionDesdeArchivoEvidencia(
        optimized.originalname,
        optimized.mimetype,
      );
      const filename = `tarjeta-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
      const uploaded = await this.minioStorage.putObject({
        key: `${prefix}/${filename}`,
        body: optimized.buffer,
        contentType: optimized.mimetype || mime,
      });
      return {
        url: uploaded.publicUrl,
        nombreOriginal: optimized.originalname || file.originalname || 'imagen',
        tipoMime: optimized.mimetype || mime,
        tamanoBytes: uploaded.size,
      };
    }

    if (!VIDEO_MIMES.includes(mime)) {
      throw new BadRequestException(
        'Formato de video no permitido. Use MP4, WebM o MOV.',
      );
    }
    if ((file.size ?? 0) > MAX_NOVEDAD_TARJETA_MEDIA_BYTES) {
      throw new BadRequestException('El video no debe superar 20 MB.');
    }

    const base = sanitizeFilename(file.originalname || 'video');
    const filename = `tarjeta-${Date.now()}-${randomUUID().slice(0, 8)}-${base}`;
    const uploaded = await this.minioStorage.uploadUnderPrefix({
      prefix,
      file,
      filename,
    });
    return {
      url: uploaded.publicUrl,
      nombreOriginal: file.originalname || 'video',
      tipoMime: mime,
      tamanoBytes: uploaded.size,
    };
  }

  async deleteByStoredUrl(url: string): Promise<void> {
    if (!url?.trim()) return;
    try {
      const bucket = this.minioStorage.getBucketName();
      const key = objectKeyFromStoredFileUrl(url, bucket);
      if (key) await this.minioStorage.deleteObject(key);
    } catch {
      /* no bloquear rollback por fallo de borrado */
    }
  }
}
