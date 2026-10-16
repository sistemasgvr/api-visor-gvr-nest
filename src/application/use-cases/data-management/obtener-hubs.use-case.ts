import { ForbiddenError } from '../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../domain/repositories/acc.repository.interface';
import { ObtenerHubsDto } from '../../inputs/data-management/obtener-hubs.dto';

export class ObtenerHubsUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,
  ) {}

  async execute(userId: number, dto: ObtenerHubsDto): Promise<any> {
    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(userId);

    if (!token) {
      throw new ForbiddenError(
        'No se encontró token de acceso. Por favor, autoriza la aplicación de Autodesk primero.',
      );
    }

    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new ForbiddenError(
        'El token de Autodesk ha expirado. Por favor, refresca tu token.',
      );
    }

    return await this.autodeskApiService.obtenerHubs(
      token.tokenAcceso,
      dto.filters || {},
    );
  }
}
