import { Injectable } from '@nestjs/common';
import type {
  INovedadRepository,
  ListarNovedadLanzamientosParams,
  ListarNovedadLanzamientosResponse,
  CrearNovedadLanzamientoData,
  EditarNovedadLanzamientoData,
  SincronizarRolesNovedadData,
  CrearNovedadTarjetaData,
  EditarNovedadTarjetaData,
} from '../../domain/repositories/novedad.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';

function pickJsonbFromFunctionRow(
  row: Record<string, unknown> | null | undefined,
): unknown {
  if (!row || typeof row !== 'object') {
    return null;
  }
  const values = Object.values(row).filter((v) => v !== undefined && v !== null);
  if (values.length === 1) {
    return values[0];
  }
  return (
    values.find(
      (v) =>
        typeof v === 'object' &&
        v !== null &&
        !Array.isArray(v) &&
        ('success' in v || 'data' in v || 'message' in v),
    ) ?? row
  );
}

function parseJsonbResult(result: Record<string, unknown> | null): any {
  if (!result) {
    return null;
  }

  const jsonbResult = pickJsonbFromFunctionRow(result);

  if (typeof jsonbResult === 'string') {
    try {
      return JSON.parse(jsonbResult);
    } catch {
      return null;
    }
  }

  return jsonbResult;
}

@Injectable()
export class NovedadRepository implements INovedadRepository {
  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
  ) {}

  async listarLanzamientos(
    params: ListarNovedadLanzamientosParams,
  ): Promise<ListarNovedadLanzamientosResponse> {
    const { busqueda = '', soloActivos = false, limit = 20, offset = 0 } =
      params;

    const result = await this.databaseFunctionService.callFunction<any>(
      'gen_ListarNovedadLanzamientos',
      [busqueda, soloActivos, limit, offset],
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

    const totalRegistros = result[0]?.total_registros ?? 0;

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

  async obtenerLanzamiento(id: number): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_ObtenerNovedadLanzamiento',
      [id],
    );

    return parseJsonbResult(result);
  }

  async crearLanzamiento(data: CrearNovedadLanzamientoData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_CrearNovedadLanzamiento',
      [
        data.codigoVersion,
        data.titulo,
        data.descripcion ?? null,
        data.fechaPublicacion ?? null,
        data.fechaVigenciaHasta ?? null,
        data.textoBotonCerrar ?? 'Entendido',
        data.idUsuarioCreacion,
      ],
    );

    return result;
  }

  async editarLanzamiento(data: EditarNovedadLanzamientoData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_EditarNovedadLanzamiento',
      [
        data.id,
        data.codigoVersion,
        data.titulo,
        data.descripcion ?? null,
        data.fechaPublicacion ?? null,
        data.fechaVigenciaHasta ?? null,
        data.textoBotonCerrar ?? null,
        data.idUsuarioModificacion,
      ],
    );

    return result;
  }

  async eliminarLanzamiento(
    id: number,
    idUsuarioModificacion: number,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_EliminarNovedadLanzamiento',
      [id, idUsuarioModificacion],
    );

    return result;
  }

  async sincronizarRoles(data: SincronizarRolesNovedadData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_SincronizarRolesNovedad',
      [
        data.idNovedadLanzamiento,
        data.roles ?? [],
        data.idUsuarioModificacion,
      ],
    );

    return result;
  }

  async crearTarjeta(data: CrearNovedadTarjetaData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_CrearNovedadTarjeta',
      [
        data.idNovedadLanzamiento,
        data.titulo,
        data.descripcion ?? null,
        data.orden ?? 0,
        data.tipoMultimedia ?? 'imagen',
        data.idArchivo ?? null,
        data.urlMultimedia ?? null,
        data.idUsuarioCreacion,
      ],
    );

    return result;
  }

  async editarTarjeta(data: EditarNovedadTarjetaData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_EditarNovedadTarjeta',
      [
        data.id,
        data.titulo,
        data.descripcion ?? null,
        data.orden ?? null,
        data.tipoMultimedia ?? null,
        data.idArchivo ?? null,
        data.urlMultimedia ?? null,
        data.idUsuarioModificacion,
      ],
    );

    return result;
  }

  async eliminarTarjeta(
    id: number,
    idUsuarioModificacion: number,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_EliminarNovedadTarjeta',
      [id, idUsuarioModificacion],
    );

    return result;
  }

  async obtenerPendientesUsuario(idUsuario: number): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_NovedadPendientesUsuario',
      [idUsuario],
    );

    return parseJsonbResult(result);
  }

  async marcarVista(
    idUsuario: number,
    idNovedadLanzamiento: number,
    idUsuarioAuditoria?: number,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'gen_NovedadMarcarVista',
      [idUsuario, idNovedadLanzamiento, idUsuarioAuditoria ?? idUsuario],
    );

    return parseJsonbResult(result);
  }
}
