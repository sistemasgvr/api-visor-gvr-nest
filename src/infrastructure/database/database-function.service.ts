import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Servicio genérico para ejecutar funciones almacenadas de PostgreSQL/Supabase
 *
 * Ejemplo de uso:
 * ```typescript
 * // Para llamar una función: SELECT * FROM mi_funcion($1, $2)
 * const result = await databaseFunctionService.callFunction<MiTipo>(
 *   'mi_funcion',
 *   [param1, param2]
 * );
 * ```
 */
@Injectable()
export class DatabaseFunctionService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Ejecuta una función almacenada de PostgreSQL
   * @param functionName Nombre de la función en la base de datos
   * @param params Array de parámetros para la función
   * @returns Resultado de la función
   */
  async callFunction<T = any>(
    functionName: string,
    params: any[] = [],
  ): Promise<T[]> {
    // Construir los placeholders ($1, $2, etc.)
    const placeholders = params.map((_, index) => `$${index + 1}`).join(', ');

    // Nombre entrecomillado para preservar mayúsculas (ej. "tra_ListarTrabajadores")
    const quotedName = `"${functionName.replace(/"/g, '""')}"`;
    const query = `SELECT * FROM ${quotedName}(${placeholders})`;

    // Debug: Log the query and params
    // console.log('🔍 SQL Query:', query);
    // console.log('🔍 Parameters:', params);

    // Ejecutar la query con los parámetros
    const result = await this.dataSource.query(query, params);

    return result;
  }

  /**
   * Ejecuta una función almacenada que retorna un solo valor
   * @param functionName Nombre de la función en la base de datos
   * @param params Array de parámetros para la función
   * @returns Primer resultado de la función o null
   */
  async callFunctionSingle<T = any>(
    functionName: string,
    params: any[] = [],
  ): Promise<T | null> {
    const result = await this.callFunction<T>(functionName, params);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Ejecuta una query SQL personalizada
   * @param query Query SQL a ejecutar
   * @param params Parámetros para la query
   * @returns Resultado de la query
   */
  async executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
    return await this.dataSource.query(query, params);
  }

  /**
   * Ejecuta un procedimiento almacenado (CALL)
   * @param procedureName Nombre del procedimiento
   * @param params Parámetros del procedimiento
   */
  async callProcedure(
    procedureName: string,
    params: any[] = [],
  ): Promise<void> {
    const placeholders = params.map((_, index) => `$${index + 1}`).join(', ');

    const quotedName = `"${procedureName.replace(/"/g, '""')}"`;
    const query = `CALL ${quotedName}(${placeholders})`;
    await this.dataSource.query(query, params);
  }
}
