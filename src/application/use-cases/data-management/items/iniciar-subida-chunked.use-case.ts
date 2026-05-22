import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import {
  ACC_REPOSITORY,
  type IAccRepository,
} from '../../../../domain/repositories/acc.repository.interface';
import { IniciarSubidaChunkedDto } from '../../../dtos/data-management/items/iniciar-subida-chunked.dto';
import {
  DOCS_CHUNK_SIGNED_URL_BATCH,
  DOCS_CHUNK_SIZE_BYTES,
} from '../../../../config/upload.constants';

@Injectable()
export class IniciarSubidaChunkedUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskApiService,
    @Inject(ACC_REPOSITORY)
    private readonly accRepository: IAccRepository,
  ) {}

  async execute(userId: number, projectId: string, dto: IniciarSubidaChunkedDto) {
    if (!projectId) {
      throw new BadRequestException('El ID del proyecto es requerido');
    }
    if (!dto.folderId || !dto.fileName) {
      throw new BadRequestException('folderId y fileName son requeridos');
    }
    if (!Number.isFinite(dto.fileSize) || dto.fileSize < 1) {
      throw new BadRequestException('fileSize debe ser mayor a cero');
    }

    const token = await this.accRepository.obtenerToken3LeggedPorUsuario(userId);
    if (!token) {
      throw new ForbiddenException(
        'No se encontró token de acceso. Autoriza Autodesk primero.',
      );
    }
    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new ForbiddenException('El token de Autodesk ha expirado.');
    }

    const projectIdNorm = projectId.startsWith('b.') ? projectId : `b.${projectId}`;
    const storageResult = await this.autodeskApiService.crearStorageParaItem(
      token.tokenAcceso,
      projectIdNorm,
      dto.folderId,
      dto.fileName,
    );
    const storageId = storageResult?.data?.id as string | undefined;
    if (!storageId) {
      throw new BadRequestException('No se pudo obtener el storage ID');
    }

    const storageIdMatch = storageId.match(
      /urn:adsk\.objects:os\.object:([^\/]+)\/(.+)/,
    );
    if (!storageIdMatch || storageIdMatch.length !== 3) {
      throw new BadRequestException(`Formato de storage ID inválido: ${storageId}`);
    }
    const bucketKey = storageIdMatch[1];
    const objectKey = storageIdMatch[2];

    const partSizeBytes =
      dto.partSizeBytes && dto.partSizeBytes > 0
        ? dto.partSizeBytes
        : DOCS_CHUNK_SIZE_BYTES;
    const totalParts = Math.max(1, Math.ceil(dto.fileSize / partSizeBytes));
    const firstBatchParts = Math.min(DOCS_CHUNK_SIGNED_URL_BATCH, totalParts);

    const signedResult = await this.autodeskApiService.obtenerUrlFirmadaS3(
      token.tokenAcceso,
      bucketKey,
      objectKey,
      firstBatchParts,
      { firstPart: 1, minutesExpiration: 10 },
    );
    if (!signedResult?.urls?.length || !signedResult?.uploadKey) {
      throw new BadRequestException('No se pudieron generar URLs de subida');
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
