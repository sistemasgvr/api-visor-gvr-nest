import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { AutodeskApiService } from '../../../infrastructure/services/autodesk-api.service';
import {
  ACC_REPOSITORY,
  type IAccRepository,
} from '../../../domain/repositories/acc.repository.interface';
import { ObtenerHubsDto } from '../../dtos/data-management/obtener-hubs.dto';

@Injectable()
export class ObtenerHubsUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskApiService,
    @Inject(ACC_REPOSITORY)
    private readonly accRepository: IAccRepository,
  ) {}

  async execute(userId: number, dto: ObtenerHubsDto): Promise<any> {
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

    return await this.autodeskApiService.obtenerHubs(
      token.tokenAcceso,
      dto.filters || {},
    );
  }
}
