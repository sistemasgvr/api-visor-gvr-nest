import { Injectable } from '@nestjs/common';
import { IMenuRepository } from '../../domain/repositories/menu.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';

@Injectable()
export class MenuRepository implements IMenuRepository {
  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
  ) {}

  async listarMenuOpciones(): Promise<any[]> {
    // Call genListarMenuOpciones function
    // SELECT * FROM genListarMenuOpciones()
    const result = await this.databaseFunctionService.callFunction<any>(
      'gen_ListarMenuOpciones',
      [],
    );

    return result || [];
  }

  async obtenerMenuOpcionPorId(id: number): Promise<any> {
    // Call genObtenerMenuOpcionPorId function
    // SELECT * FROM genObtenerMenuOpcionPorId(p_id)
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_ObtenerMenuOpcionPorId',
      [id],
    );

    return result;
  }

  async obtenerOpcionesPorLista(idLista: number): Promise<any[]> {
    // Call genObtenerOpcionesPorLista function
    // SELECT * FROM genObtenerOpcionesPorLista(p_idLista)
    const result = await this.databaseFunctionService.callFunction<any>(
      'gen_ObtenerOpcionesPorLista',
      [idLista],
    );

    return result || [];
  }

  async obtenerIdListaPorNombre(nombre: string): Promise<number | null> {
    const rows = await this.databaseFunctionService.executeQuery<{ id: number }>(
      `SELECT id FROM genlistado WHERE LOWER(TRIM(nombre)) = LOWER(TRIM($1)) AND estado = 1 LIMIT 1`,
      [nombre],
    );
    const id = rows?.[0]?.id;
    return id != null && Number.isFinite(Number(id)) ? Number(id) : null;
  }

  async crearOpcionLista(idLista: number, nombre: string): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_CrearOpcionLista',
      [idLista, nombre],
    );
    return result;
  }

  async listarMenuRecursivo(idUsuario: number): Promise<any> {
    // Call genListarMenuRecursivoPorUsuarioV2 function
    // SELECT * FROM genListarMenuRecursivoPorUsuarioV2(p_idUsuario)
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_ListarMenuRecursivoPorUsuarioV2',
      [idUsuario],
    );

    if (!result) {
      return [];
    }

    // The function returns a JSON string in the first property (column name = function name, driver may lowercase)
    const row = result as Record<string, unknown>;
    const menuData =
      row.gen_ListarMenuRecursivoPorUsuarioV2 ??
      row.gen_listarmenurecursivoporusuariov2 ??
      row.genlistarmenurecursivoporusuariov2 ??
      row.genListarMenuRecursivoPorUsuarioV2 ??
      (Object.keys(row).length > 0 ? row[Object.keys(row)[0]] : undefined);

    if (typeof menuData === 'string') {
      try {
        return JSON.parse(menuData);
      } catch (e) {
        return [];
      }
    }

    return menuData || [];
  }
}
