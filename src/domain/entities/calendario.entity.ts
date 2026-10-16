export type EstadoCalendario = 0 | 1;
export type EstadoVersionCalendario = string;
export type TipoExcepcionCalendario = string;

export interface AuditoriaCalendario {
  estado: EstadoCalendario;
  idusuariocreacion: number | null;
  idusuariomodificacion: number | null;
  fechacreacion: string | null;
  fechamodificacion: string | null;
}

export interface Calendario extends AuditoriaCalendario {
  id: number;
  nombre: string;
  descripcion: string;
  estado: EstadoCalendario;
  revision: number;
}

export interface CalendarioVersion extends AuditoriaCalendario {
  id: number;
  idcalendario: number;
  numero: number;
  idestado: number;
  nombreestado: EstadoVersionCalendario;
  zonahoraria: string;
  revision: number;
  publicadaen: string | null;
}

export interface ConfiguracionDiaCalendario {
  diasemana: number;
  laborable: boolean;
  horaentrada: string | null;
  horasalida: string | null;
  minutosrefrigerio: number;
}

export interface CalendarioDia
  extends ConfiguracionDiaCalendario, AuditoriaCalendario {
  id: number;
  idversion: number;
  minutosefectivos: number;
}

export interface CalendarioExcepcion extends AuditoriaCalendario {
  id: number;
  idversion: number;
  idferiado: number | null;
  gestioncentralizada: boolean;
  fecha: string;
  nombre: string;
  idtipo: number;
  tipo: TipoExcepcionCalendario;
  minutosefectivos: number;
  activo: boolean;
}

export type ResumenVersionCalendario = Pick<
  CalendarioVersion,
  | 'id'
  | 'numero'
  | 'idestado'
  | 'estado'
  | 'nombreestado'
  | 'zonahoraria'
  | 'revision'
  | 'publicadaen'
>;

export interface CalendarioDetalle {
  calendario: Calendario;
  version: CalendarioVersion;
  minutossemanales: number;
  semana: CalendarioDia[];
  excepciones: CalendarioExcepcion[];
  versiones: ResumenVersionCalendario[];
}

export interface CalendarioListadoItem extends Calendario {
  idversion: number;
  numeroversion: number;
  idestadoversion: number;
  estadoversion: EstadoVersionCalendario;
  zonahoraria: string;
  minutossemanales: number;
}

export interface CalendarioListado {
  data: CalendarioListadoItem[];
  pagination: { total: number; limit: number; offset: number };
}

export interface CalendarioDisponibilidad {
  idcalendario: number;
  idversion: number;
  zonahoraria: string;
  desde: string;
  hasta: string;
  dias: Array<{
    fecha: string;
    diasemana: number;
    minutosbase: number;
    minutosefectivos: number;
    horasefectivas: number;
    origen: 'semanal_no_laborable' | 'semana' | 'feriado' | 'dia_especial';
    excepcion: Pick<
      CalendarioExcepcion,
      'id' | 'idferiado' | 'nombre' | 'idtipo' | 'tipo'
    > | null;
  }>;
}
