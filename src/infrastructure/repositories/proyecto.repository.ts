import { Injectable, Logger } from '@nestjs/common';
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
import { ID_ESTADO_ENTREGABLE_PROCESO } from '../../domain/constants/estado-entregable.constants';
import { MinioStorageService } from '../storage/minio-storage.service';

@Injectable()
export class ProyectoRepository implements IProyectoRepository {
  private readonly logger = new Logger(ProyectoRepository.name);

  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
    private readonly minioStorage: MinioStorageService,
  ) {}

  private async resolverFotoPerfil(
    fotoAlmacenada: unknown,
  ): Promise<string | null> {
    const raw =
      typeof fotoAlmacenada === 'string' ? fotoAlmacenada.trim() : '';
    if (!raw) return null;
    try {
      return await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(raw);
    } catch (error) {
      this.logger.warn(
        `No se pudo resolver URL de foto de perfil: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return raw;
    }
  }

  /** URL almacenada en genarchivo para el usuario (fallback si el SQL V2 aún no trae la columna). */
  private async obtenerUrlFotoPerfilPorIdUsuario(
    idUsuario: number,
  ): Promise<string | null> {
    if (idUsuario == null || idUsuario < 1) return null;
    const rows = await this.databaseFunctionService.executeQuery<{
      url: string | null;
    }>(
      `SELECT g.url AS url
       FROM authusuarios u
       LEFT JOIN genarchivo g ON g.id = u.idarchivofotoperfil AND g.estado = 1
       WHERE u.id = $1 AND u.estado = 1
       LIMIT 1`,
      [idUsuario],
    );
    const url = rows?.[0]?.url;
    return url != null && String(url).trim() !== '' ? String(url).trim() : null;
  }

  private pickFotoPerfilUsuarioCreacion(row: Record<string, unknown>): unknown {
    return (
      row.fotoperfilusuariocreacion ??
      row.fotoPerfilUsuarioCreacion ??
      row.fotoperfil ??
      null
    );
  }

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
      fechaInicio = null,
      fechaFin = null,
    } = params;
    const fInicio =
      typeof fechaInicio === 'string' && fechaInicio.trim()
        ? fechaInicio.trim()
        : null;
    const fFin =
      typeof fechaFin === 'string' && fechaFin.trim() ? fechaFin.trim() : null;
    const result = await this.databaseFunctionService.callFunction<any>(
      'pro_ListarEntregablesProyectoV2',
      [
        idProyecto,
        busqueda,
        idEstado,
        limit,
        offset,
        idUsuario,
        soloVigentes,
        esAdminSistemas,
        fInicio,
        fFin,
      ],
    );

    const conteosRaw = await this.databaseFunctionService.callFunction<{
      idestado?: number;
      estadonombre?: string | null;
      cantidad?: number | string;
    }>('pro_ContarEntregablesPorEstadoV2', [
      idProyecto,
      busqueda,
      idUsuario,
      soloVigentes,
      esAdminSistemas,
      fInicio,
      fFin,
    ]);
    const conteosPorEstado = (conteosRaw ?? []).map((c) => ({
      idestado: Number(c.idestado),
      estadonombre: String(c.estadonombre ?? '').trim() || `Estado ${c.idestado}`,
      cantidad: Number(c.cantidad ?? 0),
    }));

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
        conteosPorEstado,
      };
    }

    const totalRegistros = Number(result[0]?.total_registros ?? 0);
    const fotosResueltas = new Map<string, Promise<string | null>>();
    const data = await Promise.all(
      result.map(async (row: Record<string, unknown>) => {
        const raw =
          typeof row.fotoperfilusuariocreacion === 'string'
            ? row.fotoperfilusuariocreacion.trim()
            : '';
        let fotoPerfil: string | null = null;
        if (raw) {
          let pendiente = fotosResueltas.get(raw);
          if (!pendiente) {
            pendiente = this.resolverFotoPerfil(raw);
            fotosResueltas.set(raw, pendiente);
          }
          fotoPerfil = await pendiente;
        }
        return {
          ...row,
          fotoperfilusuariocreacion: fotoPerfil,
        };
      }),
    );

    return {
      data,
      pagination: {
        total: totalRegistros,
        limit,
        offset,
        total_pages: limit > 0 ? Math.ceil(totalRegistros / limit) : 0,
        current_page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      },
      conteosPorEstado,
    };
  }

  async listarEntregablesParaSelect(
    params: ListarEntregablesParaSelectParams,
  ): Promise<EntregableSelectOption[]> {
    const { idProyecto, idUsuario = null, esAdminSistemas = false } = params;
    if (idProyecto == null || idProyecto < 1) return [];
    const result =
      await this.databaseFunctionService.callFunction<EntregableSelectOption>(
        'pro_ListarEntregablesParaSelectV2',
        [idProyecto, idUsuario, esAdminSistemas],
      );
    return Array.isArray(result) ? result : [];
  }

  async obtenerEntregablePorId(idEntregable: number): Promise<any | null> {
    const row = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_ObtenerEntregablePorIdV2',
      [idEntregable],
    );
    if (!row) return null;
    let responsables = row.responsables;
    if (typeof responsables === 'string') {
      try {
        responsables = JSON.parse(responsables);
      } catch {
        responsables = [];
      }
    }
    if (!Array.isArray(responsables)) responsables = [];

    let fotoRaw = this.pickFotoPerfilUsuarioCreacion(row);
    if (
      (fotoRaw == null || String(fotoRaw).trim() === '') &&
      row.idusuariocreacion != null &&
      Number(row.idusuariocreacion) > 0
    ) {
      fotoRaw = await this.obtenerUrlFotoPerfilPorIdUsuario(
        Number(row.idusuariocreacion),
      );
    }

    const fotoPerfilUsuarioCreacion = await this.resolverFotoPerfil(fotoRaw);
    return {
      ...row,
      fotoperfilusuariocreacion: fotoPerfilUsuarioCreacion,
      responsables,
    };
  }

  async crearEntregableProyecto(
    idProyecto: number,
    data: CrearEntregableProyectoData,
    idUsuarioCreacion: number,
  ): Promise<{ success: boolean; message: string; id?: number }> {
    let responsables: number[] | null = null;
    if (data.idTrabajadoresResponsables !== undefined) {
      responsables = Array.isArray(data.idTrabajadoresResponsables)
        ? data.idTrabajadoresResponsables.filter((id) => Number(id) > 0)
        : [];
    } else if (
      data.idTrabajadorResponsable != null &&
      data.idTrabajadorResponsable > 0
    ) {
      responsables = [data.idTrabajadorResponsable];
    }
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_CrearEntregableV2',
      [
        idProyecto,
        data.nombre,
        data.descripcion ?? null,
        data.idEstado ?? ID_ESTADO_ENTREGABLE_PROCESO,
        data.fechaEstimada ?? null,
        data.fechaEntrega ?? null,
        idUsuarioCreacion,
        responsables,
      ],
    );
    return result;
  }

  async actualizarEntregableProyecto(
    idEntregable: number,
    data: ActualizarEntregableProyectoData,
    idUsuarioModificacion: number,
  ): Promise<{ success: boolean; message: string }> {
    // null → SQL no toca responsables; [] → quita todos; [ids] → reemplaza
    let responsables: number[] | null = null;
    if (data.idTrabajadoresResponsables !== undefined) {
      responsables = Array.isArray(data.idTrabajadoresResponsables)
        ? data.idTrabajadoresResponsables.filter((id) => Number(id) > 0)
        : [];
    } else if (data.idTrabajadorResponsable !== undefined) {
      responsables =
        data.idTrabajadorResponsable != null &&
        data.idTrabajadorResponsable > 0
          ? [data.idTrabajadorResponsable]
          : [];
    }
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'pro_ActualizarEntregableV2',
      [
        idEntregable,
        data.nombre,
        data.descripcion ?? null,
        data.idEstado ?? null,
        data.fechaEstimada ?? null,
        data.fechaEntrega ?? null,
        idUsuarioModificacion,
        responsables,
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

  async obtenerIdTrabajadorPorIdUsuario(
    idUsuario: number,
  ): Promise<number | null> {
    if (idUsuario == null || idUsuario < 1) return null;
    const rows = await this.databaseFunctionService.executeQuery<{
      id: number;
    }>('SELECT id FROM tratrabajador WHERE idusuario = $1 AND estado = 1 LIMIT 1', [
      idUsuario,
    ]);
    const id = rows?.[0]?.id;
    return id != null && Number(id) > 0 ? Number(id) : null;
  }

  async trabajadorPerteneceAProyecto(
    idProyecto: number,
    idTrabajador: number,
  ): Promise<boolean> {
    if (idProyecto == null || idProyecto < 1) return false;
    if (idTrabajador == null || idTrabajador < 1) return false;
    const rows = await this.databaseFunctionService.callFunction<{
      idproyecto?: number;
    }>('pro_ListarProyectosAccesoTrabajador', [idTrabajador, false]);
    return (rows ?? []).some(
      (r) => Number(r.idproyecto) === Number(idProyecto),
    );
  }

  async esCoordinadorEnProyecto(
    idProyecto: number,
    idTrabajador: number,
  ): Promise<boolean> {
    if (idProyecto == null || idProyecto < 1) return false;
    if (idTrabajador == null || idTrabajador < 1) return false;
    const coords = await this.listarCoordinadoresProyecto(idProyecto);
    return coords.some((c) => Number(c.idtrabajador) === Number(idTrabajador));
  }

  async obtenerIdUsuarioPorIdTrabajador(
    idTrabajador: number,
  ): Promise<number | null> {
    if (idTrabajador == null || idTrabajador < 1) return null;
    const rows = await this.databaseFunctionService.executeQuery<{
      idusuario: number | null;
    }>(
      'SELECT idusuario FROM tratrabajador WHERE id = $1 AND estado = 1 LIMIT 1',
      [idTrabajador],
    );
    const idUsuario = rows?.[0]?.idusuario;
    return idUsuario != null && Number(idUsuario) > 0 ? Number(idUsuario) : null;
  }

  async obtenerNombreTrabajadorPorId(
    idTrabajador: number,
  ): Promise<string | null> {
    if (idTrabajador == null || idTrabajador < 1) return null;
    const rows = await this.databaseFunctionService.executeQuery<{
      nombre: string | null;
    }>(
      `SELECT TRIM(COALESCE(nombres, '') || ' ' || COALESCE(apellidos, '')) AS nombre
       FROM tratrabajador WHERE id = $1 LIMIT 1`,
      [idTrabajador],
    );
    const nombre = rows?.[0]?.nombre?.trim();
    return nombre ? nombre : null;
  }
}
