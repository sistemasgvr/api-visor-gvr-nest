import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import {
  ACC_REPOSITORY,
  type IAccRepository,
} from '../../../../domain/repositories/acc.repository.interface';
import {
  AUDITORIA_REPOSITORY,
  type IAuditoriaRepository,
} from '../../../../domain/repositories/auditoria.repository.interface';
import {
  ACC_RESOURCES_REPOSITORY,
  type IAccResourcesRepository,
} from '../../../../domain/repositories/acc-resources.repository.interface';

@Injectable()
export class ObtenerElementosEliminadosUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskApiService,
    @Inject(ACC_REPOSITORY)
    private readonly accRepository: IAccRepository,
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepository: IAuditoriaRepository,
    @Inject(ACC_RESOURCES_REPOSITORY)
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    folderId: string,
    userRole?: string,
  ): Promise<any> {
    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(userId);

    if (!token) {
      throw new ForbiddenException(
        'No se encontró token de acceso. Por favor, autoriza la aplicación de Autodesk primero.',
      );
    }

    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new ForbiddenException(
        'El token de Autodesk ha expirado. Por favor, refresca tu token.',
      );
    }

    const esAdministrador =
      userRole &&
      (userRole.toLowerCase().includes('admin') ||
        userRole.toLowerCase().includes('administrador') ||
        userRole.toLowerCase() === 'admin' ||
        userRole.toLowerCase() === 'administrador');

    const resultado =
      await this.autodeskApiService.obtenerContenidoCarpetaTodasLasPaginas(
        token.tokenAcceso,
        projectId,
        folderId,
        { 'filter[hidden]': 'true' },
      );

    const items = resultado?.data || [];

    const carpetasConAcceso: Set<string> = new Set();
    if (!esAdministrador) {
      try {
        let offset = 0;
        const limit = 1000;
        let hasMore = true;
        while (hasMore) {
          const permisosUsuario =
            await this.accResourcesRepository.listarPermisosUsuario({
              userId,
              limit,
              offset,
            });
          const carpetasAcceso = (permisosUsuario.data || [])
            .filter((p: any) => p.resourcetype === 'folder' && p.externalid)
            .map((p: any) => p.externalid);
          carpetasAcceso.forEach((id: string) => carpetasConAcceso.add(id));
          const total = permisosUsuario.pagination?.total || 0;
          hasMore = offset + limit < total;
          offset += limit;
        }
      } catch (error) {
        console.warn(
          'Error obteniendo permisos de carpetas del usuario:',
          error,
        );
      }
    }

    const itemsEnriquecidos = await Promise.all(
      items.map(async (item: any) => {
        const itemType = item.type;
        const itemId = item.id;

        if (itemType === 'folders' && !esAdministrador) {
          if (carpetasConAcceso.size === 0 || !carpetasConAcceso.has(itemId)) {
            return null;
          }
        }

        const accionEliminacion =
          itemType === 'folders' ? 'FOLDER_DELETE' : 'FILE_DELETE';
        const metadatoKey =
          itemType === 'folders' ? 'accFolderId' : 'accItemId';
        const entidad = itemType === 'folders' ? 'folder' : 'file';

        let deletedByReal: string | null = null;
        let deletedByRealId: number | null = null;
        let deletedByRealRole: string | null = null;
        let deletedByRealEmpresa: string | null = null;
        let deletedAtReal: string | null = null;

        try {
          const registroEliminacion =
            await this.auditoriaRepository.obtenerAuditoriaPorMetadatos(
              entidad,
              accionEliminacion,
              metadatoKey,
              itemId,
            );
          if (registroEliminacion) {
            deletedByReal = registroEliminacion.usuario || null;
            deletedByRealId = registroEliminacion.idusuario ?? null;
            deletedByRealRole = registroEliminacion.rol || null;
            deletedByRealEmpresa = registroEliminacion.empresa || null;
            deletedAtReal = registroEliminacion.fechacreacion || null;
          }
        } catch {
          // continuar sin auditoría GVR
        }

        const deletedAt =
          deletedAtReal ||
          item.attributes?.lastModifiedTime ||
          item.attributes?.createTime ||
          null;

        const deletedBy =
          deletedByReal ||
          item.attributes?.lastModifiedUserName ||
          item.attributes?.createUserName ||
          null;

        return {
          ...item,
          deletedByReal: deletedByReal ?? undefined,
          deletedByRealId: deletedByRealId ?? undefined,
          deletedByRealRole: deletedByRealRole ?? undefined,
          deletedByRealEmpresa: deletedByRealEmpresa ?? undefined,
          deletedAtReal: deletedAtReal ?? undefined,
          deletedBy,
          deletedAt,
          fileName:
            itemType === 'items'
              ? item.attributes?.name ||
                item.attributes?.displayName ||
                null
              : null,
        };
      }),
    );

    const itemsFiltrados = itemsEnriquecidos.filter((item) => item !== null);

    return {
      data: itemsFiltrados,
    };
  }
}
