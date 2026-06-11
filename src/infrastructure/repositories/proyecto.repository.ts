import { Injectable } from '@nestjs/common';
import type {
  IProyectoRepository,
  ListarProyectosParams,
  ListarProyectosResponse,
  ProyectoPorEstadoItem,
  CrearProyectoData,
  EditarProyectoData,
  ListarUsuariosDisponiblesParams,
  CrearDocumentoProyectoData,
  ActualizarDocumentoProyectoData,
  ListarEntregablesProyectoParams,
  ListarEntregablesParaSelectParams,
  ListarEntregablesProyectoResponse,
  EntregableSelectOption,
  CrearEntregableProyectoData,
  ActualizarEntregableProyectoData,
} from '../../domain/repositories/proyecto.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';

@Injectable()
export class ProyectoRepository implements IProyectoRepository {
  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
  ) {}

  async listarProyectos(
    params: ListarProyectosParams,
  ): Promise<ListarProyectosResponse> {
    const {
      idUsuario,
      idTipoProyecto = null,
      idPais = null,
      idCliente = null,
      busqueda = '',
      limit = 10,
      offset = 0,
    } = params;

    const result = await this.databaseFunctionService.callFunction<any>(
      'pro_ListarProyectos',
      [idUsuario, idTipoProyecto, idPais, idCliente, busqueda, limit, offset],
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

  async contarProyectosPorEstado(): Promise<ProyectoPorEstadoItem[]> {
    const result = await this.databaseFunctionService.callFunction<{
      nombre_estado: string;
      cantidad: number | string;
    }>('pro_ContarProyectosPorEstado', []);
    if (!Array.isArray(result)) return [];
    return result.map((row) => ({
      nombre_estado: row.nombre_estado ?? 'Sin estado',
      cantidad:
        typeof row.cantidad === 'number'
          ? row.cantidad
          : Number(row.cantidad) || 0,
    }));
  }

  async obtenerProyectoPorId(idProyecto: number): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_ObtenerProyectoPorId',
      [idProyecto],
    );
    if (result?.coordinadores && Array.isArray(result.coordinadores)) {
      result.coordinadores = result.coordinadores.map(
        (c: { miembros_equipo?: unknown }) => {
          const { miembros_equipo, ...rest } = c as {
            miembros_equipo?: unknown;
            [k: string]: unknown;
          };
          return { ...rest, miembrosEquipo: miembros_equipo ?? [] };
        },
      );
    }
    return result;
  }

  async crearProyecto(data: CrearProyectoData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_CrearProyecto',
      [
        data.nombreProyecto,
        data.nroProyecto,
        data.idTipoProyecto,
        data.idPais,
        data.direccion1 || null,
        data.direccion2 || null,
        data.ciudad || null,
        data.provincia || null,
        data.codigoPostal || null,
        data.idZonaHoraria || null,
        data.fechaInicio || null,
        data.fechaFinalizacion || null,
        data.valorProyecto || null,
        data.idTipoMoneda || null,
        data.diaValorizar ?? null,
        data.idCliente ?? null,
        data.observaciones || null,
        data.idModalidad ?? null,
        data.idEstadoProyecto ?? null,
        data.idEstadoCotizacion ?? null,
        data.idUsuarioCreacion,
      ],
    );

    return result;
  }

  async editarProyecto(data: EditarProyectoData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_EditarProyecto',
      [
        data.idProyecto,
        data.nombreProyecto,
        data.nroProyecto,
        data.idTipoProyecto,
        data.idPais,
        data.direccion1 || null,
        data.direccion2 || null,
        data.ciudad || null,
        data.provincia || null,
        data.codigoPostal || null,
        data.idZonaHoraria || null,
        data.fechaInicio || null,
        data.fechaFinalizacion || null,
        data.valorProyecto || null,
        data.idTipoMoneda || null,
        data.diaValorizar ?? null,
        data.idCliente ?? null,
        data.observaciones || null,
        data.idModalidad ?? null,
        data.idEstadoProyecto ?? null,
        data.idEstadoCotizacion ?? null,
        data.idUsuarioModificacion,
      ],
    );

    return result;
  }

  async eliminarProyecto(
    idProyecto: number,
    idUsuarioModificacion: number,
  ): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_EliminarProyecto',
      [idProyecto, idUsuarioModificacion],
    );

    return result;
  }

  async listarUsuariosProyecto(idProyecto: number): Promise<any[]> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'pro_ListarUsuariosProyecto',
      [idProyecto],
    );
    return result ?? [];
  }

  async asignarAccesoProyecto(
    idProyecto: number,
    idUsuario: number,
    idNivelAcceso: number | null,
    idUsuarioCreacion: number,
  ): Promise<{ success: boolean; message: string; id?: number }> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_AsignarAccesoProyecto',
      [idProyecto, idUsuario, idNivelAcceso, idUsuarioCreacion],
    );
    return result;
  }

  async actualizarNivelAccesoProyecto(
    idAcceso: number,
    idNivelAcceso: number,
    idUsuarioModificacion: number,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_ActualizarNivelAccesoProyecto',
      [idAcceso, idNivelAcceso, idUsuarioModificacion],
    );
    return result;
  }

  async removerAccesoProyecto(
    idAcceso: number,
    idUsuarioModificacion: number,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_RemoverAccesoProyecto',
      [idAcceso, idUsuarioModificacion],
    );
    return result;
  }

  async listarUsuariosDisponiblesProyecto(
    params: ListarUsuariosDisponiblesParams,
  ): Promise<{ data: any[]; total: number }> {
    const {
      idProyecto,
      busqueda = '',
      limit = 50,
      offset = 0,
      idRol = null,
    } = params;
    const result = await this.databaseFunctionService.callFunction<any>(
      'pro_ListarUsuariosDisponiblesProyecto',
      [idProyecto, busqueda, limit, offset, idRol],
    );
    const total = result?.[0]?.total_registros ?? 0;
    return { data: result ?? [], total: Number(total) };
  }

  async listarDocumentosProyecto(idProyecto: number): Promise<any[]> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'pro_ListarDocumentosProyecto',
      [idProyecto],
    );
    return result ?? [];
  }

  async crearDocumentoProyecto(
    idProyecto: number,
    data: CrearDocumentoProyectoData,
    idUsuarioCreacion: number,
  ): Promise<{ success: boolean; message: string; id?: number }> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_CrearDocumentoProyecto',
      [
        idProyecto,
        data.idTipoDocumento,
        data.nombre,
        data.linkDocumento ?? null,
        idUsuarioCreacion,
      ],
    );
    return result;
  }

  async actualizarDocumentoProyecto(
    idDocumento: number,
    data: ActualizarDocumentoProyectoData,
    idUsuarioModificacion: number,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_ActualizarDocumentoProyecto',
      [
        idDocumento,
        data.idTipoDocumento,
        data.nombre,
        data.linkDocumento ?? null,
        idUsuarioModificacion,
      ],
    );
    return result;
  }

  async eliminarDocumentoProyecto(
    idDocumento: number,
    idUsuarioModificacion: number,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_EliminarDocumentoProyecto',
      [idDocumento, idUsuarioModificacion],
    );
    return result;
  }

  async listarEntregablesProyecto(
    params: ListarEntregablesProyectoParams,
  ): Promise<ListarEntregablesProyectoResponse> {
    const {
      idProyecto = null,
      busqueda = '',
      idEstado = null,
      limit = 10,
      offset = 0,
      idUsuario = null,
      soloVigentes = true,
      esAdminSistemas = false,
    } = params;
    const result = await this.databaseFunctionService.callFunction<any>(
      'pro_ListarEntregablesProyecto',
      [
        idProyecto,
        busqueda,
        idEstado,
        limit,
        offset,
        idUsuario,
        soloVigentes,
        esAdminSistemas,
      ],
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

    const totalRegistros = Number(result[0]?.total_registros ?? 0);

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

  async listarEntregablesParaSelect(
    params: ListarEntregablesParaSelectParams,
  ): Promise<EntregableSelectOption[]> {
    const { idProyecto, idUsuario = null, esAdminSistemas = false } = params;
    if (idProyecto == null || idProyecto < 1) return [];
    const result =
      await this.databaseFunctionService.callFunction<EntregableSelectOption>(
        'pro_ListarEntregablesParaSelect',
        [idProyecto, idUsuario, esAdminSistemas],
      );
    return Array.isArray(result) ? result : [];
  }

  async obtenerEntregablePorId(idEntregable: number): Promise<any | null> {
    return this.databaseFunctionService.callFunctionSingle<any>(
      'pro_ObtenerEntregablePorId',
      [idEntregable],
    );
  }

  async crearEntregableProyecto(
    idProyecto: number,
    data: CrearEntregableProyectoData,
    idUsuarioCreacion: number,
  ): Promise<{ success: boolean; message: string; id?: number }> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_CrearEntregable',
      [
        idProyecto,
        data.nombre,
        data.descripcion ?? null,
        data.idEstado ?? 561,
        data.fechaEstimada ?? null,
        data.fechaEntrega ?? null,
        idUsuarioCreacion,
      ],
    );
    return result;
  }

  async actualizarEntregableProyecto(
    idEntregable: number,
    data: ActualizarEntregableProyectoData,
    idUsuarioModificacion: number,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_ActualizarEntregable',
      [
        idEntregable,
        data.nombre,
        data.descripcion ?? null,
        data.idEstado ?? null,
        data.fechaEstimada ?? null,
        data.fechaEntrega ?? null,
        idUsuarioModificacion,
      ],
    );
    return result;
  }

  async eliminarEntregableProyecto(
    idEntregable: number,
    idUsuarioModificacion: number,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_EliminarEntregable',
      [idEntregable, idUsuarioModificacion],
    );
    return result;
  }

  async listarCoordinadoresProyecto(
    idProyecto: number,
  ): Promise<
    import('../../domain/repositories/proyecto.repository.interface').CoordinadorProyectoItem[]
  > {
    const result = await this.databaseFunctionService.callFunction<any>(
      'pro_ListarCoordinadoresProyecto',
      [idProyecto],
    );
    const rows = result ?? [];
    return rows.map((r: Record<string, unknown>) => {
      const { miembros_equipo, ...rest } = r;
      return {
        ...rest,
        miembrosEquipo: (miembros_equipo as unknown[] | undefined) ?? [],
      } as import('../../domain/repositories/proyecto.repository.interface').CoordinadorProyectoItem;
    });
  }

  async guardarCoordinadoresProyecto(
    idProyecto: number,
    coordinadores: import('../../domain/repositories/proyecto.repository.interface').GuardarCoordinadoresProyectoPayload[],
    idUsuario: number,
  ): Promise<{ success: boolean; message: string }> {
    const payload = coordinadores.map((c) => ({
      idtrabajador: c.idtrabajador,
      miembros_equipo: c.miembrosEquipo ?? [],
    }));
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_GuardarCoordinadoresProyecto',
      [idProyecto, JSON.stringify(payload), idUsuario],
    );
    return result;
  }

  async obtenerCoordinadorParaTrabajadorEnProyecto(
    idProyecto: number,
    idTrabajador: number,
  ): Promise<number | null> {
    const result = await this.databaseFunctionService.callFunctionSingle<
      number | null
    >('pro_ObtenerCoordinadorParaTrabajadorEnProyecto', [
      idProyecto,
      idTrabajador,
    ]);
    return result != null && Number(result) > 0 ? Number(result) : null;
  }

  async obtenerPrimerCoordinadorProyecto(
    idProyecto: number,
  ): Promise<number | null> {
    const result = await this.databaseFunctionService.callFunctionSingle<
      number | null
    >('pro_ObtenerPrimerCoordinadorProyecto', [idProyecto]);
    return result != null && Number(result) > 0 ? Number(result) : null;
  }
}
