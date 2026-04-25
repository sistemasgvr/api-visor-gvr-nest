import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import {
  ACC_REPOSITORY,
  type IAccRepository,
} from '../../../../domain/repositories/acc.repository.interface';

@Injectable()
export class ObtenerStorageUrlItemUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskApiService,
    @Inject(ACC_REPOSITORY)
    private readonly accRepository: IAccRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    itemId: string,
  ): Promise<{
    storageUrl: string;
    fileName: string;
    fileType: string;
  }> {
    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(userId);

    if (!token) {
      throw new ForbiddenException(
        'No se encontró token de acceso. Por favor, autoriza la aplicación de Autodesk primero.',
      );
    }

    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new ForbiddenException(
        'El token de Autodesk ha expirado. Por favor, refresca tu token.',
      );
    }

    const resultado = await this.autodeskApiService.obtenerStorageUrl(
      token.tokenAcceso,
      projectId,
      itemId,
    );

    return {
      storageUrl: resultado.storageUrl,
      fileName: resultado.fileName,
      fileType: resultado.fileType,
    };
  }
}
