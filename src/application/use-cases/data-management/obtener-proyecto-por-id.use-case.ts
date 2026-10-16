import { UnauthenticatedError } from '../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../domain/repositories/acc.repository.interface';

export class ObtenerProyectoPorIdUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,
  ) {}

  async execute(
    userId: number,
    hubId: string,
    projectId: string,
  ): Promise<any> {
    if (!hubId) {
      throw new Error('El ID del hub es requerido');
    }

    if (!projectId) {
      throw new Error('El ID del proyecto es requerido');
    }

    // Obtener token del usuario
    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(userId);

    if (!token) {
      throw new UnauthenticatedError(
        'No se encontró token de acceso. Por favor, autoriza la aplicación primero.',
      );
    }

    // Validar que el token no esté expirado
    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new UnauthenticatedError(
        'El token ha expirado. Por favor, refresca tu token.',
      );
    }

    // Obtener proyecto
    return await this.autodeskApiService.obtenerProyectoPorId(
      token.tokenAcceso,
      hubId,
      projectId,
    );
  }
}
