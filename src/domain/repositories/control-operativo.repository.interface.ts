export interface ListarJornadasTrabajadorParams {
    idTrabajador: number;
    fechaInicio?: string;
    fechaFin?: string;
}

export interface JornadaListItem {
    id_jornada: number | null;
    dia_jornada: string;
    fecha: string;
    horas_esperadas: number;
    estado_jornada: string;
}

export interface IControlOperativoRepository {
    listarJornadasTrabajador(params: ListarJornadasTrabajadorParams): Promise<JornadaListItem[]>;
}

export const CONTROL_OPERATIVO_REPOSITORY = 'CONTROL_OPERATIVO_REPOSITORY';
