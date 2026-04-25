import { Injectable } from '@nestjs/common';
import type {
  IMenuGestionRepository,
  ListarMenusParams,
  ListarMenusResponse,
  CrearMenuData,
  EditarMenuData,
  AsignarRolMenuData,
  AsignarRolesMenuData,
  SincronizarRolesMenuData,
  ClonarMenuData,
  MoverMenuData,
  ReordenarMenuData,
} from '../../domain/repositories/menu-gestion.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';

@Injectable()
export class MenuGestionRepository implements IMenuGestionRepository {
  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
  ) {}

  async listarMenus(params: ListarMenusParams): Promise<ListarMenusResponse> {
    const { busqueda = '', limit = 10, offset = 0 } = params;

    const result = await this.databaseFunctionService.callFunction<any>(
      'gen_ListarMenuRecursivo',
      [busqueda, limit, offset],
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

  async listarMenusTree(): Promise<any[]> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'gen_ListarMenuRecursivoTree',
      [],
    );

    return result || [];
  }

  async listarMenuPadresDisponibles(idMenuActual?: number): Promise<any[]> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'gen_ListarMenuPadresDisponibles',
      [idMenuActual],
    );

    return result || [];
  }

  async obtenerMenuPorId(idMenu: number): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_ObtenerMenuPorId',
      [idMenu],
    );

    return result;
  }

  async obtenerDetalleMenu(idMenu: number): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_ObtenerDetalleMenu',
      [idMenu],
    );

    return result;
  }

  async crearMenu(data: CrearMenuData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_CrearMenuRecursivo',
      [
        data.nombre,
        data.url,
        data.icono,
        data.idPadre,
        data.orden,
        data.idUsuarioCreacion,
      ],
    );

    return result;
  }

  async editarMenu(data: EditarMenuData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_EditarMenuRecursivo',
      [
        data.idMenu,
        data.nombre,
        data.url,
        data.icono,
        data.idPadre,
        data.orden,
        data.idUsuarioModificacion,
      ],
    );

    return result;
  }

  async eliminarMenu(
    idMenu: number,
    idUsuarioModificacion: number,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_EliminarMenuRecursivo',
      [idMenu, idUsuarioModificacion],
    );

    return result;
  }

  async clonarMenu(data: ClonarMenuData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_ClonarMenu',
      [
        data.idMenu,
        data.nombreNuevo,
        data.idPadreNuevo,
        data.clonarRoles,
        data.idUsuarioCreacion,
      ],
    );

    return result;
  }

  async moverMenu(data: MoverMenuData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_MoverMenu',
      [data.idMenu, data.idPadreNuevo, data.idUsuarioModificacion],
    );

    return result;
  }

  async reordenarMenu(data: ReordenarMenuData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_ReordenarMenu',
      [data.idMenu, data.ordenNuevo, data.idUsuarioModificacion],
    );

    return result;
  }

  async listarRolesMenu(idMenu: number): Promise<any[]> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'gen_ListarRolesMenu',
      [idMenu],
    );

    return result || [];
  }

  async listarRolesDisponibles(idMenu: number): Promise<any[]> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'gen_ListarRolesDisponibles',
      [idMenu],
    );

    return result || [];
  }

  async asignarRolMenu(data: AsignarRolMenuData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_AsignarRolMenu',
      [data.idMenu, data.idRol, data.idUsuarioCreacion],
    );

    return result;
  }

  async asignarRolesMenu(data: AsignarRolesMenuData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_AsignarRolesMenu',
      [data.idMenu, JSON.stringify(data.roles), data.idUsuarioCreacion],
    );

    return result;
  }

  async removerRolMenu(
    idMenu: number,
    idRol: number,
    idUsuarioModificacion: number,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_RemoverRolMenu',
      [idMenu, idRol, idUsuarioModificacion],
    );

    return result;
  }

  async sincronizarRolesMenu(data: SincronizarRolesMenuData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_SincronizarRolesMenu',
      [data.idMenu, JSON.stringify(data.roles), data.idUsuarioModificacion],
    );

    return result;
  }
}
