import {
  ForbiddenError,
  InvalidInputError,
} from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';
import { ApplicationSettingsPort } from '../../../ports/runtime.port';

import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { ObtenerUrlsSubidaChunkedDto } from '../../../inputs/data-management/items/obtener-urls-subida-chunked.dto';

export class ObtenerUrlsSubidaChunkedUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,
    private readonly settings: ApplicationSettingsPort,
  ) {}

  async execute(userId: number, dto: ObtenerUrlsSubidaChunkedDto) {
    if (!dto.bucketKey || !dto.objectKey || !dto.uploadKey) {
      throw new InvalidInputError(
        'bucketKey, objectKey y uploadKey son requeridos',
      );
    }
    if (!Number.isFinite(dto.firstPart) || dto.firstPart < 1) {
      throw new InvalidInputError('firstPart inválido');
    }

    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(userId);
    if (!token) {
      throw new ForbiddenError('No se encontró token de Autodesk');
    }
    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new ForbiddenError('El token de Autodesk ha expirado.');
    }

    const parts = Math.min(
      this.settings.docsChunkSignedUrlBatch,
      Math.max(1, dto.parts ?? this.settings.docsChunkSignedUrlBatch),
    );

    const signedResult = await this.autodeskApiService.obtenerUrlFirmadaS3(
      token.tokenAcceso,
      dto.bucketKey,
      dto.objectKey,
      parts,
      {
        firstPart: dto.firstPart,
        uploadKey: dto.uploadKey,
        minutesExpiration: 10,
      },
    );
    if (!signedResult?.urls?.length || !signedResult?.uploadKey) {
      throw new InvalidInputError('No se pudieron generar URLs de subida');
    }

    return {
      uploadKey: signedResult.uploadKey as string,
      firstPart: dto.firstPart,
      urls: signedResult.urls as string[],
    };
  }
}
