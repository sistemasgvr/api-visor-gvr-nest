export interface DashboardCantidadProyectosVigentes {
    cantidad: number;
}

export interface IDashboardRepository {
    cantidadProyectosVigentes(): Promise<DashboardCantidadProyectosVigentes>;
    cantidadTrabajadoresActivos(): Promise<DashboardCantidadTrabajadoresActivos>;
    cantidadActividadesPendientes(): Promise<DashboardCantidadActividadesPendientes>;
    cantidadActividadesObservadas(): Promise<DashboardCantidadActividadesObservadas>;
    cantidadActividadesRechazadas(): Promise<DashboardCantidadActividadesRechazadas>;
    cantidadTrabajadoresPorProyecto(): Promise<DashboardCantidadTrabajadoresPorProyecto[]>;
    cantidadJornadasCompletasSemana(): Promise<DashboardCantidadJornadasCompletasSemana[]>;
    topTrabajadoresHorasMes(): Promise<DashboardTopTrabajadoresHorasMes[]>;
    cantidadTrabajadoresConectadoSemana(): Promise<DashboardCantidadTrabajadoresConectadoSemana[]>;
    horasEsperadasVsRegistradasMes(): Promise<DashboardHorasEsperadasVsRegistradasMes[]>;
    proyectosConProgreso(): Promise<DashboardProyectosConProgreso[]>;
}

export interface DashboardCantidadTrabajadoresActivos {
    cantidad: number;
}

export interface DashboardCantidadActividadesPendientes {
    dash_CantidadActividadesPendientes: number;
}
export interface DashboardCantidadActividadesObservadas {
    dash_CantidadActividadesObservadas: number;
}
export interface DashboardCantidadActividadesRechazadas {
    dash_CantidadActividadesRechazadas: number;
}
export interface DashboardCantidadTrabajadoresPorProyecto {
    id: number;
    nombreProyecto: string;
    cantidadTrabajadores: number;
}
export interface DashboardCantidadJornadasCompletasSemana {
    dia: string;
    cantidad: number;
}
export interface DashboardTopTrabajadoresHorasMes {
    tipo: string;
    posicion: number;
    nombreTrabajador: string;
    horasRegistradas: number;
}
export interface DashboardCantidadTrabajadoresConectadoSemana {
    dia: string;
    cantidad: number;
}
export interface DashboardHorasEsperadasVsRegistradasMes {
    dia: number;
    horasEsperadas: number;
    horasRegistradas: number;
    totalTrabajadoresEsperados: number;
    totalTrabajadoresRegistrados: number;
}

export interface DashboardProyectosConProgreso {
    nombreProyecto: string;
    tipoProyecto: string;
    estadoProyecto: string;
    progresoPorcentaje: number;
}


export const DASHBOARD_REPOSITORY = 'DASHBOARD_REPOSITORY';