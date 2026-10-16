import {
  InvalidInputError,
  UnauthenticatedError,
} from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { type IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';

export class RestaurarItemUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,

    private readonly auditoriaRepository: IAuditoriaRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    itemId: string,
    ipAddress?: string,
    userAgent?: string,
    userRole?: string,
    parentFolderId?: string,
  ): Promise<any> {
    if (!projectId) {
      throw new InvalidInputError('El ID del proyecto es requerido');
    }
    if (!itemId) {
      throw new InvalidInputError('El ID del item es requerido');
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

    let datosAnteriores: any = null;
    try {
      const itemAnterior = await this.autodeskApiService.obtenerItemPorId(
        token.tokenAcceso,
        projectId,
        itemId,
      );
      if (itemAnterior?.data) {
        datosAnteriores = {
          displayName: itemAnterior.data.attributes?.displayName || null,
          extension: itemAnterior.data.attributes?.extension || null,
        };
      }
    } catch {
      // continuar sin datos anteriores
    }

    const resultado = await this.autodeskApiService.restaurarItem(
      token.tokenAcceso,
      projectId,
      itemId,
      parentFolderId,
    );

    if (
      resultado?.data &&
      ipAddress &&
      userAgent &&
      !resultado.wasAlreadyRestored
    ) {
      try {
        await this.auditoriaRepository.registrarAccion(
          userId,
          'FILE_RESTORE',
          'file',
          null,
          `Archivo restaurado: ${datosAnteriores?.displayName || itemId}`,
          datosAnteriores,
          {
            itemId,
            projectId,
            restoredFromVersionId: resultado.restoredFromVersionId || null,
            restoredAt: resultado.restoredAt || null,
          },
          ipAddress,
          userAgent,
          {
            projectId,
            accItemId: itemId,
            rol: userRole || null,
          },
        );
      } catch (error) {
        console.error(
          'Error registrando auditoría de restauración de archivo:',
          error,
        );
      }
    }

    return resultado;
  }
}
