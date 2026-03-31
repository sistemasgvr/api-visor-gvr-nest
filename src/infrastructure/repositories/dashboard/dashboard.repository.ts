import { Injectable } from '@nestjs/common';
import {
    IDashboardRepository,
    DashboardCantidadProyectosVigentes,
    DashboardCantidadTrabajadoresActivos,
    DashboardCantidadActividadesPendientes,
    DashboardCantidadActividadesObservadas,
    DashboardCantidadActividadesRechazadas,
    DashboardCantidadTrabajadoresPorProyecto,
    DashboardCantidadJornadasCompletasSemana,
    DashboardTopTrabajadoresHorasMes,
    DashboardCantidadTrabajadoresConectadoSemana,
    DashboardHorasEsperadasVsRegistradasMes,
} from 'src/domain/repositories/dashboard/dashboard.repository.interface';
import { DatabaseFunctionService } from 'src/infrastructure/database/database-function.service';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
    constructor(
        private readonly databaseFunctionService: DatabaseFunctionService,
    ) { }

    async cantidadProyectosVigentes(): Promise<DashboardCantidadProyectosVigentes> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'dash_CantidadProyectosVigentes',
            [],
        );
        return { cantidad: Number(result?.dash_CantidadProyectosVigentes) };
    }

    async cantidadTrabajadoresActivos(): Promise<DashboardCantidadTrabajadoresActivos> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'dash_CantidadTrabajadoresActivos',
            [],
        );
        return { cantidad: Number(result?.dash_CantidadTrabajadoresActivos) };
    }

    async cantidadActividadesPendientes(): Promise<DashboardCantidadActividadesPendientes> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'dash_CantidadActividadesPendientes', [],
        );
        return { dash_CantidadActividadesPendientes: Number(result?.dash_CantidadActividadesPendientes) || 0 };
    }

    async cantidadActividadesObservadas(): Promise<DashboardCantidadActividadesObservadas> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'dash_CantidadActividadesObservadas', [],
        );
        return { dash_CantidadActividadesObservadas: Number(result?.dash_CantidadActividadesObservadas) || 0 };
    }

    async cantidadActividadesRechazadas(): Promise<DashboardCantidadActividadesRechazadas> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'dash_CantidadActividadesRechazadas', [],
        );
        return { dash_CantidadActividadesRechazadas: Number(result?.dash_CantidadActividadesRechazadas) || 0 };
    }

    async cantidadTrabajadoresPorProyecto(): Promise<DashboardCantidadTrabajadoresPorProyecto[]> {
        const result = await this.databaseFunctionService.callFunction<any>(
            'dash_CantidadTrabajadoresPorProyecto', [],
        );
        if (!Array.isArray(result)) return [];
        return result.map(row => ({
            id: Number(row.id),
            nombreProyecto: row.nombreProyecto,
            cantidadTrabajadores: Number(row.cantidadTrabajadores),
        }));
    }

    async cantidadJornadasCompletasSemana(): Promise<DashboardCantidadJornadasCompletasSemana[]> {
        const result = await this.databaseFunctionService.callFunction<any>(
            'dash_CantidadJornadasCompletasSemana', [],
        );
        if (!Array.isArray(result)) return [];
        return result.map(row => ({
            dia: row.dia,
            cantidad: Number(row.cantidad),
        }));
    }

    async topTrabajadoresHorasMes(): Promise<DashboardTopTrabajadoresHorasMes[]> {
        const result = await this.databaseFunctionService.callFunction<any>(
            'dash_TopTrabajadoresHorasMes', [],
        );
        if (!Array.isArray(result)) return [];
        return result.map(row => ({
            tipo: row.tipo,
            posicion: Number(row.posicion),
            nombreTrabajador: row.nombreTrabajador,
            horasRegistradas: Number(row.horasRegistradas),
        }));
    }

    async cantidadTrabajadoresConectadoSemana(): Promise<DashboardCantidadTrabajadoresConectadoSemana[]> {
        const result = await this.databaseFunctionService.callFunction<any>(
            'dash_CantidadTrabajadoresConectadoSemana', [],
        );
        if (!Array.isArray(result)) return [];
        return result.map(row => ({
            dia: row.dia,
            cantidad: Number(row.cantidad),
        }));
    }

    async horasEsperadasVsRegistradasMes(): Promise<DashboardHorasEsperadasVsRegistradasMes[]> {
        const result = await this.databaseFunctionService.callFunction<any>(
            'dash_HorasEsperadasVsRegistradasMes', [],
        );
        if (!Array.isArray(result)) return [];
        return result.map(row => ({
            dia: Number(row.dia),
            horasEsperadas: Number(row.horasEsperadas),
            horasRegistradas: Number(row.horasRegistradas),
            totalUsuariosEsperados: Number(row.totalUsuariosEsperados),
            totalUsuariosRegistrados: Number(row.totalUsuariosRegistrados),
        }));
    }
}