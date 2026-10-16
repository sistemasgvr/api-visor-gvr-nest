import type {
  CalendarioDetalle,
  CalendarioDisponibilidad,
  CalendarioListado,
  ConfiguracionDiaCalendario,
  EstadoCalendario,
} from '../entities/calendario.entity';

import type {
  FeriadoDetalle,
  FeriadoListado,
  FeriadoMutacion,
} from '../entities/feriado.entity';

export const CALENDARIOS_REPOSITORY = Symbol('CALENDARIOS_REPOSITORY');

export interface GuardarFeriadoData {
  fecha: string;
  nombre: string;
  idtipo: number;
  minutosefectivos: number;
  activo?: boolean;
  /** Selección completa; [] guarda el feriado sin asignaciones. */
  idcalendarios: number[];
  revision?: number;
}

export interface ListarCalendariosParams {
  busqueda?: string;
  estado?: EstadoCalendario;
  limit?: number;
  offset?: number;
}
export interface CrearCalendarioData {
  nombre: string;
  descripcion?: string;
  zonahoraria?: string;
}
export interface ActualizarCalendarioData {
  revision: number;
  nombre: string;
  descripcion?: string;
}
export interface GuardarSemanaCalendarioData {
  revision: number;
  zonahoraria: string;
  semana: ConfiguracionDiaCalendario[];
}
export interface GuardarExcepcionCalendarioData {
  revision: number;
  fecha: string;
  nombre: string;
  idtipo: number;
  minutosefectivos: number;
  activo?: boolean;
}

export interface ICalendariosRepository {
  listarFeriados(
    idUsuario: number,
    params: ListarCalendariosParams,
  ): Promise<FeriadoListado>;
  obtenerFeriado(idUsuario: number, idFeriado: number): Promise<FeriadoDetalle>;
  guardarFeriado(
    idUsuario: number,
    data: GuardarFeriadoData,
    idFeriado?: number,
  ): Promise<FeriadoMutacion>;
  eliminarFeriado(
    idUsuario: number,
    idFeriado: number,
    revision: number,
  ): Promise<FeriadoMutacion>;
  listar(
    idUsuario: number,
    params: ListarCalendariosParams,
  ): Promise<CalendarioListado>;
  obtener(
    idUsuario: number,
    id: number,
    idVersion?: number,
  ): Promise<CalendarioDetalle>;
  crear(
    idUsuario: number,
    data: CrearCalendarioData,
  ): Promise<CalendarioDetalle>;
  actualizar(
    idUsuario: number,
    id: number,
    data: ActualizarCalendarioData,
  ): Promise<CalendarioDetalle>;
  duplicar(
    idUsuario: number,
    idVersionOrigen: number,
    nombre: string,
  ): Promise<CalendarioDetalle>;
  crearVersion(
    idUsuario: number,
    idVersionOrigen: number,
  ): Promise<CalendarioDetalle>;
  guardarSemana(
    idUsuario: number,
    idVersion: number,
    data: GuardarSemanaCalendarioData,
  ): Promise<CalendarioDetalle>;
  guardarExcepcion(
    idUsuario: number,
    idVersion: number,
    data: GuardarExcepcionCalendarioData,
    idExcepcion?: number,
  ): Promise<CalendarioDetalle>;
  eliminarExcepcion(
    idUsuario: number,
    idVersion: number,
    revision: number,
    idExcepcion: number,
  ): Promise<CalendarioDetalle>;
  publicarVersion(
    idUsuario: number,
    idVersion: number,
    revision: number,
  ): Promise<CalendarioDetalle>;
  cambiarEstado(
    idUsuario: number,
    id: number,
    revision: number,
    estado: EstadoCalendario,
  ): Promise<CalendarioDetalle>;
  disponibilidad(
    idUsuario: number,
    idVersion: number,
    desde: string,
    hasta: string,
  ): Promise<CalendarioDisponibilidad>;
}
