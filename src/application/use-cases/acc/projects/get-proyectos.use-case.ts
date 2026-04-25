import { Injectable, Inject } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import { GetProyectosDto } from '../../../dtos/acc/projects/get-proyectos.dto';
import {
  AUDITORIA_REPOSITORY,
  type IAuditoriaRepository,
} from '../../../../domain/repositories/auditoria.repository.interface';
import {
  ACC_RESOURCES_REPOSITORY,
  type IAccResourcesRepository,
} from '../../../../domain/repositories/acc-resources.repository.interface';

/** Fila de permiso devuelta por el repositorio al listar accesos a recursos ACC. */
interface AccResourcePermissionRow {
  resourcetype: string;
  externalid?: string;
}

type AccProjectRow = Record<string, unknown> & { id: string };

/** Cuerpo de listado de proyectos tal como lo devuelve la API de Autodesk (enriquecida opcionalmente). */
export type GetProyectosListResult = Record<string, unknown>;

@Injectable()
export class GetProyectosUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskApiService,
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepository: IAuditoriaRepository,
    @Inject(ACC_RESOURCES_REPOSITORY)
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(
    accountId: string,
    dto: GetProyectosDto,
    userId?: number,
    userRole?: string,
  ): Promise<GetProyectosListResult | null | undefined> {
    const options: Record<string, string | number | string[] | undefined> = {};

    if (dto.fields) {
      options.fields = dto.fields.split(',').map((f) => f.trim());
    }

    if (dto.filter_classification) {
      options['filter[classification]'] = dto.filter_classification;
    }

    if (dto.filter_platform) {
      options['filter[platform]'] = dto.filter_platform;
    }

    if (dto.filter_products) {
      options['filter[products]'] = dto.filter_products;
    }

    if (dto.filter_name) {
      options['filter[name]'] = dto.filter_name;
    }

    if (dto.filter_type) {
      options['filter[type]'] = dto.filter_type;
    }

    if (dto.filter_status) {
      options['filter[status]'] = dto.filter_status;
    }

    if (dto.filter_businessUnitId) {
      options['filter[businessUnitId]'] = dto.filter_businessUnitId;
    }

    if (dto.filter_jobNumber) {
      options['filter[jobNumber]'] = dto.filter_jobNumber;
    }

    if (dto.filter_updatedAt) {
      options['filter[updatedAt]'] = dto.filter_updatedAt;
    }

    if (dto.filterTextMatch) {
      options.filterTextMatch = dto.filterTextMatch;
    }

    if (dto.sort) {
      options.sort = dto.sort;
    }

    options.limit = dto.limit || 20;
    options.offset = dto.offset || 0;

    const resultado = (await this.autodeskApiService.getAccProjects(
      accountId,
      options as Record<string, unknown>,
      dto.token,
    )) as GetProyectosListResult | null | undefined;

    // Enriquecer proyectos con información de auditoría y filtrar por acceso de usuario
    const res = resultado as
      | { results?: AccProjectRow[]; data?: { results?: AccProjectRow[] } }
      | null
      | undefined;
    const proyectos: AccProjectRow[] = res?.results ?? res?.data?.results ?? [];

    // Verificar si el usuario es administrador
    const esAdministrador =
      userRole &&
      (userRole.toLowerCase().includes('admin') ||
        userRole.toLowerCase().includes('administrador') ||
        userRole.toLowerCase() === 'admin' ||
        userRole.toLowerCase() === 'administrador');

    if (Array.isArray(proyectos) && proyectos.length > 0) {
      // Si hay userId y NO es administrador, obtener los externalIds de los recursos (proyectos) a los que tiene acceso
      const proyectosConAcceso: Set<string> = new Set();
      if (userId && !esAdministrador) {
        try {
          // Obtener todos los permisos del usuario (puede haber muchos, así que usamos un límite alto)
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

            // Filtrar solo recursos de tipo 'project' y obtener sus externalIds
            const proyectosAcceso = (permisosUsuario.data || [])
              .filter(
                (p: AccResourcePermissionRow) =>
                  p.resourcetype === 'project' && p.externalid,
              )
              .map((p: AccResourcePermissionRow) => p.externalid as string);

            proyectosAcceso.forEach((id: string) => proyectosConAcceso.add(id));

            // Verificar si hay más resultados
            const total = permisosUsuario.pagination?.total || 0;
            hasMore = offset + limit < total;
            offset += limit;
          }
        } catch (error) {
          console.warn('Error obteniendo permisos del usuario:', error);
        }
      }

      const proyectosEnriquecidos = await Promise.all(
        proyectos.map(async (proyecto: AccProjectRow) => {
          try {
            const proyectoId = proyecto.id;

            // Si hay userId y NO es administrador, filtrar proyectos: solo mostrar los que el usuario tiene acceso
            if (userId && !esAdministrador) {
              // Si no hay proyectos con acceso, no mostrar ninguno
              if (proyectosConAcceso.size === 0) {
                return null;
              }

              // Verificar si el proyectoId está en los proyectos con acceso
              if (!proyectosConAcceso.has(proyectoId)) {
                return null; // Filtrar este proyecto
              }
            }

            // Buscar en auditoría el registro de creación de este proyecto
            const registroCreacion =
              await this.auditoriaRepository.obtenerAuditoriaPorMetadatos(
                'project',
                'PROJECT_CREATE',
                'accProjectId',
                proyectoId,
              );

            if (registroCreacion && registroCreacion.usuario) {
              return {
                ...proyecto,
                createdByReal: registroCreacion.usuario,
                createdByRealId: registroCreacion.idusuario,
                createdByRealRole: registroCreacion.rol || null,
                createdByRealEmpresa: registroCreacion.empresa || null,
              };
            }

            return proyecto;
          } catch (error) {
            // Si falla la búsqueda, retornar proyecto original
            return proyecto;
          }
        }),
      );

      // Filtrar los null (proyectos sin acceso)
      const proyectosFiltrados = proyectosEnriquecidos.filter(
        (p): p is AccProjectRow => p !== null,
      );

      // Retornar con la estructura original
      if (res && 'results' in res && res.results !== undefined) {
        const base = { ...res } as GetProyectosListResult;
        return {
          ...base,
          results: proyectosFiltrados,
          pagination: (res as { pagination?: Record<string, unknown> })
            .pagination
            ? {
                ...(res as { pagination: Record<string, unknown> }).pagination,
                totalResults: proyectosFiltrados.length,
              }
            : undefined,
        };
      } else if (res && 'data' in res && res.data) {
        const data = res.data as {
          results?: AccProjectRow[];
          pagination?: Record<string, unknown>;
        };
        return {
          ...res,
          data: {
            ...data,
            results: proyectosFiltrados,
            pagination: data.pagination
              ? { ...data.pagination, totalResults: proyectosFiltrados.length }
              : undefined,
          },
        } as GetProyectosListResult;
      } else {
        return {
          ...(res ?? {}),
          results: proyectosFiltrados,
        } as GetProyectosListResult;
      }
    }

    return resultado;
  }
}
