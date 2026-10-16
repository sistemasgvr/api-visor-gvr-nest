import { UnauthenticatedError } from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';

import { type IAccResourcesRepository } from '../../../../domain/repositories/acc-resources.repository.interface';
import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { ObtenerCarpetasPrincipalesDto } from '../../../inputs/data-management/projects/obtener-carpetas-principales.dto';

export class ObtenerCarpetasPrincipalesUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,

    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(
    userId: number,
    hubId: string,
    projectId: string,
    dto: ObtenerCarpetasPrincipalesDto,
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

    const resultado = await this.autodeskApiService.obtenerCarpetasPrincipales(
      token.tokenAcceso,
      hubId,
      projectId,
    );

    // Verificar si el usuario es administrador
    const esAdministrador =
      userRole &&
      (userRole.toLowerCase().includes('admin') ||
        userRole.toLowerCase().includes('administrador') ||
        userRole.toLowerCase() === 'admin' ||
        userRole.toLowerCase() === 'administrador');

    // Filtrar carpetas según permisos si NO es administrador
    const carpetas = resultado?.data || [];

    if (Array.isArray(carpetas) && carpetas.length > 0 && !esAdministrador) {
      try {
        // Obtener todos los permisos del usuario para carpetas
        let offset = 0;
        const limit = 1000;
        let hasMore = true;
        const carpetasConAcceso = new Set<string>();

        while (hasMore) {
          const permisosUsuario =
            await this.accResourcesRepository.listarPermisosUsuario({
              userId,
              limit,
              offset,
            });

          // Filtrar solo recursos de tipo 'folder' y obtener sus externalIds
          const carpetasAcceso = (permisosUsuario.data || [])
            .filter((p: any) => p.resourcetype === 'folder' && p.externalid)
            .map((p: any) => p.externalid);

          carpetasAcceso.forEach((id: string) => carpetasConAcceso.add(id));

          // Verificar si hay más resultados
          const total = permisosUsuario.pagination?.total || 0;
          hasMore = offset + limit < total;
          offset += limit;
        }

        // Filtrar carpetas: solo mostrar las que el usuario tiene acceso
        const carpetasFiltradas = carpetas.filter((carpeta: any) => {
          return carpetasConAcceso.has(carpeta.id);
        });

        return {
          ...resultado,
          data: carpetasFiltradas,
        };
      } catch (error) {
        console.warn(
          'Error obteniendo permisos de carpetas del usuario:',
          error,
        );
        // Si falla, retornar sin filtrar (por seguridad, mejor no mostrar nada)
        return {
          ...resultado,
          data: [],
        };
      }
    }

    return resultado;
  }
}
