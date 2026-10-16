import { UnauthenticatedError } from '../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../domain/repositories/acc.repository.interface';
import { ObtenerProyectosDto } from '../../inputs/data-management/obtener-proyectos.dto';

export class ObtenerProyectosUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,
  ) {}

  async execute(
    userId: number,
    hubId: string,
    dto: ObtenerProyectosDto,
  ): Promise<any> {
    if (!hubId) {
      throw new Error('El ID del hub es requerido');
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

    // Obtener proyectos
    return await this.autodeskApiService.obtenerProyectos(
      token.tokenAcceso,
      hubId,
      dto.filters || {},
    );
  }
}
