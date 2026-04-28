import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { MinioStorageService } from '../storage/minio-storage.service';
import type { IEvidenciaImageOptimizer } from '../../domain/services/evidencia-image-optimizer.interface';
import { EVIDENCIA_IMAGE_OPTIMIZER } from '../../domain/services/evidencia-image-optimizer.interface';
import {
  extensionDesdeArchivoEvidencia,
  objectKeyFromStoredFileUrl,
  slugifyPathSegment,
} from '../storage/storage-path.util';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const UPLOAD_DIR = 'uploads';

export interface SavedProfilePhotoMeta {
  url: string;
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: number;
}

@Injectable()
export class ProfilePhotoStorageService {
  private readonly logger = new Logger(ProfilePhotoStorageService.name);

  constructor(
    private readonly minioStorage: MinioStorageService,
    @Inject(EVIDENCIA_IMAGE_OPTIMIZER)
    private readonly imageOptimizer: IEvidenciaImageOptimizer,
  ) {}

  async save(
    userId: number,
    userDisplayName: string,
    file: Express.Multer.File,
  ): Promise<SavedProfilePhotoMeta> {
    if (!file?.buffer) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    const mime = file.mimetype?.toLowerCase() ?? '';
    if (!ALLOWED_MIMES.includes(mime)) {
      throw new BadRequestException(
        'Formato no permitido. Use JPEG, PNG o WebP.',
      );
    }

    const size = file.size ?? 0;
    if (size > MAX_SIZE_BYTES) {
      throw new BadRequestException('La imagen no debe superar 2 MB.');
    }

    const optimized = await this.imageOptimizer.optimizeForStorage({
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname || `perfil-${userId}.${this.getExtensionWithoutDot(mime)}`,
    });
    const ext = extensionDesdeArchivoEvidencia(
      optimized.originalname,
      optimized.mimetype,
    );
    const safeName = slugifyPathSegment(userDisplayName || `usuario-${userId}`, 80);
    const filename = `${userId}-Foto Perfil(1).${ext}`;
    const key = `archivos-generales/perfil/${userId}-${safeName}/${filename}`;

    const uploaded = await this.minioStorage.putObject({
      key,
      body: optimized.buffer,
      contentType: optimized.mimetype || undefined,
    });

    return {
      url: uploaded.publicUrl,
      nombreOriginal: filename,
      tipoMime: uploaded.contentType,
      tamanoBytes: uploaded.size,
    };
  }

  /**
   * Elimina un archivo de foto de perfil dado su path relativo (ej: profiles/1-123.jpg)
   */
  async delete(relativePath: string): Promise<void> {
    if (!relativePath) return;
    // MinIO/URL absoluta o clave relativa: intentar primero en almacenamiento S3-compatible.
    try {
      const bucket = this.minioStorage.getBucketName();
      const key = objectKeyFromStoredFileUrl(relativePath, bucket);
      if (key) {
        await this.minioStorage.deleteObject(key);
        return;
      }
    } catch (error) {
      this.logger.warn(
        `No se pudo eliminar foto en MinIO (${relativePath}), se intentará legacy: ${error}`,
      );
    }

    // Fallback legacy: fotos guardadas en disco local bajo uploads/profiles/*
    try {
      const absolutePath = join(process.cwd(), UPLOAD_DIR, relativePath);
      if (existsSync(absolutePath)) {
        await unlink(absolutePath);
        this.logger.log(`Archivo eliminado: ${relativePath}`);
      }
    } catch (error) {
      this.logger.warn(`No se pudo eliminar archivo ${relativePath}: ${error}`);
    }
  }

  private getExtensionWithoutDot(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    return map[mime] ?? 'jpg';
  }
}
