import { UnauthenticatedError } from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { type IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';

export class RestaurarCarpetaUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,

    private readonly auditoriaRepository: IAuditoriaRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    folderId: string,
    ipAddress?: string,
    userAgent?: string,
    userRole?: string,
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

    let datosAnteriores: any = null;
    try {
      const carpetaAnterior = await this.autodeskApiService.obtenerCarpetaPorId(
        token.tokenAcceso,
        projectId,
        folderId,
      );
      if (carpetaAnterior?.data) {
        datosAnteriores = {
          displayName: carpetaAnterior.data.attributes?.displayName || null,
          hidden: carpetaAnterior.data.attributes?.hidden ?? null,
        };
      }
    } catch {
      // continuar sin datos anteriores
    }

    const resultado = await this.autodeskApiService.restaurarCarpeta(
      token.tokenAcceso,
      projectId,
      folderId,
    );

    if (resultado?.data && ipAddress && userAgent) {
      try {
        await this.auditoriaRepository.registrarAccion(
          userId,
          'FOLDER_RESTORE',
          'folder',
          null,
          `Carpeta restaurada: ${datosAnteriores?.displayName || folderId}`,
          datosAnteriores,
          {
            folderId,
            projectId,
            restoredAt: resultado.restoredAt || null,
          },
          ipAddress,
          userAgent,
          {
            projectId,
            accFolderId: folderId,
            rol: userRole || null,
          },
        );
      } catch (error) {
        console.error(
          'Error registrando auditoría de restauración de carpeta:',
          error,
        );
      }
    }

    return resultado;
  }
}
