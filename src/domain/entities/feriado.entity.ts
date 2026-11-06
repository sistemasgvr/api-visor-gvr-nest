import type {
  AuditoriaCalendario,
  EstadoCalendario,
} from './calendario.entity';

export interface Feriado extends AuditoriaCalendario {
  id: number;
  fecha: string;
  nombre: string;
  idtipo: number;
  tipo: string;
  minutosefectivos: number;
  activo: boolean;
  revision: number;
}

export interface FeriadoCalendario {
  id: number;
  nombre: string;
  estado: EstadoCalendario;
  idversion: number | null;
  idestadoversion: number | null;
  pendiente: boolean;
}

export interface FeriadoDetalle {
  feriado: Feriado;
  calendarios: FeriadoCalendario[];
}

export interface FeriadoListado {
  data: Array<Feriado & { calendarios: FeriadoCalendario[] }>;
  pagination: { total: number; limit: number; offset: number };
}

export interface FeriadoMutacion extends FeriadoDetalle {
  aplicacion: Array<{
    idcalendario: number;
    idversion: number;
    pendiente: boolean;
    creadoborrador: boolean;
  }>;
}
