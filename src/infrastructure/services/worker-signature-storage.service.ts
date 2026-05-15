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

export interface SavedWorkerSignatureMeta {
  url: string;
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: number;
}

@Injectable()
export class WorkerSignatureStorageService {
  private readonly logger = new Logger(WorkerSignatureStorageService.name);

  constructor(
    private readonly minioStorage: MinioStorageService,
    @Inject(EVIDENCIA_IMAGE_OPTIMIZER)
    private readonly imageOptimizer: IEvidenciaImageOptimizer,
  ) {}

  async save(
    trabajadorId: number,
    workerDisplayName: string,
    file: Express.Multer.File,
  ): Promise<SavedWorkerSignatureMeta> {
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
      originalname:
        file.originalname ||
        `firma-${trabajadorId}.${this.getExtensionWithoutDot(mime)}`,
    });
    const ext = extensionDesdeArchivoEvidencia(
      optimized.originalname,
      optimized.mimetype,
    );
    const safeName = slugifyPathSegment(
      workerDisplayName || `trabajador-${trabajadorId}`,
      80,
    );
    const filename = `${trabajadorId}-Firma(1).${ext}`;
    const key = `archivos-generales/firma/${trabajadorId}-${safeName}/${filename}`;

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

  async delete(relativePath: string): Promise<void> {
    if (!relativePath) return;
    try {
      const bucket = this.minioStorage.getBucketName();
      const key = objectKeyFromStoredFileUrl(relativePath, bucket);
      if (key) {
        await this.minioStorage.deleteObject(key);
        return;
      }
    } catch (error) {
      this.logger.warn(
        `No se pudo eliminar firma en MinIO (${relativePath}), se intentará legacy: ${error}`,
      );
    }

    try {
      const absolutePath = join(process.cwd(), UPLOAD_DIR, relativePath);
      if (existsSync(absolutePath)) {
        await unlink(absolutePath);
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
