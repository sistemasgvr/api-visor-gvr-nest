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

type AccProjectsResponse = {
  results?: AccProjectRow[];
  pagination?: {
    limit?: number;
    offset?: number;
    totalResults?: number;
    nextUrl?: string | null;
    previousUrl?: string | null;
  };
};

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
    const options = this.buildAccOptions(dto);
    const esAdministrador = this.isAdministrador(userRole);

    const targetLimit = dto.limit || 20;
    const targetOffset = dto.offset || 0;
    const requiereFiltroAcceso = Boolean(userId && !esAdministrador);

    if (!requiereFiltroAcceso) {
      const resultado = (await this.autodeskApiService.getAccProjects(
        accountId,
        options as Record<string, unknown>,
        dto.token,
      )) as GetProyectosListResult | null | undefined;

      return this.enrichResponse(resultado, null);
    }

    const proyectosConAcceso =
      (await this.loadProyectosConAcceso(userId, esAdministrador)) ??
      new Set<string>();

    if (proyectosConAcceso.size === 0) {
      return {
        results: [],
        pagination: {
          limit: targetLimit,
          offset: targetOffset,
          totalResults: 0,
          nextUrl: null,
          previousUrl: null,
        },
      };
    }

    const proyectosPagina: AccProjectRow[] = [];
    let accOffset = 0;
    let lastPagination: AccProjectsResponse['pagination'];
    let hasMoreAccPages = true;
    const maxAccFetches = 30;
    let fetchCount = 0;
    const neededCount = targetOffset + targetLimit;
    const batchSize = Math.max(targetLimit, 50);

    while (
      proyectosPagina.length < neededCount &&
      hasMoreAccPages &&
      fetchCount < maxAccFetches
    ) {
      fetchCount += 1;
      const batch = (await this.autodeskApiService.getAccProjects(
        accountId,
        {
          ...options,
          limit: batchSize,
          offset: accOffset,
        } as Record<string, unknown>,
        dto.token,
      )) as AccProjectsResponse | null | undefined;

      const batchResults = batch?.results ?? [];
      lastPagination = batch?.pagination;

      if (!batchResults.length) {
        break;
      }

      const filtrados = await this.enrichProjects(
        batchResults,
        proyectosConAcceso,
      );
      proyectosPagina.push(...filtrados);

      const totalAcc = Number(lastPagination?.totalResults ?? 0);
      accOffset += batchSize;
      hasMoreAccPages =
        Boolean(lastPagination?.nextUrl) ||
        (totalAcc > 0 && accOffset < totalAcc);
    }

    const pageResults = proyectosPagina.slice(
      targetOffset,
      targetOffset + targetLimit,
    );
    const hasMoreFiltered =
      proyectosPagina.length > targetOffset + targetLimit || hasMoreAccPages;

    return {
      results: pageResults,
      pagination: {
        limit: targetLimit,
        offset: targetOffset,
        totalResults: hasMoreAccPages
          ? Math.max(
              targetOffset + pageResults.length + 1,
              Number(lastPagination?.totalResults ?? 0),
            )
          : proyectosPagina.length,
        nextUrl: hasMoreFiltered ? (lastPagination?.nextUrl ?? 'more') : null,
        previousUrl:
          targetOffset > 0 ? (lastPagination?.previousUrl ?? null) : null,
      },
    };
  }

  private buildAccOptions(
    dto: GetProyectosDto,
  ): Record<string, string | number | string[] | undefined> {
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

    return options;
  }

  private isAdministrador(userRole?: string): boolean {
    if (!userRole) return false;
    const role = userRole.toLowerCase();
    return (
      role.includes('admin') ||
      role.includes('administrador') ||
      role === 'admin' ||
      role === 'administrador'
    );
  }

  private async loadProyectosConAcceso(
    userId?: number,
    esAdministrador?: boolean,
  ): Promise<Set<string> | null> {
    if (!userId || esAdministrador) {
      return null;
    }

    const proyectosConAcceso = new Set<string>();
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

        (permisosUsuario.data || [])
          .filter(
            (p: AccResourcePermissionRow) =>
              p.resourcetype === 'project' && p.externalid,
          )
          .forEach((p: AccResourcePermissionRow) => {
            proyectosConAcceso.add(p.externalid as string);
          });

        const total = permisosUsuario.pagination?.total || 0;
        hasMore = offset + limit < total;
        offset += limit;
      }
    } catch (error) {
      console.warn('Error obteniendo permisos del usuario:', error);
    }

    return proyectosConAcceso;
  }

  private async enrichProject(
    proyecto: AccProjectRow,
  ): Promise<AccProjectRow> {
    try {
      const registroCreacion =
        await this.auditoriaRepository.obtenerAuditoriaPorMetadatos(
          'project',
          'PROJECT_CREATE',
          'accProjectId',
          proyecto.id,
        );

      if (registroCreacion?.usuario) {
        return {
          ...proyecto,
          createdByReal: registroCreacion.usuario,
          createdByRealId: registroCreacion.idusuario,
          createdByRealRole: registroCreacion.rol || null,
          createdByRealEmpresa: registroCreacion.empresa || null,
        };
      }
    } catch {
      /* noop */
    }

    return proyecto;
  }

  private async enrichProjects(
    proyectos: AccProjectRow[],
    proyectosConAcceso: Set<string> | null,
  ): Promise<AccProjectRow[]> {
    const enriquecidos = await Promise.all(
      proyectos.map(async (proyecto) => {
        if (proyectosConAcceso && !proyectosConAcceso.has(proyecto.id)) {
          return null;
        }
        return this.enrichProject(proyecto);
      }),
    );

    return enriquecidos.filter((p): p is AccProjectRow => p !== null);
  }

  private async enrichResponse(
    resultado: GetProyectosListResult | null | undefined,
    proyectosConAcceso: Set<string> | null,
  ): Promise<GetProyectosListResult | null | undefined> {
    const res = resultado as AccProjectsResponse | null | undefined;
    const proyectos = res?.results ?? [];

    if (!Array.isArray(proyectos) || proyectos.length === 0) {
      return resultado;
    }

    const proyectosFiltrados = await this.enrichProjects(
      proyectos,
      proyectosConAcceso,
    );

    return {
      ...(res ?? {}),
      results: proyectosFiltrados,
      pagination: res?.pagination,
    };
  }
}
