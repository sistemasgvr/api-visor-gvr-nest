import { Injectable } from '@nestjs/common';
import type {
  IAccResourcesRepository,
  ListarRecursosParams,
  ListarRecursosResponse,
  CrearRecursoData,
  ActualizarRecursoData,
  ListarPermisosRolParams,
  AsignarPermisoData,
  SincronizarPermisosRolData,
  ListarPermisosUsuarioParams,
  AsignarPermisoUsuarioData,
  ActualizarNivelPermisoUsuarioData,
  SincronizarPermisosUsuarioData,
  ListarUsuariosDisponiblesRecursoParams,
  SincronizarPermisosProyectoData,
} from '../../domain/repositories/acc-resources.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';
import { normalizeExternalId } from '../../shared/utils/normalize-external-id.util';

@Injectable()
export class AccResourcesRepository implements IAccResourcesRepository {
  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
  ) {}

  async listarRecursos(
    params: ListarRecursosParams,
  ): Promise<ListarRecursosResponse> {
    const { busqueda = '', resourceType = '', limit = 10, offset = 0 } = params;

    const result = await this.databaseFunctionService.callFunction<any>(
      'acc_ListarRecursos',
      [busqueda, resourceType, limit, offset],
    );

    if (!result || result.length === 0) {
      return {
        data: [],
        pagination: {
          total: 0,
          limit,
          offset,
          total_pages: 0,
          current_page: 1,
        },
      };
    }

    const totalRegistros = result[0]?.total_registros || 0;

    return {
      data: result,
      pagination: {
        total: totalRegistros,
        limit,
        offset,
        total_pages: limit > 0 ? Math.ceil(totalRegistros / limit) : 0,
        current_page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      },
    };
  }

  async obtenerRecursoPorId(id: number): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_ObtenerRecursoPorId',
      [id],
    );

    return result;
  }

  async obtenerRecursoPorExternalId(externalId: string): Promise<any> {
    // Normalizar el externalId antes de buscar (quitar prefijo "b." si existe)
    const normalizedId = normalizeExternalId(externalId);

    // Buscar el recurso por externalId normalizado usando una query directa
    const query = `
            SELECT id, externalid, resourcetype, name, parentid, accountid, estado
            FROM accresources
            WHERE externalid = $1 AND estado = 1
            LIMIT 1
        `;

    const result = await this.databaseFunctionService.executeQuery<any>(query, [
      normalizedId,
    ]);

    return result.length > 0 ? result[0] : null;
  }

  async crearRecurso(data: CrearRecursoData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_CreateRecurso',
      [
        data.external_id,
        data.resource_type,
        data.name,
        data.parent_id || null,
        data.account_id || null,
        data.idUsuarioCreacion,
      ],
    );

    return result;
  }

  async actualizarRecurso(
    id: number,
    data: ActualizarRecursoData,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_UpdateRecurso',
      [
        id,
        data.name,
        data.idUsuarioModificacion,
        data.parent_id || null,
        data.account_id || null,
      ],
    );

    return result;
  }

  async eliminarRecurso(
    id: number,
    idUsuarioModificacion: number,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_DeleteRecurso',
      [id, idUsuarioModificacion],
    );

    return result;
  }

  async listarPermisosRol(params: ListarPermisosRolParams): Promise<any> {
    const { roleId, limit = 100, offset = 0 } = params;

    const result = await this.databaseFunctionService.callFunction<any>(
      'acc_ListarPermisosRol',
      [roleId, limit, offset],
    );

    if (!result || result.length === 0) {
      return {
        data: [],
        pagination: {
          total: 0,
          limit,
          offset,
          total_pages: 0,
          current_page: 1,
        },
      };
    }

    const totalRegistros = result[0]?.total_registros || 0;

    return {
      data: result,
      pagination: {
        total: totalRegistros,
        limit,
        offset,
        total_pages: limit > 0 ? Math.ceil(totalRegistros / limit) : 0,
        current_page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      },
    };
  }

  async listarRolesRecurso(resourceId: number): Promise<any> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'acc_ListarRolesRecurso',
      [resourceId],
    );

    return {
      data: result || [],
    };
  }

  async asignarPermiso(data: AsignarPermisoData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_AsignarPermiso',
      [data.role_id, data.resource_id, data.idUsuarioCreacion],
    );

    return result;
  }

  async removerPermiso(
    id: number,
    idUsuarioModificacion: number,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_RemoverPermiso',
      [id, idUsuarioModificacion],
    );

    return result;
  }

  async sincronizarPermisosRol(data: SincronizarPermisosRolData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_SincronizarPermisosRol',
      [data.role_id, data.resource_ids, data.idUsuarioModificacion],
    );

    return result;
  }

  // Métodos para permisos de usuarios
  async listarPermisosUsuario(
    params: ListarPermisosUsuarioParams,
  ): Promise<any> {
    const { userId, limit = 100, offset = 0 } = params;

    const result = await this.databaseFunctionService.callFunction<any>(
      'acc_ListarPermisosUsuario',
      [userId, limit, offset],
    );

    if (!result || result.length === 0) {
      return {
        data: [],
        pagination: {
          total: 0,
          limit,
          offset,
          total_pages: 0,
          current_page: 1,
        },
      };
    }

    const totalRegistros = result[0]?.total_registros || 0;

    return {
      data: result,
      pagination: {
        total: totalRegistros,
        limit,
        offset,
        total_pages: limit > 0 ? Math.ceil(totalRegistros / limit) : 0,
        current_page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      },
    };
  }

  async listarUsuariosRecurso(resourceId: number): Promise<any> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'acc_ListarUsuariosRecurso',
      [resourceId],
    );

    return {
      data: result || [],
    };
  }

  async listarUsuariosDisponiblesRecurso(
    params: ListarUsuariosDisponiblesRecursoParams,
  ): Promise<any> {
    const { resourceId, busqueda = '', limit = 100, offset = 0 } = params;

    const result = await this.databaseFunctionService.callFunction<any>(
      'acc_ListarUsuariosDisponiblesRecurso',
      [resourceId, busqueda, limit, offset],
    );

    if (!result || result.length === 0) {
      return {
        data: [],
        pagination: {
          total: 0,
          limit,
          offset,
          total_pages: 0,
          current_page: 1,
        },
      };
    }

    const totalRegistros = result[0]?.total_registros || 0;

    return {
      data: result,
      pagination: {
        total: totalRegistros,
        limit,
        offset,
        total_pages: limit > 0 ? Math.ceil(totalRegistros / limit) : 0,
        current_page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      },
    };
  }

  async asignarPermisoUsuario(data: AsignarPermisoUsuarioData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_AsignarPermisoUsuario',
      [
        data.user_id,
        data.resource_id,
        data.permission_level_id || 2, // Default: view_download
        data.idUsuarioCreacion,
      ],
    );

    return result;
  }

  async actualizarNivelPermisoUsuario(
    data: ActualizarNivelPermisoUsuarioData,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_ActualizarNivelPermisoUsuario',
      [
        data.userAccAccessId,
        data.permission_level_id,
        data.idUsuarioModificacion,
      ],
    );

    return result;
  }

  async removerPermisoUsuario(
    id: number,
    idUsuarioModificacion: number,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_RemoverPermisoUsuario',
      [id, idUsuarioModificacion],
    );

    return result;
  }

  async sincronizarPermisosUsuario(
    data: SincronizarPermisosUsuarioData,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_SincronizarPermisosUsuario',
      [data.user_id, data.resource_ids, data.idUsuarioModificacion],
    );

    return result;
  }

  async sincronizarPermisosProyecto(
    data: SincronizarPermisosProyectoData,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_SincronizarPermisosProyecto',
      [
        data.project_resource_id,
        data.idUsuarioModificacion,
        data.roles_ids || null, // Si no hay roles, pasar null
      ],
    );

    return result;
  }

  async listarNivelesPermiso(): Promise<any> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'acc_ListarPermissionLevels',
      [],
    );

    return {
      data: result || [],
    };
  }
}
