import {
  ForbiddenError,
  InvalidInputError,
} from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { type IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';
import { DesplazarItemDto } from '../../../inputs/data-management/items/desplazar-item.dto';

export class DesplazarItemUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,

    private readonly auditoriaRepository: IAuditoriaRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    itemId: string,
    dto: DesplazarItemDto,
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

    if (!dto.targetFolderId) {
      throw new InvalidInputError('El ID de la carpeta destino es requerido');
    }

    // No permitir mover un item a sí mismo como carpeta padre (aunque no debería ser posible)
    if (itemId === dto.targetFolderId) {
      throw new InvalidInputError('No se puede mover un archivo a sí mismo');
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

    // Obtener información del item antes de moverlo (para auditoría)
    let itemInfo: any = null;
    let carpetaOrigen: any = null;
    let carpetaDestino: any = null;
    try {
      itemInfo = await this.autodeskApiService.obtenerItemPorId(
        token.tokenAcceso,
        projectId,
        itemId,
      );
      const nombreArchivo =
        itemInfo?.data?.attributes?.displayName || 'Archivo desconocido';

      // Obtener carpeta padre actual (origen)
      try {
        const itemPadre = await this.autodeskApiService.obtenerItemPadre(
          token.tokenAcceso,
          projectId,
          itemId,
        );
        carpetaOrigen = itemPadre?.data;
      } catch (error) {
        // Si no se puede obtener la carpeta padre, continuar sin ella
      }

      // Obtener información de la carpeta destino
      try {
        const carpetaDestinoData =
          await this.autodeskApiService.obtenerCarpetaPorId(
            token.tokenAcceso,
            projectId,
            dto.targetFolderId,
          );
        carpetaDestino = carpetaDestinoData?.data;
      } catch (error) {
        throw new InvalidInputError(
          'La carpeta destino no existe o no es accesible',
        );
      }

      // Mover el item
      const resultado = await this.autodeskApiService.moverItem(
        token.tokenAcceso,
        projectId,
        itemId,
        dto.targetFolderId,
      );

      // Registrar auditoría si el movimiento fue exitoso
      if (resultado?.data && ipAddress && userAgent) {
        try {
          const nombreCarpetaOrigen =
            carpetaOrigen?.attributes?.displayName || 'Carpeta desconocida';
          const nombreCarpetaDestino =
            carpetaDestino?.attributes?.displayName || 'Carpeta desconocida';

          await this.auditoriaRepository.registrarAccion(
            userId,
            'FILE_MOVE',
            'file',
            null,
            `Archivo movido: ${nombreArchivo} de "${nombreCarpetaOrigen}" a "${nombreCarpetaDestino}"`,
            {
              carpetaOrigenId: carpetaOrigen?.id || null,
              carpetaOrigenNombre: nombreCarpetaOrigen,
            },
            {
              carpetaDestinoId: dto.targetFolderId,
              carpetaDestinoNombre: nombreCarpetaDestino,
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
            'Error registrando auditoría de movimiento de archivo:',
            error,
          );
        }
      }

      return resultado;
    } catch (error: any) {
      if (
        error instanceof InvalidInputError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }
      throw new InvalidInputError(
        `Error al mover archivo: ${error.message || 'No se pudo mover el archivo'}`,
      );
    }
  }
}
