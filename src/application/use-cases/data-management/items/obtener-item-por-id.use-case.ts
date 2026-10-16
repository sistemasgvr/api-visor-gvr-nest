import { ForbiddenError } from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';

export class ObtenerItemPorIdUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    itemId: string,
    queryParams: any,
  ): Promise<any> {
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

    return await this.autodeskApiService.obtenerItemPorId(
      token.tokenAcceso,
      projectId,
      itemId,
    );
  }
}
