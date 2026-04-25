import { Injectable, Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type {
  IControlOperativoRepository,
  ListarJornadasTrabajadorParams,
  ListarJornadasTrabajadorResult,
  CrearJornadaParams,
  JornadaListItem,
  JornadaCreada,
  ListarActividadesParams,
  ListarActividadesResult,
  ActividadListItem,
  ActividadValidacionListItem,
  ActividadDetalle,
  ObservacionActividad,
  CrearActividadParams,
  ActualizarActividadParams,
  ValidarActividadParams,
  ActividadCreada,
  CronCierreJornadasResult,
  CronAlertaActividadesSinValidarResult,
  GrupoCoordinadorSinValidar,
  TrabajadorParaFiltro,
  ProyectoAccesoTrabajador,
  ListarActividadesValidacionParams,
  ListarActividadesValidacionResult,
  ListarValorizacionParams,
  ListarValorizacionResult,
  ValorizacionGrupo,
  ListarDesempenoParams,
  ListarDesempenoResult,
  TrabajadorPorProyectoItem,
  TrabajadorSinJornadaHoyItem,
  TrabajadorSinActividadesHoyItem,
  ReporteGeneralParams,
  ReporteGeneralResult,
  ReporteGeneralItem,
  LiderEquipoReporteGeneralItem,
} from '../../domain/repositories/control-operativo.repository.interface';

/** PostgreSQL devuelve el entero en una columna con el nombre de la función. */
function getScalarInt(row: any): number {
  if (row == null) return 0;
  if (typeof row === 'number') return row;
  const keys = Object.keys(row);
  if (keys.length > 0 && typeof row[keys[0]] === 'number') return row[keys[0]];
  return 0;
}

/** Query param vacío (ej. fechaFin=) → null; evita invalid input syntax for type date: "". */
function queryDateOrNull(v: string | null | undefined): string | null {
  if (v == null) return null;
  const t = String(v).trim();
  return t === '' ? null : t;
}
import { DatabaseFunctionService } from '../database/database-function.service';

@Injectable()
export class ControlOperativoRepository implements IControlOperativoRepository {
  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async listarJornadasTrabajador(
    params: ListarJornadasTrabajadorParams,
  ): Promise<ListarJornadasTrabajadorResult> {
    const {
      idTrabajador,
      fechaInicio,
      fechaFin,
      limit = 10,
      offset = 0,
    } = params;

    const pFechaInicio =
      queryDateOrNull(fechaInicio) ?? this.getInicioSemanaActual();
    const pFechaFin = queryDateOrNull(fechaFin) ?? this.getFinSemanaActual();

    type Row = JornadaListItem & { total_count?: number };
    const result = await this.databaseFunctionService.callFunction<Row>(
      'con_ListarJornadasTrabajador',
      [idTrabajador, pFechaInicio, pFechaFin, limit, offset],
    );

    if (!result || result.length === 0) {
      return { data: [], totalCount: 0 };
    }

    const totalCount = Number(result[0]?.total_count ?? result.length);
    const data: JornadaListItem[] = result.map((row) => {
      const { total_count: _tc, fecha: f, ...rest } = row;
      const idEstado =
        rest.idestadojornada != null ? Number(rest.idestadojornada) : NaN;
      return {
        ...rest,
        fecha: this.formatFechaYYYYMMDD(f),
        /** Mismo valor que idestadojornada; camelCase explícito para el cliente. */
        idEstadoJornada: Number.isFinite(idEstado) ? idEstado : null,
      } as JornadaListItem;
    });

    return { data, totalCount };
  }

  async listarTrabajadoresParaFiltro(
    idTrabajador: number,
  ): Promise<TrabajadorParaFiltro[]> {
    const result =
      await this.databaseFunctionService.callFunction<TrabajadorParaFiltro>(
        'tra_ListarTrabajadoresParaFiltro',
        [idTrabajador],
      );
    return result ?? [];
  }

  async listarProyectosAccesoTrabajador(
    idTrabajador: number,
  ): Promise<ProyectoAccesoTrabajador[]> {
    const result =
      await this.databaseFunctionService.callFunction<ProyectoAccesoTrabajador>(
        'pro_ListarProyectosAccesoTrabajador',
        [idTrabajador],
      );
    if (Array.isArray(result)) return result;
    if (result != null && typeof result === 'object')
      return [result as ProyectoAccesoTrabajador];
    return [];
  }

  async listarProyectosParaValidacion(
    idTrabajador: number,
  ): Promise<ProyectoAccesoTrabajador[]> {
    const result =
      await this.databaseFunctionService.callFunction<ProyectoAccesoTrabajador>(
        'pro_ListarProyectosParaValidacion',
        [idTrabajador],
      );
    if (Array.isArray(result)) return result;
    if (result != null && typeof result === 'object')
      return [result as ProyectoAccesoTrabajador];
    return [];
  }

  async puedeValidarActividad(
    idActividad: number,
    idRevisor: number,
    esAdminTotalValidacion: boolean,
  ): Promise<boolean> {
    const rows = await this.databaseFunctionService.callFunction<{
      resultado?: boolean;
    }>('con_PuedeValidarActividad', [
      idActividad,
      idRevisor,
      esAdminTotalValidacion,
    ]);
    return rows?.[0]?.resultado === true;
  }

  async listarTrabajadoresSinJornadaHoy(
    fecha: string,
  ): Promise<TrabajadorSinJornadaHoyItem[]> {
    const result =
      await this.databaseFunctionService.callFunction<TrabajadorSinJornadaHoyItem>(
        'con_ListarTrabajadoresSinJornadaHoy',
        [fecha],
      );
    return Array.isArray(result) ? result : [];
  }

  async listarTrabajadoresSinActividadesHoy(
    fecha: string,
  ): Promise<TrabajadorSinActividadesHoyItem[]> {
    const result =
      await this.databaseFunctionService.callFunction<TrabajadorSinActividadesHoyItem>(
        'con_ListarTrabajadoresSinActividadesHoy',
        [fecha],
      );
    return Array.isArray(result) ? result : [];
  }

  async contarTrabajadoresEsperadosJornadaHoy(fecha: string): Promise<number> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('con_ContarTrabajadoresEsperadosJornadaHoy', [fecha]);
    return getScalarInt(row);
  }

  async contarTrabajadoresConJornadaHoy(fecha: string): Promise<number> {
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('con_ContarTrabajadoresConJornadaHoy', [fecha]);
    return getScalarInt(row);
  }

  /** Normaliza fecha a YYYY-MM-DD (la BD/driver puede devolver Date o string en distintos formatos). */
  private formatFechaYYYYMMDD(value: unknown): string {
    if (value == null || value === '') return '';
    if (value instanceof Date) {
      const iso = value.toISOString();
      return iso.slice(0, 10);
    }
    const s = String(value).trim();
    if (!s) return '';
    if (s.includes('T')) return s.split('T')[0].slice(0, 10);
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  }

  async crearJornada(
    params: CrearJornadaParams,
  ): Promise<JornadaCreada | null> {
    const {
      idTrabajador,
      fechaJornada,
      idConfiguracionJornada,
      idEstadoJornada,
      horasEsperadas,
    } = params;
    const row =
      await this.databaseFunctionService.callFunctionSingle<JornadaCreada>(
        'con_CrearJornada',
        [
          idTrabajador,
          fechaJornada,
          idConfiguracionJornada ?? null,
          idEstadoJornada ?? null,
          horasEsperadas ?? null,
        ],
      );
    return row ?? null;
  }

  async listarActividades(
    params: ListarActividadesParams,
  ): Promise<ListarActividadesResult> {
    const {
      idJornada,
      idTrabajador,
      idProyecto,
      idEstadoActividad,
      limit = 10,
      offset = 0,
    } = params;
    type Row = ActividadListItem & {
      total_count?: number;
      total_horas?: number;
      horasesperadas?: number | null;
      diajornada?: string | null;
      idestadojornada?: number | null;
      estadojornada?: string | null;
    };
    const result = await this.databaseFunctionService.callFunction<Row>(
      'con_ListarActividades',
      [
        idJornada ?? null,
        idTrabajador ?? null,
        idProyecto ?? null,
        idEstadoActividad ?? null,
        limit,
        offset,
      ],
    );
    if (!result?.length) {
      let diajornada: string | null = null;
      let horasesperadas: number | null = null;
      let idestadojornada: number | null = null;
      let estadojornada: string | null = null;
      if (idJornada != null && idJornada >= 1) {
        const meta = await this.dataSource.query<
          {
            diajornada: string;
            horasesperadas: number;
            idestadojornada: number;
            estadojornada: string;
          }[]
        >(
          `SELECT fechajornada::text AS diajornada, horasesperadas, idestadojornada,
                            (SELECT glo.nombre FROM genlistadoopciones glo WHERE glo.id = j.idestadojornada AND glo.estado = 1 LIMIT 1) AS estadojornada
                     FROM conjornada j WHERE j.id = $1 AND j.estado = 1 LIMIT 1`,
          [idJornada],
        );
        if (meta?.[0]) {
          diajornada =
            meta[0].diajornada != null
              ? String(meta[0].diajornada).split('T')[0]
              : null;
          horasesperadas =
            meta[0].horasesperadas != null
              ? Number(meta[0].horasesperadas)
              : null;
          idestadojornada =
            meta[0].idestadojornada != null
              ? Number(meta[0].idestadojornada)
              : null;
          estadojornada = meta[0].estadojornada ?? null;
        }
      }
      return {
        data: [],
        totalCount: 0,
        totalHoras: 0,
        horasesperadas,
        diajornada,
        idestadojornada,
        estadojornada,
      };
    }
    const totalCount = Number(result[0].total_count ?? result.length);
    const totalHoras = Number(result[0].total_horas ?? 0);
    const horasesperadas =
      result[0].horasesperadas != null
        ? Number(result[0].horasesperadas)
        : null;
    const diajornada =
      result[0].diajornada != null
        ? String(result[0].diajornada).split('T')[0]
        : null;
    const idestadojornada =
      result[0].idestadojornada != null
        ? Number(result[0].idestadojornada)
        : null;
    const estadojornada = result[0].estadojornada ?? null;
    const data: ActividadListItem[] = result.map((row) => {
      const {
        total_count: _tc,
        total_horas: _th,
        horasesperadas: _hm,
        diajornada: _dj,
        idestadojornada: _ej,
        estadojornada: _ejs,
        ...rest
      } = row;
      return rest as ActividadListItem;
    });
    return {
      data,
      totalCount,
      totalHoras,
      horasesperadas,
      diajornada,
      idestadojornada,
      estadojornada,
    };
  }

  async obtenerIdTrabajadorPorIdUsuario(
    idUsuario: number,
  ): Promise<number | null> {
    if (idUsuario == null || idUsuario < 1) return null;
    const rows = await this.dataSource.query<{ id: number }[]>(
      'SELECT id FROM tratrabajador WHERE idusuario = $1 AND estado = 1 LIMIT 1',
      [idUsuario],
    );
    const id = rows?.[0]?.id;
    return id != null ? Number(id) : null;
  }

  async obtenerIdUsuarioPorIdTrabajador(
    idTrabajador: number,
  ): Promise<number | null> {
    if (idTrabajador == null || idTrabajador < 1) return null;
    const rows = await this.dataSource.query<{ idusuario: number }[]>(
      'SELECT idusuario FROM tratrabajador WHERE id = $1 AND estado = 1 LIMIT 1',
      [idTrabajador],
    );
    const idUsuario = rows?.[0]?.idusuario;
    return idUsuario != null ? Number(idUsuario) : null;
  }

  async obtenerIdResponsablePorIdTrabajador(
    idTrabajador: number,
  ): Promise<number | null> {
    if (idTrabajador == null || idTrabajador < 1) return null;
    const rows = await this.dataSource.query<
      { idresponsable: number | null }[]
    >(
      'SELECT idresponsable FROM tratrabajador WHERE id = $1 AND estado = 1 LIMIT 1',
      [idTrabajador],
    );
    const idResponsable = rows?.[0]?.idresponsable;
    return idResponsable != null && idResponsable > 0
      ? Number(idResponsable)
      : null;
  }

  async obtenerNombreTrabajadorPorId(
    idTrabajador: number,
  ): Promise<string | null> {
    if (idTrabajador == null || idTrabajador < 1) return null;
    const rows = await this.dataSource.query<{ nombre: string }[]>(
      `SELECT TRIM(nombres || ' ' || COALESCE(apellidos, '')) AS nombre FROM tratrabajador WHERE id = $1 AND estado = 1 LIMIT 1`,
      [idTrabajador],
    );
    const nombre = rows?.[0]?.nombre;
    return nombre != null && String(nombre).trim() !== ''
      ? String(nombre).trim()
      : null;
  }

  async listarActividadesValidacion(
    params: ListarActividadesValidacionParams,
  ): Promise<ListarActividadesValidacionResult> {
    const {
      idTrabajadorSesion,
      esAdmin,
      idTrabajadorFiltro,
      idProyectoFiltro,
      idEstadoActividadFiltro,
      limit = 50,
      offset = 0,
    } = params;
    type Row = ActividadValidacionListItem & {
      total_count?: number;
      total_horas?: number;
      total_por_aprobar?: number;
    };

    // Ejecutar en paralelo: listado paginado + conteo de vencidas (todas las páginas)
    const [result, vencidasRows] = await Promise.all([
      this.databaseFunctionService.callFunction<Row>(
        'con_ListarActividadesValidacion',
        [
          idTrabajadorSesion,
          esAdmin,
          idTrabajadorFiltro ?? null,
          idProyectoFiltro ?? null,
          idEstadoActividadFiltro ?? null,
          limit,
          offset,
        ],
      ),
      this.databaseFunctionService.callFunction<{
        con_contarvencidasvalidacion?: number;
      }>('con_ContarVencidasValidacion', [
        idTrabajadorSesion,
        esAdmin,
        idTrabajadorFiltro ?? null,
        idProyectoFiltro ?? null,
      ]),
    ]);

    const countVencidas = getScalarInt(vencidasRows?.[0]);

    if (!result?.length) {
      return {
        data: [],
        totalCount: 0,
        totalHoras: 0,
        countPorAprobar: 0,
        countVencidas,
      };
    }
    const totalCount = Number(result[0].total_count ?? result.length);
    const totalHoras = Number(result[0].total_horas ?? 0);
    const countPorAprobar = Number(result[0].total_por_aprobar ?? 0);
    const data: ActividadValidacionListItem[] = result.map((row) => {
      const {
        total_count: _tc,
        total_horas: _th,
        total_por_aprobar: _tpa,
        ...rest
      } = row;
      return rest as ActividadValidacionListItem;
    });
    return { data, totalCount, totalHoras, countPorAprobar, countVencidas };
  }

  async listarValorizacion(
    params: ListarValorizacionParams,
  ): Promise<ListarValorizacionResult> {
    const { idProyecto, fechaInicio, fechaFin } = params;
    const result =
      await this.databaseFunctionService.callFunction<ValorizacionGrupo>(
        'con_ListarValorizacion',
        [idProyecto, queryDateOrNull(fechaInicio), queryDateOrNull(fechaFin)],
      );
    const grupos: ValorizacionGrupo[] = Array.isArray(result) ? result : [];
    const totalGeneralHoras = grupos.reduce(
      (sum, g) => sum + Number(g.total_horas ?? 0),
      0,
    );
    return { grupos, totalGeneralHoras };
  }

  async listarTrabajadoresPorProyecto(
    idProyecto: number,
  ): Promise<TrabajadorPorProyectoItem[]> {
    if (idProyecto == null || idProyecto < 1) return [];
    const result =
      await this.databaseFunctionService.callFunction<TrabajadorPorProyectoItem>(
        'con_ListarTrabajadoresPorProyecto',
        [idProyecto],
      );
    return Array.isArray(result) ? result : [];
  }

  async listarDesempeno(
    params: ListarDesempenoParams,
  ): Promise<ListarDesempenoResult> {
    const { idProyecto, fechaInicio, fechaFin, idTrabajador } = params;
    const rows = await this.databaseFunctionService.callFunction<{
      total_actividades_rechazadas?: number;
      total_observaciones?: number;
      total_horas_no_justificadas?: number;
      detalle_actividades_rechazadas?: unknown;
      detalle_observaciones?: unknown;
    }>('con_ListarDesempeno', [
      idProyecto,
      queryDateOrNull(fechaInicio),
      queryDateOrNull(fechaFin),
      idTrabajador ?? null,
    ]);
    const row = rows?.[0];
    if (!row) {
      return {
        totalActividadesRechazadas: 0,
        totalObservaciones: 0,
        totalHorasNoJustificadas: 0,
        detalleActividadesRechazadas: [],
        detalleObservaciones: [],
      };
    }
    const detalleRechazadas = Array.isArray(row.detalle_actividades_rechazadas)
      ? row.detalle_actividades_rechazadas
      : [];
    const detalleObs = Array.isArray(row.detalle_observaciones)
      ? row.detalle_observaciones
      : [];
    return {
      totalActividadesRechazadas: Number(row.total_actividades_rechazadas ?? 0),
      totalObservaciones: Number(row.total_observaciones ?? 0),
      totalHorasNoJustificadas: Number(row.total_horas_no_justificadas ?? 0),
      detalleActividadesRechazadas:
        detalleRechazadas as ListarDesempenoResult['detalleActividadesRechazadas'],
      detalleObservaciones:
        detalleObs as ListarDesempenoResult['detalleObservaciones'],
    };
  }

  async obtenerActividad(
    idActividad: number,
  ): Promise<ActividadDetalle | null> {
    if (idActividad == null || idActividad < 1) return null;
    const result = await this.databaseFunctionService.callFunction<
      Record<string, unknown>
    >('con_ObtenerActividad', [idActividad]);
    const row = result?.[0];
    if (!row) return null;
    // El driver puede devolver la columna como diajornada, diaJornada o fechajornada (minúsculas)
    const rawDia =
      row.diajornada ??
      row.diaJornada ??
      row.fechajornada ??
      row.fechaJornada ??
      (() => {
        const key = Object.keys(row).find(
          (k) =>
            k.toLowerCase() === 'diajornada' ||
            k.toLowerCase() === 'fechajornada',
        );
        return key ? row[key] : undefined;
      })();
    const diajornada =
      rawDia != null && rawDia !== ''
        ? (typeof rawDia === 'string' ? rawDia : String(rawDia))
            .split('T')[0]
            .trim()
        : null;
    return { ...row, diajornada } as ActividadDetalle;
  }

  async listarObservacionesActividad(
    idActividad: number,
  ): Promise<ObservacionActividad[]> {
    if (idActividad == null || idActividad < 1) return [];
    const rows =
      await this.databaseFunctionService.callFunction<ObservacionActividad>(
        'con_ListarObservacionesActividad',
        [idActividad],
      );
    return Array.isArray(rows) ? rows : [];
  }

  async crearActividad(
    params: CrearActividadParams,
  ): Promise<ActividadCreada | null> {
    const rows =
      await this.databaseFunctionService.callFunction<ActividadCreada>(
        'con_CrearActividad',
        [
          params.idJornada,
          params.idProyecto,
          params.idTrabajador,
          params.idCoordinador,
          params.idTipoActividad,
          params.nombreActividad ?? '',
          params.descripcionDetallada ?? null,
          params.horaInicio ?? null,
          params.horaFin ?? null,
          params.linkEvidencia ?? null,
          params.idEstadoActividad ?? null,
          params.idModalidad ?? null,
          params.idUsuarioCreacion ?? null,
        ],
      );
    return rows?.[0] ?? null;
  }

  async actualizarActividad(
    params: ActualizarActividadParams,
  ): Promise<ActividadCreada | null> {
    const rows =
      await this.databaseFunctionService.callFunction<ActividadCreada>(
        'con_ActualizarActividad',
        [
          params.idActividad,
          params.idProyecto,
          params.idTrabajador,
          params.idCoordinador,
          params.idTipoActividad,
          params.nombreActividad ?? '',
          params.descripcionDetallada ?? null,
          params.horaInicio ?? null,
          params.horaFin ?? null,
          params.linkEvidencia ?? null,
          params.idModalidad ?? null,
          params.idUsuarioModificacion ?? null,
          params.corregirObservacion === true,
        ],
      );
    return rows?.[0] ?? null;
  }

  async validarActividad(
    params: ValidarActividadParams,
  ): Promise<ActividadCreada | null> {
    const rows =
      await this.databaseFunctionService.callFunction<ActividadCreada>(
        'con_ValidarActividad',
        [
          params.idActividad,
          params.idEstadoActividad,
          params.comentarioValidacion ?? null,
          params.idCoordinadorRevisor,
          params.idUsuarioModificacion ?? null,
          params.esAdminTotalValidacion === true,
        ],
      );
    return rows?.[0] ?? null;
  }

  async eliminarActividad(idActividad: number): Promise<boolean> {
    if (idActividad == null || idActividad < 1) return false;
    const result = await this.databaseFunctionService.callFunction<{
      con_eliminaractividad?: boolean;
      coneliminaractividad?: boolean;
    }>('con_EliminarActividad', [idActividad]);
    const row = result?.[0];
    return (
      row?.con_eliminaractividad === true || row?.coneliminaractividad === true
    );
  }

  private getInicioSemanaActual(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - (day === 0 ? 6 : day - 1);
    const lunes = new Date(now.getFullYear(), now.getMonth(), diff);
    return lunes.toISOString().split('T')[0];
  }

  private getFinSemanaActual(): string {
    const inicio = this.getInicioSemanaActual();
    const lunes = new Date(inicio);
    const domingo = new Date(lunes);
    domingo.setDate(domingo.getDate() + 6);
    return domingo.toISOString().split('T')[0];
  }

  async ejecutarCronCierreJornadas(
    fecha: string,
  ): Promise<CronCierreJornadasResult> {
    const rows = await this.databaseFunctionService.callFunction<any>(
      'con_CronCierreJornadas',
      [fecha],
    );
    const row = rows?.[0];
    return {
      insertados_alerta: Number(row?.insertados_alerta ?? 0),
      actualizados_alerta: Number(row?.actualizados_alerta ?? 0),
      pasados_culminado: Number(row?.pasados_culminado ?? 0),
      pasados_incompleto: Number(row?.pasados_incompleto ?? 0),
    };
  }

  async actualizarEstadoJornada(
    idJornada: number,
    idEstadoJornada: number,
    idUsuarioModificacion?: number,
  ): Promise<boolean> {
    const row = await this.databaseFunctionService.callFunctionSingle<any>(
      'con_ActualizarEstadoJornada',
      [idJornada, idEstadoJornada, idUsuarioModificacion ?? null],
    );
    return (
      row === true ||
      row?.con_actualizarestadojornada === true ||
      row?.conactualizarestadojornada === true
    );
  }

  async listarReporteGeneral(
    params: ReporteGeneralParams,
  ): Promise<ReporteGeneralResult> {
    const {
      idTrabajadores,
      idProyectos,
      idEstadosActividad,
      fechaInicio,
      fechaFin,
      idLiderEquipo,
      limit = 50,
      offset = 0,
    } = params;
    const pTrab =
      idTrabajadores != null && idTrabajadores.length > 0
        ? idTrabajadores
        : null;
    const pProy =
      idProyectos != null && idProyectos.length > 0 ? idProyectos : null;
    const pEst =
      idEstadosActividad != null && idEstadosActividad.length > 0
        ? idEstadosActividad
        : null;
    const pLider =
      idLiderEquipo != null &&
      Number.isFinite(idLiderEquipo) &&
      idLiderEquipo >= 1
        ? idLiderEquipo
        : null;
    type Row = ReporteGeneralItem & {
      total_count?: number | null;
      total_horas?: number | null;
    };
    const rows = await this.databaseFunctionService.callFunction<Row>(
      'con_ReporteGeneral',
      [
        pTrab,
        pProy,
        pEst,
        queryDateOrNull(fechaInicio),
        queryDateOrNull(fechaFin),
        pLider,
        limit,
        offset,
      ],
    );
    if (!rows?.length) {
      return { data: [], totalCount: 0, totalHoras: 0 };
    }
    const totalCount = Number(rows[0].total_count ?? rows.length);
    const totalHoras = Number(rows[0].total_horas ?? 0);
    const data: ReporteGeneralItem[] = rows.map((row) => {
      const { total_count: _tc, total_horas: _th, ...rest } = row;
      const rawDia =
        rest.diajornada ??
        (rest as { diaJornada?: unknown }).diaJornada ??
        (() => {
          const key = Object.keys(rest).find(
            (k) => k.toLowerCase() === 'diajornada',
          );
          return key ? (rest as Record<string, unknown>)[key] : undefined;
        })();
      const diajornadaNorm = this.formatFechaYYYYMMDD(rawDia);
      const diajornada = diajornadaNorm !== '' ? diajornadaNorm : null;
      return { ...rest, diajornada } as ReporteGeneralItem;
    });
    return { data, totalCount, totalHoras };
  }

  async listarLideresEquipoReporteGeneral(): Promise<
    LiderEquipoReporteGeneralItem[]
  > {
    const rows =
      await this.databaseFunctionService.callFunction<LiderEquipoReporteGeneralItem>(
        'tra_ListarLideresEquipoReporteGeneral',
        [],
      );
    return rows ?? [];
  }

  async ejecutarCronAlertaActividadesSinValidar(
    fecha: string,
  ): Promise<CronAlertaActividadesSinValidarResult> {
    const rows = await this.databaseFunctionService.callFunction<{
      grupos_coordinadores: GrupoCoordinadorSinValidar[] | string | null;
      usuarios_a_notificar: number[] | null;
      total_actividades: number | null;
    }>('con_CronAlertaActividadesSinValidar', [fecha]);

    const row = rows?.[0];
    if (!row) {
      return {
        gruposCoordinadores: [],
        usuariosANotificar: [],
        totalActividades: 0,
      };
    }

    const gruposRaw = row.grupos_coordinadores;
    let gruposCoordinadores: GrupoCoordinadorSinValidar[] = [];
    if (typeof gruposRaw === 'string') {
      try {
        gruposCoordinadores = JSON.parse(
          gruposRaw,
        ) as GrupoCoordinadorSinValidar[];
      } catch {
        gruposCoordinadores = [];
      }
    } else if (Array.isArray(gruposRaw)) {
      gruposCoordinadores = gruposRaw;
    }

    const usuariosANotificar = Array.isArray(row.usuarios_a_notificar)
      ? row.usuarios_a_notificar
          .map(Number)
          .filter((n) => Number.isFinite(n) && n > 0)
      : [];

    return {
      gruposCoordinadores,
      usuariosANotificar,
      totalActividades: Number(row.total_actividades ?? 0),
    };
  }
}
