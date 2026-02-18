import { Injectable } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    ListarJornadasTrabajadorParams,
    ListarJornadasTrabajadorResult,
    CrearJornadaParams,
    JornadaListItem,
    JornadaCreada,
    ListarActividadesParams,
    ActividadListItem,
} from '../../domain/repositories/control-operativo.repository.interface';
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
                fecha: f != null ? String(f).split('T')[0] ?? String(f) : '',
            } as JornadaListItem;
        });

        return { data, totalCount };
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

    async listarActividades(params: ListarActividadesParams): Promise<ActividadListItem[]> {
        const { idJornada, idTrabajador, idProyecto, idEstadoActividad } = params;
        const result = await this.databaseFunctionService.callFunction<ActividadListItem>(
            'conlistaractividades',
            [
                idJornada ?? null,
                idTrabajador ?? null,
                idProyecto ?? null,
                idEstadoActividad ?? null,
            ],
        );
        return result ?? [];
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
}
