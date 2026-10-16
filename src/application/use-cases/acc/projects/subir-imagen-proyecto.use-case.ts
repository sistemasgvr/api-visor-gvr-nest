import {
  InvalidInputError,
  TooLargeError,
} from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';
import { ApplicationSettingsPort } from '../../../ports/runtime.port';
import type { UploadedFile } from '../../../ports/uploaded-file';

import { SharpAccProjectImagePreparerPort } from '../../../ports/sharp-acc-project-image-preparer.port';

import { type IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';

export class SubirImagenProyectoUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskAdminPort,
    private readonly accProjectImagePreparer: SharpAccProjectImagePreparerPort,

    private readonly auditoriaRepository: IAuditoriaRepository,
    private readonly settings: ApplicationSettingsPort,
  ) {}

  async execute(
    accountId: string,
    projectId: string,
    file: UploadedFile,
    token?: string,
    userId?: string | number,
    ipAddress?: string,
    userAgent?: string,
    userRole?: string,
  ): Promise<any> {
    if (!file) {
      throw new InvalidInputError('El archivo de imagen es requerido');
    }

    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/bmp',
      'image/gif',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new InvalidInputError(
        'Tipo de archivo no soportado. Use: PNG, JPEG, JPG, BMP o GIF',
      );
    }

    const maxBytes = this.settings.getAccProjectImageMaxBytes();
    const prepared = await this.accProjectImagePreparer.prepareForAcc(
      file,
      maxBytes,
    );

    if (prepared.size > maxBytes) {
      throw new TooLargeError(
        `Tras optimizar la imagen aún supera ${this.settings.getAccProjectImageMaxLabel()} (límite del servicio de Autodesk). Pruebe con otra imagen o menor resolución.`,
      );
    }

    const fileForAcc: UploadedFile = {
      ...file,
      buffer: prepared.buffer,
      size: prepared.size,
      mimetype: prepared.mimetype,
      originalname: prepared.originalname,
    };

    const resultado = await this.autodeskApiService.uploadAccProjectImage(
      accountId,
      projectId,
      fileForAcc,
      token,
    );

    // Registrar auditoría si la imagen se subió exitosamente
    // Obtener userId numérico para auditoría
    let numericUserId: number | null = null;
    if (userId) {
      if (typeof userId === 'number') {
        numericUserId = userId;
      } else if (typeof userId === 'string') {
        const parsed = parseInt(userId, 10);
        if (!isNaN(parsed) && parsed > 0) {
          numericUserId = parsed;
        }
      }
    }

    if (resultado && numericUserId && ipAddress && userAgent) {
      try {
        await this.auditoriaRepository.registrarAccion(
          numericUserId,
          'PROJECT_IMAGE_UPLOAD',
          'project',
          null,
          `Imagen de proyecto subida: ${projectId}`,
          null,
          {
            projectId,
            accountId,
            fileName: file.originalname,
            fileSizeOriginal: file.size,
            fileSizeSentAcc: prepared.size,
            mimeTypeSentAcc: prepared.mimetype || 'unknown',
          },
          ipAddress,
          userAgent,
          {
            accountId,
            accProjectId: projectId,
            rol: userRole || null,
          },
        );
      } catch (error) {
        // No fallar la operación si la auditoría falla
        console.error(
          'Error registrando auditoría de subida de imagen de proyecto:',
          error,
        );
      }
    }

    return resultado;
  }
}
