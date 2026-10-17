import {
  granularDatabaseFailure,
  granularScalar,
} from '../auth/granular-function-result';
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
    const rows = await this.databaseFunctionService.executeQuery<{
      id: number;
    }>(
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

  async listarMenuRecursivo(idUsuario: number): Promise<unknown[]> {
    const name = 'gen_ListarMenuRecursivoPorUsuarioV3';
    try {
      const menu = granularScalar(
        await this.databaseFunctionService.callFunctionSingle<unknown>(name, [
          idUsuario,
        ]),
        name,
      );
      if (!Array.isArray(menu)) throw new Error('Árbol granular inválido');
      const pending: unknown[] = [...menu];
      const ids = new Set<number>();
      while (pending.length) {
        const value = pending.pop();
        if (!value || typeof value !== 'object' || Array.isArray(value))
          throw new Error('Nodo de menú inválido');
        const node = value as Record<string, unknown>;
        if (
          !Number.isSafeInteger(node.id) ||
          (node.id as number) < 1 ||
          ids.has(node.id as number) ||
          typeof node.nombre !== 'string' ||
          typeof node.accesodirecto !== 'boolean' ||
          !Array.isArray(node.hijos) ||
          (node.accesodirecto === false && node.url !== null) ||
          (node.url !== null && typeof node.url !== 'string')
        )
          throw new Error('Contrato de menú inválido');
        ids.add(node.id as number);
        for (const child of node.hijos) pending.push(child);
      }
      return menu;
    } catch (error) {
      return granularDatabaseFailure(error);
    }
  }
}
