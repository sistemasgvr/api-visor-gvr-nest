import { Injectable } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    ListarJornadasTrabajadorParams,
    CrearJornadaParams,
    JornadaListItem,
    JornadaCreada,
} from '../../domain/repositories/control-operativo.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';

@Injectable()
export class ControlOperativoRepository implements IControlOperativoRepository {
    constructor(
        private readonly databaseFunctionService: DatabaseFunctionService,
    ) {}

    async listarJornadasTrabajador(params: ListarJornadasTrabajadorParams): Promise<JornadaListItem[]> {
        const { idTrabajador, fechaInicio, fechaFin } = params;

        const pFechaInicio = fechaInicio ?? this.getInicioSemanaActual();
        const pFechaFin = fechaFin ?? this.getFinSemanaActual();

        const result = await this.databaseFunctionService.callFunction<JornadaListItem>(
            'conlistarjornadastrabajador',
            [idTrabajador, pFechaInicio, pFechaFin],
        );

        if (!result || result.length === 0) {
            return [];
        }

        return result;
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
