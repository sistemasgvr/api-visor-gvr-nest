import { Injectable } from '@nestjs/common';
import {
  IDashboardRepository,
  DashboardRangoFechas,
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
  DashboardProyectosConProgreso,
  DashboardActividadesPorValidarPorCoordinador,
  DashboardTopTrabajadoresJornadasCerradas,
  DashboardTopCoordinadoresActividadesValidadas,
} from '../../domain/repositories/dashboard.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';

/**
 * Parámetros de rango para las funciones `dash_*` parametrizadas.
 * Las funciones reciben `(p_fecha_inicio date, p_fecha_fin date)` y, con NULL,
 * aplican su periodo por defecto; por eso un rango ausente se envía como null.
 */
const parametrosRango = (
  rango?: DashboardRangoFechas,
): [string | null, string | null] => [
  rango?.fechaInicio ?? null,
  rango?.fechaFin ?? null,
];

/**
 * Normaliza a `YYYY-MM-DD` la columna `fecha`, que el driver entrega como `Date`
 * o como cadena según el tipo declarado por la función.
 */
const aFechaIso = (valor: unknown): string => {
  if (valor instanceof Date) {
    const mes = String(valor.getMonth() + 1).padStart(2, '0');
    const dia = String(valor.getDate()).padStart(2, '0');
    return `${valor.getFullYear()}-${mes}-${dia}`;
  }
  return typeof valor === 'string' ? valor.slice(0, 10) : '';
};

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
  ) {}

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

  async cantidadActividadesPendientes(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadActividadesPendientes> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'dash_CantidadActividadesPendientes',
      parametrosRango(rango),
    );
    return {
      dash_CantidadActividadesPendientes:
        Number(result?.dash_CantidadActividadesPendientes) || 0,
    };
  }

  async cantidadActividadesObservadas(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadActividadesObservadas> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'dash_CantidadActividadesObservadas',
      parametrosRango(rango),
    );
    return {
      dash_CantidadActividadesObservadas:
        Number(result?.dash_CantidadActividadesObservadas) || 0,
    };
  }

  async cantidadActividadesRechazadas(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadActividadesRechazadas> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'dash_CantidadActividadesRechazadas',
      parametrosRango(rango),
    );
    return {
      dash_CantidadActividadesRechazadas:
        Number(result?.dash_CantidadActividadesRechazadas) || 0,
    };
  }

  async cantidadTrabajadoresPorProyecto(): Promise<
    DashboardCantidadTrabajadoresPorProyecto[]
  > {
    const result = await this.databaseFunctionService.callFunction<any>(
      'dash_CantidadTrabajadoresPorProyecto',
      [],
    );
    if (!Array.isArray(result)) return [];
    return result.map((row) => ({
      id: Number(row.id),
      nombreProyecto: row.nombreProyecto,
      cantidadTrabajadores: Number(row.cantidadTrabajadores),
    }));
  }

  async cantidadJornadasCompletasSemana(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadJornadasCompletasSemana[]> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'dash_CantidadJornadasCompletasSemana',
      parametrosRango(rango),
    );
    if (!Array.isArray(result)) return [];
    return result.map((row) => ({
      fecha: aFechaIso(row.fecha),
      dia: row.dia,
      cantidad: Number(row.cantidad),
    }));
  }

  async topTrabajadoresHorasMes(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardTopTrabajadoresHorasMes[]> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'dash_TopTrabajadoresHorasMes',
      parametrosRango(rango),
    );
    if (!Array.isArray(result)) return [];
    return result.map((row) => ({
      tipo: row.tipo,
      posicion: Number(row.posicion),
      nombreTrabajador: row.nombreTrabajador,
      horasRegistradas: Number(row.horasRegistradas),
    }));
  }

  async cantidadTrabajadoresConectadoSemana(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadTrabajadoresConectadoSemana[]> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'dash_CantidadTrabajadoresConectadoSemana',
      parametrosRango(rango),
    );
    if (!Array.isArray(result)) return [];
    return result.map((row) => ({
      fecha: aFechaIso(row.fecha),
      dia: row.dia,
      cantidad: Number(row.cantidad),
    }));
  }

  async horasEsperadasVsRegistradasMes(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardHorasEsperadasVsRegistradasMes[]> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'dash_HorasEsperadasVsRegistradasMes',
      parametrosRango(rango),
    );
    if (!Array.isArray(result)) return [];
    return result.map((row) => ({
      fecha: aFechaIso(row.fecha),
      dia: Number(row.dia),
      horasEsperadas: Number(row.horasEsperadas),
      horasRegistradas: Number(row.horasRegistradas),
      totalTrabajadoresEsperados: Number(row.totalTrabajadoresEsperados),
      totalTrabajadoresRegistrados: Number(row.totalTrabajadoresRegistrados),
    }));
  }

  async proyectosConProgreso(): Promise<DashboardProyectosConProgreso[]> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'dash_ProyectosConProgreso',
      [],
    );
    if (!Array.isArray(result)) return [];
    return result.map((row) => ({
      nombreProyecto: row.nombreProyecto,
      tipoProyecto: row.tipoProyecto,
      estadoProyecto: row.estadoProyecto,
      progresoPorcentaje: Math.trunc(Number(row.progresoPorcentaje)),
    }));
  }

  async actividadesPorValidarPorCoordinador(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardActividadesPorValidarPorCoordinador[]> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'dash_ActividadesPorValidarPorCoordinador',
      parametrosRango(rango),
    );
    if (!Array.isArray(result)) return [];
    return result.map((row) => ({
      idCoordinador: Number(row.idCoordinador),
      nombreCoordinador: row.nombreCoordinador,
      correoCoordinador: row.correoCoordinador ?? null,
      actividadesPorValidar: Number(row.actividadesPorValidar),
    }));
  }

  async topTrabajadoresJornadasCerradas(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardTopTrabajadoresJornadasCerradas[]> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'dash_TopTrabajadoresJornadasCerradas',
      parametrosRango(rango),
    );
    if (!Array.isArray(result)) return [];
    return result.map((row) => ({
      idTrabajador: Number(row.idTrabajador),
      nombreTrabajador: row.nombreTrabajador,
      jornadasCerradas: Number(row.jornadasCerradas),
    }));
  }

  async topCoordinadoresActividadesValidadas(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardTopCoordinadoresActividadesValidadas[]> {
    const result = await this.databaseFunctionService.callFunction<any>(
      'dash_TopCoordinadoresActividadesValidadas',
      parametrosRango(rango),
    );
    if (!Array.isArray(result)) return [];
    return result.map((row) => ({
      idCoordinador: Number(row.idCoordinador),
      nombreCoordinador: row.nombreCoordinador,
      actividadesValidadas: Number(row.actividadesValidadas),
      actividadesTotales: Number(row.actividadesTotales),
      porcentajeValidadas: Number(row.porcentajeValidadas),
    }));
  }
}
