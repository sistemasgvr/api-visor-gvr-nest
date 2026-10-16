import {
  InvalidInputError,
  UnauthenticatedError,
} from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { type IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';

export class EliminarItemUseCase {
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

    // Obtener datos del item antes de eliminar (para auditoría)
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
    } catch (error) {
      // Si falla obtener datos anteriores, continuar sin ellos
    }

    const resultado = await this.autodeskApiService.eliminarItem(
      token.tokenAcceso,
      projectId,
      itemId,
    );

    // Registrar auditoría si la eliminación fue exitosa
    if (resultado?.data && ipAddress && userAgent) {
      try {
        await this.auditoriaRepository.registrarAccion(
          userId,
          'FILE_DELETE',
          'file',
          null,
          `Archivo eliminado: ${datosAnteriores?.displayName || itemId}`,
          datosAnteriores,
          {
            itemId,
            projectId,
            deletedVersion: resultado.data?.id || null,
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
        // No fallar la operación si la auditoría falla
        console.error(
          'Error registrando auditoría de eliminación de archivo:',
          error,
        );
      }
    }

    return resultado;
  }
}
