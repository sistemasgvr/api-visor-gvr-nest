/** Tipos del JSON que devuelven las funciones con_* de control de asistencia (nombres en minúsculas). */
export type TipoMarcaAsistencia =
  | 'ingreso'
  | 'salida_refrigerio'
  | 'retorno_refrigerio'
  | 'salida';

export const TIPOS_MARCA_ASISTENCIA: readonly TipoMarcaAsistencia[] = [
  'ingreso',
  'salida_refrigerio',
  'retorno_refrigerio',
  'salida',
];

export type EstadoDiaAsistencia =
  | 'no_laborable'
  | 'futuro'
  | 'pendiente'
  | 'sin_registro'
  | 'sin_salida'
  | 'en_curso'
  | 'tardanza'
  | 'completo';

export interface HorarioAsistencia {
  entrada: string | null;
  salida: string | null;
  minutosrefrigerio: number;
  minutosefectivos: number;
}

export interface MarcasAsistencia {
  ingreso: string | null;
  salidarefrigerio: string | null;
  retornorefrigerio: string | null;
  salida: string | null;
  salidamarcada: string | null;
  salidacalculada: boolean;
  motivoregistro: string | null;
}

/** Estado del propio colaborador: qué día registra y qué marca corresponde. */
export interface EstadoAsistencia {
  habilitado: boolean;
  servidor: { fecha: string; hora: string };
  trabajador: { id: number; nombrecompleto: string };
  bloqueohoy: boolean;
  dia: {
    fecha: string;
    eshoy: boolean;
    diaanterior: boolean;
    tienecalendario: boolean;
    laborable: boolean;
    esferiado: boolean;
    nombreferiado: string | null;
    horario: HorarioAsistencia | null;
    marcas: MarcasAsistencia;
    opciones: TipoMarcaAsistencia[];
    ingresodisponibledesde: string | null;
    requieremotivo: boolean;
    horasextrasautorizadas: boolean;
  };
}

export interface DiaAsistencia extends MarcasAsistencia {
  fecha: string;
  diasemana: number;
  laborable: boolean;
  esferiado: boolean;
  nombreferiado: string | null;
  programado: HorarioAsistencia | null;
  observaciones: string | null;
  horasextrasautorizadas: boolean;
  minutoslaborados: number;
  minutosrefrigerio: number | null;
  refrigerioexcedido: boolean;
  minutostardanza: number;
  minutosextras: number;
  estado: EstadoDiaAsistencia;
}

export interface AsistenciaMes {
  trabajador: {
    id: number;
    nombres: string;
    apellidos: string;
    nombrecompleto: string;
    tipodocumento: string | null;
    nrodocumento: string;
    idarea: number | null;
    area: string | null;
    cargo: string | null;
    registraasistencia: boolean;
    empresa: {
      razonsocial: string | null;
      ruc: string | null;
      direccion: string | null;
    };
  };
  periodo: { anio: number; mes: number; desde: string; hasta: string };
  dias: DiaAsistencia[];
  totales: {
    diaslaborables: number;
    diaslaborados: number;
    diassinsalida: number;
    minutoslaborados: number;
    minutosextras: number;
    minutostardanza: number;
    diastardanza: number;
  };
}
