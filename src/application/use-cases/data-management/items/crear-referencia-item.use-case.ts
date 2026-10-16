import {
  InvalidInputError,
  UnauthenticatedError,
} from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';

export class CrearReferenciaItemUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    itemId: string,
    refData: any,
  ): Promise<any> {
    if (!projectId) {
      throw new InvalidInputError('El ID del proyecto es requerido');
    }

    if (!itemId) {
      throw new InvalidInputError('El ID del item es requerido');
    }

    if (!refData || Object.keys(refData).length === 0) {
      throw new InvalidInputError('Los datos de la referencia son requeridos');
    }

    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(userId);

    if (!token) {
      throw new UnauthenticatedError(
        'No se encontró token de acceso. Por favor, autoriza la aplicación primero.',
      );
    }

    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new UnauthenticatedError(
        'El token ha expirado. Por favor, refresca tu token.',
      );
    }

    return await this.autodeskApiService.crearReferenciaItem(
      token.tokenAcceso,
      projectId,
      itemId,
      refData,
    );
  }
}
