import { UnauthenticatedError } from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { CrearReferenciaDto } from '../../../inputs/data-management/folders/crear-referencia.dto';

export class CrearReferenciaCarpetaUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    folderId: string,
    dto: CrearReferenciaDto,
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

    return await this.autodeskApiService.crearReferenciaCarpeta(
      token.tokenAcceso,
      projectId,
      folderId,
      dto.data,
    );
  }
}
