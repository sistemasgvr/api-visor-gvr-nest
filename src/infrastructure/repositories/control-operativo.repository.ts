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
    ActividadDetalle,
    CrearActividadParams,
    ActualizarActividadParams,
    ActividadCreada,
    CronCierreJornadasResult,
    TrabajadorParaFiltro,
    ProyectoAccesoTrabajador,
} from '../../domain/repositories/control-operativo.repository.interface';

/** PostgreSQL devuelve el entero en una columna con el nombre de la función. */
function getScalarInt(row: any): number {
    if (row == null) return 0;
    if (typeof row === 'number') return row;
    const keys = Object.keys(row);
    if (keys.length > 0 && typeof row[keys[0]] === 'number') return row[keys[0]];
    return 0;
}
import { DatabaseFunctionService } from '../database/database-function.service';

@Injectable()
export class ControlOperativoRepository implements IControlOperativoRepository {
    constructor(
        private readonly databaseFunctionService: DatabaseFunctionService,
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    async listarJornadasTrabajador(params: ListarJornadasTrabajadorParams): Promise<ListarJornadasTrabajadorResult> {
        const { idTrabajador, fechaInicio, fechaFin, limit = 10, offset = 0 } = params;

        const pFechaInicio = fechaInicio ?? this.getInicioSemanaActual();
        const pFechaFin = fechaFin ?? this.getFinSemanaActual();

        type Row = JornadaListItem & { total_count?: number };
        const result = await this.databaseFunctionService.callFunction<Row>(
            'conlistarjornadastrabajador',
            [idTrabajador, pFechaInicio, pFechaFin, limit, offset],
        );

        if (!result || result.length === 0) {
            return { data: [], totalCount: 0 };
        }

        const totalCount = Number(result[0]?.total_count ?? result.length);
        const data: JornadaListItem[] = result.map((row) => {
            const { total_count: _tc, fecha: f, ...rest } = row;
            return {
                ...rest,
                fecha: this.formatFechaYYYYMMDD(f),
            } as JornadaListItem;
        });

        return { data, totalCount };
    }

    async listarTrabajadoresParaFiltro(idTrabajador: number): Promise<TrabajadorParaFiltro[]> {
        const result = await this.databaseFunctionService.callFunction<TrabajadorParaFiltro>(
            'tra_listar_trabajadores_para_filtro',
            [idTrabajador],
        );
        return result ?? [];
    }

    async listarProyectosAccesoTrabajador(idTrabajador: number): Promise<ProyectoAccesoTrabajador[]> {
        const result = await this.databaseFunctionService.callFunction<ProyectoAccesoTrabajador>(
            'pro_listar_proyectos_acceso_trabajador',
            [idTrabajador],
        );
        return result ?? [];
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

    async crearJornada(params: CrearJornadaParams): Promise<JornadaCreada | null> {
        const {
            idTrabajador,
            fechaJornada,
            idConfiguracionJornada,
            idEstadoJornada,
            horasEsperadas,
        } = params;
        const row = await this.databaseFunctionService.callFunctionSingle<JornadaCreada>(
            'concrearjornada',
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

    async listarActividades(params: ListarActividadesParams): Promise<ListarActividadesResult> {
        const { idJornada, idTrabajador, idProyecto, idEstadoActividad, limit = 10, offset = 0 } = params;
        type Row = ActividadListItem & { total_count?: number; total_horas?: number; horasesperadas?: number | null; diajornada?: string | null };
        const result = await this.databaseFunctionService.callFunction<Row>(
            'conlistaractividades',
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
            if (idJornada != null && idJornada >= 1) {
                const meta = await this.dataSource.query<{ diajornada: string; horasesperadas: number }[]>(
                    'SELECT fechajornada::text AS diajornada, horasesperadas FROM conjornada WHERE id = $1 AND estado = 1 LIMIT 1',
                    [idJornada],
                );
                if (meta?.[0]) {
                    diajornada = meta[0].diajornada != null ? String(meta[0].diajornada).split('T')[0] : null;
                    horasesperadas = meta[0].horasesperadas != null ? Number(meta[0].horasesperadas) : null;
                }
            }
            return { data: [], totalCount: 0, totalHoras: 0, horasesperadas, diajornada };
        }
        const totalCount = Number(result[0].total_count ?? result.length);
        const totalHoras = Number(result[0].total_horas ?? 0);
        const horasesperadas = result[0].horasesperadas != null ? Number(result[0].horasesperadas) : null;
        const diajornada = result[0].diajornada != null ? String(result[0].diajornada).split('T')[0] : null;
        const data: ActividadListItem[] = result.map((row) => {
            const { total_count: _tc, total_horas: _th, horasesperadas: _hm, diajornada: _dj, ...rest } = row;
            return rest as ActividadListItem;
        });
        return { data, totalCount, totalHoras, horasesperadas, diajornada };
    }

    async obtenerActividad(idActividad: number): Promise<ActividadDetalle | null> {
        if (idActividad == null || idActividad < 1) return null;
        const result = await this.databaseFunctionService.callFunction<Record<string, unknown>>(
            'conobteneractividad',
            [idActividad],
        );
        const row = result?.[0];
        if (!row) return null;
        // El driver puede devolver la columna como diajornada, diaJornada o fechajornada (minúsculas)
        const rawDia =
            row.diajornada ??
            row.diaJornada ??
            row.fechajornada ??
            row.fechaJornada ??
            (() => {
                const key = Object.keys(row).find((k) => k.toLowerCase() === 'diajornada' || k.toLowerCase() === 'fechajornada');
                return key ? row[key] : undefined;
            })();
        const diajornada =
            rawDia != null && rawDia !== ''
                ? (typeof rawDia === 'string' ? rawDia : String(rawDia)).split('T')[0].trim()
                : null;
        return { ...row, diajornada } as ActividadDetalle;
    }

    async crearActividad(params: CrearActividadParams): Promise<ActividadCreada | null> {
        const rows = await this.databaseFunctionService.callFunction<ActividadCreada>(
            'concrearactividad',
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

    async actualizarActividad(params: ActualizarActividadParams): Promise<ActividadCreada | null> {
        const rows = await this.databaseFunctionService.callFunction<ActividadCreada>(
            'conactualizaractividad',
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
            ],
        );
        return rows?.[0] ?? null;
    }

    async eliminarActividad(idActividad: number): Promise<boolean> {
        if (idActividad == null || idActividad < 1) return false;
        const result = await this.databaseFunctionService.callFunction<{ coneliminaractividad?: boolean }>(
            'coneliminaractividad',
            [idActividad],
        );
        const row = result?.[0];
        return row?.coneliminaractividad === true;
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

    async ejecutarCronCierreJornadas(fecha: string): Promise<CronCierreJornadasResult> {
        const rows = await this.databaseFunctionService.callFunction<any>(
            'concroncierrejornadas',
            [fecha],
        );
        const row = rows?.[0];
        return {
            insertados_alerta: Number(row?.insertados_alerta ?? 0),
            pasados_incompleto: Number(row?.pasados_incompleto ?? 0),
            pasados_completado: Number(row?.pasados_completado ?? 0),
        };
    }

    async actualizarEstadoJornada(
        idJornada: number,
        idEstadoJornada: number,
        idUsuarioModificacion?: number,
    ): Promise<boolean> {
        const row = await this.databaseFunctionService.callFunctionSingle<any>(
            'conactualizarestadojornada',
            [idJornada, idEstadoJornada, idUsuarioModificacion ?? null],
        );
        return row === true || row?.conactualizarestadojornada === true;
    }
}
