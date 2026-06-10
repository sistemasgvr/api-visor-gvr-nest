import { Injectable } from '@nestjs/common';
import type {
  ActualizarMailPlantillaData,
  CrearMailPlantillaData,
  IMailPlantillaCorreoRepository,
  ListarMailPlantillasParams,
  ListarMailPlantillasResponse,
  SembrarPlantillaResult,
  SqlMutationResult,
} from '../../domain/repositories/mail-plantilla-correo.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';
import {
  mapMailPlantillaDetalleRow,
  mapMailPlantillaHistorialDetalleRow,
  mapMailPlantillaHistorialRow,
  mapMailPlantillaListRow,
  mapMailPlantillaSlugRow,
  mapSqlMutationRow,
} from '../mail/mail-plantilla-row.mapper';

@Injectable()
export class MailPlantillaCorreoRepository implements IMailPlantillaCorreoRepository {
  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
  ) {}

  async listar(
    params: ListarMailPlantillasParams,
  ): Promise<ListarMailPlantillasResponse> {
    const {
      busqueda = '',
      soloActivas = true,
      limit = 50,
      offset = 0,
    } = params;

    const result = await this.databaseFunctionService.callFunction<
      Record<string, unknown>
    >('mail_ListarPlantillasCorreo', [busqueda, soloActivas, limit, offset]);

    if (!result?.length) {
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

    const total = Number(result[0]?.total_registros ?? 0);
    return {
      data: result.map(mapMailPlantillaListRow),
      pagination: {
        total,
        limit,
        offset,
        total_pages: limit > 0 ? Math.ceil(total / limit) : 0,
        current_page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      },
    };
  }

  async obtenerPorId(id: number) {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('mail_ObtenerPlantillaCorreoPorId', [id]);
    return row ? mapMailPlantillaDetalleRow(row) : null;
  }

  async obtenerPorSlug(slug: string, soloActivas = true) {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('mail_ObtenerPlantillaCorreoPorSlug', [slug, soloActivas]);
    return row ? mapMailPlantillaSlugRow(row) : null;
  }

  async crear(data: CrearMailPlantillaData): Promise<SqlMutationResult> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('mail_CrearPlantillaCorreo', [
      data.slug,
      data.nombre,
      data.asuntoPlantilla,
      data.idUsuario,
      data.descripcion ?? null,
      data.cuerpoMjml ?? null,
      data.cuerpoHtml ?? null,
      data.designJson ? JSON.stringify(data.designJson) : null,
      data.esquemaVariables?.length
        ? JSON.stringify(data.esquemaVariables)
        : null,
      data.variablesPrueba !== undefined
        ? JSON.stringify(data.variablesPrueba ?? {})
        : null,
      data.claveLayout ?? 'base',
      data.esSistema ?? false,
    ]);
    return mapSqlMutationRow(row);
  }

  async actualizar(data: ActualizarMailPlantillaData): Promise<SqlMutationResult> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('mail_ActualizarPlantillaCorreo', [
      data.id,
      data.idUsuario,
      data.nombre ?? null,
      data.descripcion ?? null,
      data.asuntoPlantilla ?? null,
      data.cuerpoMjml ?? null,
      data.cuerpoHtml ?? null,
      data.designJson !== undefined
        ? data.designJson
          ? JSON.stringify(data.designJson)
          : ''
        : null,
      data.esquemaVariables !== undefined
        ? JSON.stringify(data.esquemaVariables ?? [])
        : null,
      data.variablesPrueba !== undefined
        ? JSON.stringify(data.variablesPrueba ?? {})
        : null,
      data.claveLayout ?? null,
      data.estado ?? null,
    ]);
    return mapSqlMutationRow(row);
  }

  async actualizarVariablesPrueba(
    id: number,
    idUsuario: number,
    variablesPrueba: Record<string, unknown>,
  ): Promise<SqlMutationResult> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('mail_ActualizarVariablesPruebaPlantillaCorreo', [
      id,
      idUsuario,
      JSON.stringify(variablesPrueba ?? {}),
    ]);
    return mapSqlMutationRow(row);
  }

  async eliminar(id: number, idUsuario: number): Promise<SqlMutationResult> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('mail_EliminarPlantillaCorreo', [id, idUsuario]);
    return mapSqlMutationRow(row);
  }

  async listarHistorial(idPlantilla: number, limit = 20, offset = 0) {
    const result = await this.databaseFunctionService.callFunction<
      Record<string, unknown>
    >('mail_ListarHistorialPlantillaCorreo', [idPlantilla, limit, offset]);

    if (!result?.length) {
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

    const total = Number(result[0]?.total_registros ?? 0);
    return {
      data: result.map(mapMailPlantillaHistorialRow),
      pagination: {
        total,
        limit,
        offset,
        total_pages: limit > 0 ? Math.ceil(total / limit) : 0,
        current_page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      },
    };
  }

  async obtenerHistorialPorId(idHistorial: number) {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('mail_ObtenerHistorialPlantillaCorreoPorId', [idHistorial]);
    return row ? mapMailPlantillaHistorialDetalleRow(row) : null;
  }

  async sembrarPlantillasSistema(
    idUsuario?: number | null,
  ): Promise<SembrarPlantillaResult[]> {
    const rows = await this.databaseFunctionService.callFunction<
      Record<string, unknown>
    >('mail_SembrarPlantillasCorreoSistema', [idUsuario ?? null]);
    return (rows ?? []).map((row) => ({
      slug: String(row.slug ?? ''),
      accion: String(row.accion ?? ''),
    }));
  }
}
