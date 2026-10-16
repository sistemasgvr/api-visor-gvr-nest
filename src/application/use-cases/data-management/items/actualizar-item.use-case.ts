import {
  ForbiddenError,
  InvalidInputError,
} from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { type IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';

export class ActualizarItemUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,

    private readonly auditoriaRepository: IAuditoriaRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    itemId: string,
    itemData: any,
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

    if (!itemData || Object.keys(itemData).length === 0) {
      throw new InvalidInputError('Los datos del item son requeridos');
    }

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

    // Obtener datos anteriores antes de actualizar (para auditoría)
    let datosAnteriores: any = null;
    let nombreAnterior: string | null = null;
    let resultado: any;

    try {
      const itemAnterior = await this.autodeskApiService.obtenerItemPorId(
        token.tokenAcceso,
        projectId,
        itemId,
      );
      if (itemAnterior?.data) {
        nombreAnterior =
          itemAnterior.data.attributes?.displayName ||
          itemAnterior.data.attributes?.name ||
          null;
        datosAnteriores = {
          displayName: nombreAnterior,
          extension: itemAnterior.data.attributes?.extension || null,
        };
      }
    } catch (error) {
      // Si falla obtener datos anteriores, continuar sin ellos
    }

    // Verificar si se está intentando renombrar (tiene displayName o name en attributes)
    // El DTO tiene estructura: { data: { type: "items", id: "...", attributes: {...} } }
    const isRenaming =
      itemData?.data?.attributes?.displayName ||
      itemData?.data?.attributes?.name;

    if (isRenaming) {
      // Para renombrar archivos, necesitamos crear una nueva versión con copyFrom
      // Primero obtener las versiones del item para obtener la versión actual
      try {
        const versiones = await this.autodeskApiService.obtenerVersionesItem(
          token.tokenAcceso,
          projectId,
          itemId,
        );
        // Las versiones vienen ordenadas, la primera (índice 0) es la más reciente
        const versionActual = versiones?.data?.[0];

        if (versionActual?.id) {
          // Crear nueva versión con el nuevo nombre usando copyFrom
          let nuevoNombre =
            itemData.data.attributes.displayName ||
            itemData.data.attributes.name;

          // Preservar la extensión del archivo
          if (nombreAnterior) {
            // Extraer extensión del nombre anterior
            const extensionAnterior = nombreAnterior.includes('.')
              ? nombreAnterior.substring(nombreAnterior.lastIndexOf('.'))
              : '';

            // Verificar si el nuevo nombre ya tiene extensión
            const tieneExtension =
              nuevoNombre.includes('.') && nuevoNombre.lastIndexOf('.') > 0;

            // Si no tiene extensión y el nombre anterior tenía, agregarla
            if (!tieneExtension && extensionAnterior) {
              nuevoNombre = nuevoNombre + extensionAnterior;
            }
          }
          const versionData = {
            type: 'versions',
            attributes: {
              name: nuevoNombre,
              displayName: nuevoNombre,
            },
          };

          resultado = await this.autodeskApiService.crearVersion(
            token.tokenAcceso,
            projectId,
            versionData,
            versionActual.id, // copyFrom: URN de la versión actual
          );

          // El resultado de crear versión tiene una estructura diferente
          // Necesitamos obtener el item actualizado para la auditoría
          if (resultado?.data) {
            // Obtener el item actualizado para obtener el nuevo displayName
            const itemActualizado =
              await this.autodeskApiService.obtenerItemPorId(
                token.tokenAcceso,
                projectId,
                itemId,
              );
            if (itemActualizado?.data) {
              resultado.data = itemActualizado.data;
            }
          }
        } else {
          throw new InvalidInputError(
            'No se pudo obtener la versión actual del archivo',
          );
        }
      } catch (error: any) {
        throw new InvalidInputError(
          `Error al renombrar archivo: ${error.message || 'No se pudo crear la nueva versión'}`,
        );
      }
    } else {
      // Para otras actualizaciones, usar el método normal
      resultado = await this.autodeskApiService.actualizarItem(
        token.tokenAcceso,
        projectId,
        itemId,
        itemData,
      );
    }

    // Registrar auditoría si la actualización fue exitosa
    if (resultado?.data && ipAddress && userAgent) {
      try {
        await this.auditoriaRepository.registrarAccion(
          userId,
          'FILE_UPDATE',
          'file',
          null,
          `Archivo actualizado: ${resultado.data.attributes?.displayName || itemId}`,
          datosAnteriores,
          {
            itemId,
            projectId,
            displayName: resultado.data.attributes?.displayName || null,
            extension: resultado.data.attributes?.extension || null,
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
          'Error registrando auditoría de actualización de archivo:',
          error,
        );
      }
    }

    return resultado;
  }
}
