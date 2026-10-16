import {
  ForbiddenError,
  InvalidInputError,
} from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { type IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';
import { CopiarItemDto } from '../../../inputs/data-management/items/copiar-item.dto';

export class CopiarItemUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,

    private readonly auditoriaRepository: IAuditoriaRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    dto: CopiarItemDto,
    ipAddress?: string,
    userAgent?: string,
    userRole?: string,
  ): Promise<any> {
    if (!projectId) {
      throw new InvalidInputError('El ID del proyecto es requerido');
    }
    if (
      !dto.sourceItemId ||
      !dto.sourceVersionId ||
      !dto.targetFolderId ||
      !dto.fileName
    ) {
      throw new InvalidInputError(
        'sourceItemId, sourceVersionId, targetFolderId y fileName son requeridos',
      );
    }

    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(userId);
    if (!token) {
      throw new ForbiddenError(
        'No se encontró token de acceso. Autoriza la aplicación de Autodesk primero.',
      );
    }
    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new ForbiddenError(
        'El token de Autodesk ha expirado. Refresca tu token.',
      );
    }

    const projectIdNorm = projectId.startsWith('b.')
      ? projectId
      : `b.${projectId}`;

    try {
      const resultado = await this.autodeskApiService.copiarItem(
        token.tokenAcceso,
        projectIdNorm,
        dto.sourceVersionId,
        dto.targetFolderId,
        dto.fileName,
      );

      const nuevoItem = resultado?.data;
      const displayName =
        nuevoItem?.attributes?.displayName ||
        nuevoItem?.attributes?.name ||
        'archivo';

      if (ipAddress && userAgent) {
        try {
          await this.auditoriaRepository.registrarAccion(
            userId,
            'FILE_COPY',
            'file',
            null,
            `Archivo copiado: ${displayName}`,
            {
              sourceItemId: dto.sourceItemId,
              sourceVersionId: dto.sourceVersionId,
            },
            {
              targetFolderId: dto.targetFolderId,
              newItemId: nuevoItem?.id || null,
            },
            ipAddress,
            userAgent,
            {
              projectId: projectIdNorm,
              accItemId: dto.sourceItemId,
              rol: userRole || null,
            },
          );
        } catch {
          /* ignore audit errors */
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
        `Error al copiar archivo: ${error?.message || 'No se pudo copiar el archivo'}`,
      );
    }
  }
}
