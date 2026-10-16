import {
  ForbiddenError,
  InvalidInputError,
} from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';
import { ApplicationSettingsPort } from '../../../ports/runtime.port';

import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { IniciarSubidaChunkedDto } from '../../../inputs/data-management/items/iniciar-subida-chunked.dto';

export class IniciarSubidaChunkedUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,
    private readonly settings: ApplicationSettingsPort,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    dto: IniciarSubidaChunkedDto,
  ) {
    if (!projectId) {
      throw new InvalidInputError('El ID del proyecto es requerido');
    }
    if (!dto.folderId || !dto.fileName) {
      throw new InvalidInputError('folderId y fileName son requeridos');
    }
    if (!Number.isFinite(dto.fileSize) || dto.fileSize < 1) {
      throw new InvalidInputError('fileSize debe ser mayor a cero');
    }

    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(userId);
    if (!token) {
      throw new ForbiddenError(
        'No se encontró token de acceso. Autoriza Autodesk primero.',
      );
    }
    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new ForbiddenError('El token de Autodesk ha expirado.');
    }

    const projectIdNorm = projectId.startsWith('b.')
      ? projectId
      : `b.${projectId}`;
    const storageResult = await this.autodeskApiService.crearStorageParaItem(
      token.tokenAcceso,
      projectIdNorm,
      dto.folderId,
      dto.fileName,
    );
    const storageId = storageResult?.data?.id as string | undefined;
    if (!storageId) {
      throw new InvalidInputError('No se pudo obtener el storage ID');
    }

    const storageIdMatch = storageId.match(
      /urn:adsk\.objects:os\.object:([^\/]+)\/(.+)/,
    );
    if (!storageIdMatch || storageIdMatch.length !== 3) {
      throw new InvalidInputError(
        `Formato de storage ID inválido: ${storageId}`,
      );
    }
    const bucketKey = storageIdMatch[1];
    const objectKey = storageIdMatch[2];

    const partSizeBytes =
      dto.partSizeBytes && dto.partSizeBytes > 0
        ? dto.partSizeBytes
        : this.settings.docsChunkSizeBytes;
    const totalParts = Math.max(1, Math.ceil(dto.fileSize / partSizeBytes));
    const firstBatchParts = Math.min(
      this.settings.docsChunkSignedUrlBatch,
      totalParts,
    );

    const signedResult = await this.autodeskApiService.obtenerUrlFirmadaS3(
      token.tokenAcceso,
      bucketKey,
      objectKey,
      firstBatchParts,
      { firstPart: 1, minutesExpiration: 10 },
    );
    if (!signedResult?.urls?.length || !signedResult?.uploadKey) {
      throw new InvalidInputError('No se pudieron generar URLs de subida');
    }

    return {
      storageId,
      bucketKey,
      objectKey,
      uploadKey: signedResult.uploadKey as string,
      partSizeBytes,
      totalParts,
      firstPart: 1,
      urls: signedResult.urls as string[],
    };
  }
}
