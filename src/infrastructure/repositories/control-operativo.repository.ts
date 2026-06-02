import { Injectable, Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DatabaseFunctionService } from '../database/database-function.service';
import { MinioStorageService } from '../storage/minio-storage.service';
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
  ListarActividadesObservadasSubsanarParams,
  ListarActividadesObservadasSubsanarResult,
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
  ReporteHorasTrabajadorRangoParams,
  ReporteHorasTrabajadorRangoResult,
  ReporteHorasTrabajadorRangoItem,
  ReporteHorasTrabajadorRangoDetalleProyectoParams,
  ReporteHorasRangoTrabajadorProyectoDetalleResult,
  ReporteHorasRangoTrabajadorProyectoDetalleItem,
  ActividadEvidenciaItem,
  AgregarEvidenciasActividadParams,
  EliminarEvidenciaActividadParams,
  DatosReporteActividadesRow,
  ActividadInformeServicioLinea,
} from '../../domain/repositories/control-operativo.repository.interface';
import { normalizeStoredValueToYmd } from '../../shared/utils/date.util';

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

function parseActividadEvidencias(raw: unknown): ActividadEvidenciaItem[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    const out: ActividadEvidenciaItem[] = [];
    for (const x of raw) {
      if (x == null || typeof x !== 'object') continue;
      const o = x as Record<string, unknown>;
      const url = o.url != null ? String(o.url).trim() : '';
      if (!url) continue;
      const idArchivo = Number(o.idArchivo ?? o['idarchivo'] ?? 0);
      const tamRaw = o.tamanoBytes ?? o.tamanobytes;
      const tam = tamRaw != null ? Number(tamRaw) : null;
      out.push({
        id: Number(o.id ?? 0),
        idArchivo: Number.isFinite(idArchivo) ? idArchivo : 0,
        url,
        orden: Number(o.orden ?? 0),
        nombreOriginal:
          o.nombreOriginal != null && o.nombreOriginal !== ''
            ? String(o.nombreOriginal)
            : o['nombreoriginal'] != null
              ? String(o['nombreoriginal'])
              : null,
        tipoMime:
          o.tipoMime != null
            ? String(o.tipoMime)
            : o['tipomime'] != null
              ? String(o['tipomime'])
              : null,
        tamanoBytes:
          tam != null && Number.isFinite(tam) ? tam : null,
      });
    }
    return out;
  }
  if (typeof raw === 'string') {
    try {
      return parseActividadEvidencias(JSON.parse(raw) as unknown);
    } catch {
      return [];
    }
  }
  return [];
}

@Injectable()
export class ControlOperativoRepository implements IControlOperativoRepository {
  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly minioStorage: MinioStorageService,
  ) {}

  private async mapEvidenciasViewUrls(
    items: ActividadEvidenciaItem[],
  ): Promise<ActividadEvidenciaItem[]> {
    if (!items?.length) return items;
    return Promise.all(
      items.map(async (e) => {
        const viewUrl =
          await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(e.url);
        return { ...e, viewUrl };
      }),
    );
  }

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
    soloVigentes = false,
  ): Promise<ProyectoAccesoTrabajador[]> {
    const result =
      await this.databaseFunctionService.callFunction<ProyectoAccesoTrabajador>(
        'pro_ListarProyectosAccesoTrabajador',
        [idTrabajador, soloVigentes],
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
    const data: ActividadListItem[] = await Promise.all(
      result.map(async (row) => {
        const {
          total_count: _tc,
          total_horas: _th,
          horasesperadas: _hm,
          diajornada: _dj,
          idestadojornada: _ej,
          estadojornada: _ejs,
          evidencias: evRaw,
          ...rest
        } = row;
        const evidencias = await this.mapEvidenciasViewUrls(
          parseActividadEvidencias(evRaw),
        );
        return {
          ...rest,
          evidencias,
        } as ActividadListItem;
      }),
    );
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
    const data: ActividadValidacionListItem[] = await Promise.all(
      result.map(async (row) => {
        const {
          total_count: _tc,
          total_horas: _th,
          total_por_aprobar: _tpa,
          evidencias: evRaw,
          ...rest
        } = row;
        const evidencias = await this.mapEvidenciasViewUrls(
          parseActividadEvidencias(evRaw),
        );
        return {
          ...rest,
          evidencias,
        } as ActividadValidacionListItem;
      }),
    );
    return { data, totalCount, totalHoras, countPorAprobar, countVencidas };
  }

  async listarActividadesObservadasSubsanar(
    params: ListarActividadesObservadasSubsanarParams,
  ): Promise<ListarActividadesObservadasSubsanarResult> {
    const {
      idTrabajadorSesion,
      idProyectoFiltro,
      limit = 200,
      offset = 0,
    } = params;
    type Row = ActividadValidacionListItem & {
      total_count?: number;
      total_horas?: number;
    };
    const result = await this.databaseFunctionService.callFunction<Row>(
      'con_ListarActividadesObservadasSubsanar',
      [
        idTrabajadorSesion,
        idProyectoFiltro ?? null,
        limit,
        offset,
      ],
    );
    if (!result?.length) {
      return { data: [], totalCount: 0, totalHoras: 0 };
    }
    const totalCount = Number(result[0].total_count ?? result.length);
    const totalHoras = Number(result[0].total_horas ?? 0);
    const data: ActividadValidacionListItem[] = await Promise.all(
      result.map(async (row) => {
        const {
          total_count: _tc,
          total_horas: _th,
          evidencias: evRaw,
          ...rest
        } = row;
        const evidencias = await this.mapEvidenciasViewUrls(
          parseActividadEvidencias(evRaw),
        );
        return { ...rest, evidencias } as ActividadValidacionListItem;
      }),
    );
    return { data, totalCount, totalHoras };
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
    >('con_ObtenerActividadV2', [idActividad]);
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
    const r = row as Record<string, unknown>;
    const evidencias = await this.mapEvidenciasViewUrls(
      parseActividadEvidencias(r.evidencias),
    );
    return {
      ...row,
      diajornada,
      evidencias,
    } as ActividadDetalle;
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
        'con_CrearActividadV2',
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
          params.idEntregable ?? null,
          params.incidenciaDetallada ?? null,
          params.entregableCulminado ?? false,
        ],
      );
    return rows?.[0] ?? null;
  }

  async agregarEvidenciasActividad(
    params: AgregarEvidenciasActividadParams,
  ): Promise<number> {
    if (params.idActividad == null || params.idActividad < 1) return 0;
    if (!params.evidencias?.length) return 0;
    const payload = params.evidencias.map((e) => ({
      url: e.url,
      nombreOriginal: e.nombreOriginal ?? null,
      tipoMime: e.tipoMime ?? null,
      tamanoBytes:
        e.tamanoBytes != null && Number.isFinite(e.tamanoBytes)
          ? Math.trunc(e.tamanoBytes)
          : null,
    }));
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('con_AgregarEvidenciasActividad', [
      params.idActividad,
      JSON.stringify(payload),
      params.idUsuario,
    ]);
    return getScalarInt(row);
  }

  async eliminarEvidenciaActividad(
    params: EliminarEvidenciaActividadParams,
  ): Promise<string | null> {
    if (params.idActividad == null || params.idActividad < 1) return null;
    if (params.idEvidencia == null || params.idEvidencia < 1) return null;
    const row = await this.databaseFunctionService.callFunctionSingle<
      Record<string, unknown>
    >('con_EliminarEvidenciaActividad', [
      params.idActividad,
      params.idEvidencia,
      params.idUsuario,
    ]);
    if (row == null) return null;
    const v = Object.values(row)[0];
    return v != null && String(v).trim() !== '' ? String(v).trim() : null;
  }

  async actualizarActividad(
    params: ActualizarActividadParams,
  ): Promise<ActividadCreada | null> {
    const rows =
      await this.databaseFunctionService.callFunction<ActividadCreada>(
        'con_ActualizarActividadV2',
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
          params.idEntregable ?? null,
          params.incidenciaDetallada ?? null,
          params.entregableCulminado ?? false,
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
      insertados_abierta: Number(
        row?.insertados_abierta ?? row?.insertados_alerta ?? 0,
      ),
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
    const actividadesIds = rows
      .map((r) => Number(r.id))
      .filter((n) => Number.isFinite(n) && n >= 1);
    const evidenciasPorActividad = new Map<number, string[]>();
    if (actividadesIds.length) {
      const evRows = await this.dataSource.query<
        { idactividad: number; url: string }[]
      >(
        `SELECT cae.idactividad, ga.url
         FROM conactividadevidencia cae
         INNER JOIN genarchivo ga ON ga.id = cae.idarchivo AND ga.estado = 1
         WHERE cae.estado = 1
           AND cae.idactividad = ANY($1::int[])
         ORDER BY cae.idactividad ASC, cae.orden ASC, cae.id ASC`,
        [actividadesIds],
      );
      for (const ev of evRows ?? []) {
        const idAct = Number(ev.idactividad);
        const urlRaw = ev.url != null ? String(ev.url).trim() : '';
        if (!Number.isFinite(idAct) || idAct < 1 || !urlRaw) continue;
        const viewUrl =
          await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(urlRaw);
        const arr = evidenciasPorActividad.get(idAct) ?? [];
        arr.push(viewUrl);
        evidenciasPorActividad.set(idAct, arr);
      }
    }

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
      const evidenciasImagenes = evidenciasPorActividad.get(Number(rest.id)) ?? [];
      return {
        ...rest,
        diajornada,
        evidenciasImagenes,
        evidenciasImagenesTexto: evidenciasImagenes.length
          ? evidenciasImagenes.join('\n')
          : null,
      } as ReporteGeneralItem;
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

  async listarReporteHorasDedicadasRangoPorTrabajador(
    params: ReporteHorasTrabajadorRangoParams,
  ): Promise<ReporteHorasTrabajadorRangoResult> {
    const {
      fechaInicio,
      fechaFin,
      idTrabajadores,
      idProyectos,
      idEstadosActividad,
      horasMetaDia = 8,
    } = params;
    const dIni = queryDateOrNull(fechaInicio);
    const dFin = queryDateOrNull(fechaFin);
    if (dIni == null || dFin == null) {
      return { data: [], totalHoras: 0 };
    }
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
    const meta =
      horasMetaDia != null &&
      Number.isFinite(horasMetaDia) &&
      Number(horasMetaDia) > 0
        ? Number(horasMetaDia)
        : 8;

    type Row = Record<string, unknown>;
    const rows = await this.databaseFunctionService.callFunction<Row>(
      'con_ReporteHorasDedicadasRangoPorTrabajador',
      [dIni, dFin, pTrab, pProy, pEst, meta],
    );

    if (!rows?.length) {
      return { data: [], totalHoras: 0 };
    }

    const toYmd = (v: unknown): string | null => {
      if (v == null) return null;
      const s = String(v).trim();
      if (!s) return null;
      return s.includes('T') ? (s.split('T')[0] ?? s) : s;
    };

    const data: ReporteHorasTrabajadorRangoItem[] = rows.map((row) => {
      const r = row as Record<string, unknown>;
      const num = (k: string) => Number(r[k] ?? 0);
      const str = (k: string): string | null =>
        r[k] != null && String(r[k]).trim() !== ''
          ? String(r[k]).trim()
          : null;
      return {
        idtrabajador: num('idtrabajador'),
        nombretrabajador: str('nombretrabajador'),
        fechaInicioPeriodo: toYmd(
          r['fecha_inicio_periodo'] ?? r['fechaInicioPeriodo'],
        ),
        fechaFinPeriodo: toYmd(r['fecha_fin_periodo'] ?? r['fechaFinPeriodo']),
        horasdedicadas: Number(r['horasdedicadas'] ?? 0),
        cantidadActividades: Number(
          r['cantidad_actividades'] ?? r['cantidadActividades'] ?? 0,
        ),
        diasCalendarioRango: Number(
          r['dias_calendario_rango'] ?? r['diasCalendarioRango'] ?? 0,
        ),
        diasEquivalente: Number(r['dias_equivalente'] ?? r['diasEquivalente'] ?? 0),
        textoResumen:
          r['texto_resumen'] != null
            ? String(r['texto_resumen'])
            : r['textoResumen'] != null
              ? String(r['textoResumen'])
              : null,
      };
    });

    const totalHoras = data.reduce(
      (acc, row) => acc + Number(row.horasdedicadas ?? 0),
      0,
    );
    return { data, totalHoras };
  }

  async listarReporteHorasDedicadasRangoPorTrabajadorYProyecto(
    params: ReporteHorasTrabajadorRangoDetalleProyectoParams,
  ): Promise<ReporteHorasRangoTrabajadorProyectoDetalleResult> {
    const { fechaInicio, fechaFin, idTrabajadores, idProyectos, idEstadosActividad } =
      params;
    const dIni = queryDateOrNull(fechaInicio);
    const dFin = queryDateOrNull(fechaFin);
    if (dIni == null || dFin == null) {
      return { data: [] };
    }
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

    type Row = Record<string, unknown>;
    const rows = await this.databaseFunctionService.callFunction<Row>(
      'con_ReporteHorasDedicadasRangoPorTrabajadorYProyecto',
      [dIni, dFin, pTrab, pProy, pEst],
    );

    if (!rows?.length) {
      return { data: [] };
    }

    const data: ReporteHorasRangoTrabajadorProyectoDetalleItem[] = rows.map(
      (row) => {
        const r = row as Record<string, unknown>;
        const str = (k: string): string | null =>
          r[k] != null && String(r[k]).trim() !== ''
            ? String(r[k]).trim()
            : null;
        return {
          idtrabajador: Number(r['idtrabajador'] ?? 0),
          nombretrabajador: str('nombretrabajador'),
          idproyecto: Number(r['idproyecto'] ?? 0),
          nombreproyecto: str('nombreproyecto'),
          nroproyecto: str('nroproyecto'),
          horasdedicadas: Number(r['horasdedicadas'] ?? 0),
          cantidadActividades: Number(
            r['cantidad_actividades'] ?? r['cantidadActividades'] ?? 0,
          ),
        };
      },
    );

    return { data };
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

  async obtenerDatosReporteActividades(
    idTrabajador: number,
    anioInforme: number,
  ): Promise<DatosReporteActividadesRow | null> {
    const raw =
      await this.databaseFunctionService.callFunctionSingle<
        Record<string, unknown>
      >('con_DatosReporteActividades', [idTrabajador, anioInforme]);
    if (!raw) return null;

    const pick = (...keys: string[]): string | null => {
      for (const key of keys) {
        const v = raw[key];
        if (v != null && String(v).trim() !== '') return String(v).trim();
      }
      return null;
    };

    return {
      razonsocial: pick('razonsocial'),
      nombrecomercial: pick('nombrecomercial'),
      celularempresa: pick('celularempresa') ?? '',
      correoempresa: pick('correoempresa') ?? '',
      urllogo: pick('urllogo') ?? '',
      nombrecompletotrabajador: pick(
        'nombrecompletotrabajador',
        'nombreCompletoTrabajador',
      ),
      nrodocumento: pick('nrodocumento', 'nroDocumento') ?? '',
      // Nombre/descripción lista del puesto en contrato (no el nombre del colaborador).
      puesto_trabajo: pick('puesto_trabajo', 'puestoTrabajo', 'puestotrabajo'),
      eslogan_anio: pick('eslogan_anio', 'esloganAnio') ?? '',
      ciudad_documento: pick('ciudad_documento', 'ciudadDocumento') ?? '',
      linea_destinatario: pick('linea_destinatario', 'lineaDestinatario'),
      url_firma_trabajador: pick(
        'url_firma_trabajador',
        'urlFirmaTrabajador',
      ),
      direccion_pie_empresa: pick(
        'direccion_pie_empresa',
        'direccionPieEmpresa',
      ),
    };
  }

  async listarActividadesPeriodoReporte(
    idTrabajador: number,
    fechaInicioYmd: string,
    fechaFinYmd: string,
  ): Promise<ActividadInformeServicioLinea[]> {
    if (idTrabajador == null || idTrabajador < 1) return [];
    const dIni = queryDateOrNull(fechaInicioYmd);
    const dFin = queryDateOrNull(fechaFinYmd);
    if (dIni == null || dFin == null) return [];
    const rows = await this.databaseFunctionService.callFunction<
      Record<string, unknown>
    >('con_ListarActividadesPeriodoReporte', [idTrabajador, dIni, dFin]);
    if (!rows?.length) return [];
    const intermediates = rows
      .map((r) => {
        const diaRaw = r['diajornada'];
        const diajornada = normalizeStoredValueToYmd(diaRaw);
        const nombreactividad =
          r['nombreactividad'] != null ? String(r['nombreactividad']).trim() : '';
        const nombretipoactividad =
          r['nombretipoactividad'] != null &&
          String(r['nombretipoactividad']).trim() !== ''
            ? String(r['nombretipoactividad']).trim()
            : null;
        const horainicio =
          r['horainicio'] != null && String(r['horainicio']).trim() !== ''
            ? String(r['horainicio']).trim()
            : null;
        const linea = r['linea'] != null ? String(r['linea']).trim() : '';
        const horasRaw = r['horasdedicadas'];
        const hn =
          horasRaw != null && String(horasRaw).trim() !== ''
            ? Number(horasRaw)
            : null;
        const horasdedicadas =
          hn != null && Number.isFinite(hn) ? hn : null;
        const linkevidencia =
          r['linkevidencia'] != null && String(r['linkevidencia']).trim() !== ''
            ? String(r['linkevidencia']).trim()
            : null;
        return {
          diajornada,
          nombreactividad,
          nombretipoactividad,
          nombreproyecto:
            r['nombreproyecto'] != null
              ? String(r['nombreproyecto']).trim()
              : null,
          descripciondetallada:
            r['descripciondetallada'] != null
              ? String(r['descripciondetallada']).trim()
              : null,
          nombremodalidad:
            r['nombremodalidad'] != null
              ? String(r['nombremodalidad']).trim()
              : null,
          horasdedicadas,
          estadoactividad:
            r['estadoactividad'] != null
              ? String(r['estadoactividad']).trim()
              : null,
          linkevidencia,
          horainicio,
          linea,
          evidenciasRaw: r['evidencias'],
        };
      })
      .filter((x) => x.nombreactividad !== '' || x.linea !== '');

    return Promise.all(
      intermediates.map(async (row) => {
        const { evidenciasRaw, ...rest } = row;
        const evidencias = await this.mapEvidenciasViewUrls(
          parseActividadEvidencias(evidenciasRaw),
        );
        return { ...rest, evidencias };
      }),
    );
  }
}
