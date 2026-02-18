import { Injectable } from '@nestjs/common';
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
        type Row = ActividadListItem & { total_count?: number; total_horas?: number; horasesperadas?: number | null };
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
            return { data: [], totalCount: 0, totalHoras: 0, horasesperadas: null };
        }
        const totalCount = Number(result[0].total_count ?? result.length);
        const totalHoras = Number(result[0].total_horas ?? 0);
        const horasesperadas = result[0].horasesperadas != null ? Number(result[0].horasesperadas) : null;
        const data: ActividadListItem[] = result.map((row) => {
            const { total_count: _tc, total_horas: _th, horasesperadas: _hm, ...rest } = row;
            return rest as ActividadListItem;
        });
        return { data, totalCount, totalHoras, horasesperadas };
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
