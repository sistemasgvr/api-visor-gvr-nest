import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import {
  ACC_REPOSITORY,
  type IAccRepository,
} from '../../../../domain/repositories/acc.repository.interface';
import { ObtenerUrlsSubidaChunkedDto } from '../../../dtos/data-management/items/obtener-urls-subida-chunked.dto';
import { DOCS_CHUNK_SIGNED_URL_BATCH } from '../../../../config/upload.constants';

@Injectable()
export class ObtenerUrlsSubidaChunkedUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskApiService,
    @Inject(ACC_REPOSITORY)
    private readonly accRepository: IAccRepository,
  ) {}

  async execute(userId: number, dto: ObtenerUrlsSubidaChunkedDto) {
    if (!dto.bucketKey || !dto.objectKey || !dto.uploadKey) {
      throw new BadRequestException(
        'bucketKey, objectKey y uploadKey son requeridos',
      );
    }
    if (!Number.isFinite(dto.firstPart) || dto.firstPart < 1) {
      throw new BadRequestException('firstPart inválido');
    }

    const token = await this.accRepository.obtenerToken3LeggedPorUsuario(userId);
    if (!token) {
      throw new ForbiddenException('No se encontró token de Autodesk');
    }
    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new ForbiddenException('El token de Autodesk ha expirado.');
    }

    const parts = Math.min(
      DOCS_CHUNK_SIGNED_URL_BATCH,
      Math.max(1, dto.parts ?? DOCS_CHUNK_SIGNED_URL_BATCH),
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
      throw new BadRequestException('No se pudieron generar URLs de subida');
    }

    return {
      uploadKey: signedResult.uploadKey as string,
      firstPart: dto.firstPart,
      urls: signedResult.urls as string[],
    };
  }
}
