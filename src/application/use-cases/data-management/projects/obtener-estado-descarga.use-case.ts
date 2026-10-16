import { UnauthenticatedError } from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { ObtenerEstadoDescargaDto } from '../../../inputs/data-management/projects/obtener-estado-descarga.dto';

export class ObtenerEstadoDescargaUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    downloadId: string,
    dto: ObtenerEstadoDescargaDto,
  ): Promise<any> {
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

    return await this.autodeskApiService.obtenerEstadoDescarga(
      token.tokenAcceso,
      projectId,
      downloadId,
    );
  }
}
