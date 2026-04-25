import { Injectable } from '@nestjs/common';
import { IAccRecursosRepository } from '../../domain/repositories/acc-recursos.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';

/**
 * Las funciones PostgreSQL que retornan JSONB aparecen en el row con el nombre de la función;
 * el driver puede usar distinto casing o guiones (p. ej. acc_asignarusuariosincidencia vs accasignarusuariosincidencia).
 * Tomar el valor de la única columna evita depender de esa convención.
 */
function pickJsonbFromFunctionRow(
  row: Record<string, unknown> | null | undefined,
): unknown {
  if (!row || typeof row !== 'object') {
    return null;
  }
  const values = Object.values(row).filter(
    (v) => v !== undefined && v !== null,
  );
  if (values.length === 1) {
    return values[0];
  }
  return (
    values.find(
      (v) =>
        typeof v === 'object' &&
        v !== null &&
        !Array.isArray(v) &&
        ('success' in v ||
          'data' in v ||
          'id_recurso' in v ||
          ('id' in v && 'recurso_id' in v)),
    ) ?? null
  );
}

@Injectable()
export class AccRecursosRepository implements IAccRecursosRepository {
  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
  ) {}

  async guardarRecurso(
    recursoTipo: string,
    recursoId: string,
    recursoUrn: string | null,
    projectId: string | null,
    parentId: string | null,
    idUsuarioCreador: number | null,
    idUsuarioAsignado: number | null,
    nombre: string | null,
    descripcion: string | null,
    estadoRecurso: string | null,
    metadatos: any,
    idUsuarioCreacion: number,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_GuardarRecurso',
      [
        recursoTipo,
        recursoId,
        recursoUrn,
        projectId,
        parentId,
        idUsuarioCreador,
        idUsuarioAsignado,
        nombre,
        descripcion,
        estadoRecurso,
        metadatos,
        idUsuarioCreacion,
      ],
    );

    if (!result) {
      return null;
    }

    const jsonbResult =
      pickJsonbFromFunctionRow(result as Record<string, unknown>) ??
      result.acc_guardarrecurso ??
      result.accguardarrecurso ??
      result.accGuardarRecurso ??
      result;

    return jsonbResult;
  }

  async obtenerRecurso(
    recursoTipo: string,
    recursoId: string,
  ): Promise<any | null> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_ObtenerRecurso',
      [recursoTipo, recursoId],
    );

    if (!result) {
      return null;
    }

    const jsonbResult =
      pickJsonbFromFunctionRow(result as Record<string, unknown>) ??
      result.acc_obtenerrecurso ??
      result.accobtenerrecurso ??
      result.accObtenerRecurso ??
      result;

    // Si el resultado tiene success: false, retornar null
    if (jsonbResult && jsonbResult.success === false) {
      return null;
    }

    return jsonbResult;
  }

  async actualizarRecurso(
    recursoTipo: string,
    recursoId: string,
    idUsuarioAsignado: number | null,
    idUsuarioModifico: number | null,
    estadoRecurso: string | null,
    metadatos: any | null,
    idUsuarioModificacion: number,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_ActualizarRecurso',
      [
        recursoTipo,
        recursoId,
        idUsuarioAsignado,
        idUsuarioModifico,
        estadoRecurso,
        metadatos,
        idUsuarioModificacion,
        true, // p_actualizar_asignado: siempre actualizar el campo de asignación (incluso si es NULL para desasignar)
      ],
    );

    if (!result) {
      return null;
    }

    const jsonbResult =
      pickJsonbFromFunctionRow(result as Record<string, unknown>) ??
      result.accactualizarrecurso ??
      result.accActualizarRecurso ??
      result;

    return jsonbResult;
  }

  async obtenerRecursosPorProyecto(
    projectId: string,
    recursoTipo: string | null,
    limit: number,
    offset: number,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_ObtenerRecursosPorProyecto',
      [projectId, recursoTipo, limit, offset],
    );

    if (!result) {
      return { data: [], total_registros: 0 };
    }

    const jsonbResult =
      pickJsonbFromFunctionRow(result as Record<string, unknown>) ??
      result.accobtenerrecursosporproyecto ??
      result.accObtenerRecursosPorProyecto ??
      result;

    return jsonbResult || { data: [], total_registros: 0 };
  }

  async obtenerRecursosHijos(
    parentId: string,
    recursoTipo: string | null,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_ObtenerRecursosHijos',
      [parentId, recursoTipo],
    );

    if (!result) {
      return [];
    }

    const jsonbResult =
      pickJsonbFromFunctionRow(result as Record<string, unknown>) ??
      result.accobtenerrecursoshijos ??
      result.accObtenerRecursosHijos ??
      result;

    // Si es un array, retornarlo directamente
    if (Array.isArray(jsonbResult)) {
      return jsonbResult;
    }

    // Si tiene una propiedad data, retornarla
    if (jsonbResult && jsonbResult.data) {
      return jsonbResult.data;
    }

    return [];
  }

  async obtenerRecursosUsuario(
    idUsuario: number,
    recursoTipo: string | null,
    rol: string,
    limit: number,
    offset: number,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_ObtenerRecursosUsuario',
      [idUsuario, recursoTipo, rol, limit, offset],
    );

    if (!result) {
      return { data: [], total_registros: 0 };
    }

    const jsonbResult =
      pickJsonbFromFunctionRow(result as Record<string, unknown>) ??
      result.accobtenerrecursosusuario ??
      result.accObtenerRecursosUsuario ??
      result;

    // Si tiene estructura con data y total_registros, retornarla
    if (jsonbResult && jsonbResult.data !== undefined) {
      return jsonbResult;
    }

    // Si es un array, convertirlo a formato esperado
    if (Array.isArray(jsonbResult)) {
      return {
        data: jsonbResult,
        total_registros: jsonbResult.length,
      };
    }

    return { data: [], total_registros: 0 };
  }

  async asignarUsuariosIncidencia(
    issueId: string,
    projectId: string,
    userIds: number[],
    idUsuarioAsignador: number,
    idUsuarioCreacion: number,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_AsignarUsuariosIncidencia',
      [issueId, projectId, userIds, idUsuarioAsignador, idUsuarioCreacion],
    );

    if (!result) {
      return null;
    }

    const jsonbResult =
      pickJsonbFromFunctionRow(result as Record<string, unknown>) ??
      result.accasignarusuariosincidencia ??
      result.acc_asignarusuariosincidencia ??
      result.accAsignarUsuariosIncidencia ??
      result;

    return jsonbResult;
  }

  async desasignarUsuariosIncidencia(
    issueId: string,
    userIds: number[] | null,
    idUsuarioModificacion: number,
  ): Promise<any> {
    // Asegurar que si es un array vacío, se pase como null explícitamente
    // PostgreSQL necesita null para desasignar todos, no un array vacío
    const userIdsParam =
      userIds && Array.isArray(userIds) && userIds.length > 0 ? userIds : null;

    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_DesasignarUsuariosIncidencia',
      [issueId, idUsuarioModificacion, userIdsParam],
    );

    if (!result) {
      return {
        success: false,
        message: 'No se obtuvo respuesta de la función de desasignación',
      };
    }

    const jsonbResult =
      pickJsonbFromFunctionRow(result as Record<string, unknown>) ??
      result.accdesasignarusuariosincidencia ??
      result.acc_desasignarusuariosincidencia ??
      result.accDesasignarUsuariosIncidencia ??
      result;

    return jsonbResult;
  }

  async obtenerUsuariosAsignadosIncidencia(issueId: string): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'acc_ObtenerUsuariosAsignadosIncidencia',
      [issueId],
    );

    if (!result) {
      return { success: false, data: [], total: 0 };
    }

    const jsonbResult =
      pickJsonbFromFunctionRow(result as Record<string, unknown>) ??
      result.accobtenerusuariosasignadosincidencia ??
      result.acc_obtenerusuariosasignadosincidencia ??
      result.accObtenerUsuariosAsignadosIncidencia ??
      result;

    return jsonbResult;
  }
}
