/**
 * IDs de listas en genListado (genlistadoopciones.idlista).
 * Punto único de verdad en Nest — alinear con front `listasOpciones.ts`.
 * Las listas ACC flujo/revisión (24–44) viven en gen-listado-acc-flujo.constants.ts.
 */

/** Tipo de proyecto */
export const ID_LISTA_TIPO_PROYECTO = 1;

/** Tipo de documento */
export const ID_LISTA_TIPO_DOCUMENTO = 4;

/** País (opciones de listado) */
export const ID_LISTA_PAIS = 5;

/** Zona horaria */
export const ID_LISTA_ZONA_HORARIA = 6;

/** Tipo de moneda */
export const ID_LISTA_TIPO_MONEDA = 7;

/** Grado de instrucción (trabajador) */
export const ID_LISTA_GRADO_INSTRUCCION = 8;

/** Carrera (trabajador) */
export const ID_LISTA_CARRERA = 9;

/** Entidad bancaria (trabajador) */
export const ID_LISTA_ENTIDAD_BANCARIA = 10;

/** Tipo de contrato (trabajador) */
export const ID_LISTA_TIPO_CONTRATO = 11;

/** Duración de contrato (trabajador) */
export const ID_LISTA_DURACION_CONTRATO = 12;

/** Tipo de adjunto (trabajador) */
export const ID_LISTA_TIPO_ADJUNTO = 13;

/** Parentesco contacto emergencia (trabajador) */
export const ID_LISTA_PARENTESCO = 14;

/** Estado Jornada (Control Operativo) */
export const ID_LISTA_ESTADO_JORNADA = 15;

/** Estado Actividad (Control Operativo) — ver también estado-actividad.constants.ts */
export const ID_LISTA_ESTADO_ACTIVIDAD = 16;

/** Tipo de Actividad (Control Operativo) */
export const ID_LISTA_TIPO_ACTIVIDAD = 17;

/** Modalidad proyecto */
export const ID_LISTA_MODALIDAD_PROYECTO = 19;

/** Estado proyecto */
export const ID_LISTA_ESTADO_PROYECTO = 20;

/** Estado cotización */
export const ID_LISTA_ESTADO_COTIZACION = 21;

/** Tipo documento proyecto */
export const ID_LISTA_TIPO_DOCUMENTO_PROYECTO = 22;

/** Nivel acceso proyecto */
export const ID_LISTA_NIVEL_ACCESO_PROYECTO = 23;

/** Puesto de trabajo (trabajador / contrato) */
export const ID_LISTA_PUESTO_TRABAJO = 45;

/** Estado de entregable (Control Operativo) — ver estado-entregable.constants.ts */
export const ID_LISTA_ESTADO_ENTREGABLE = 46;

/**
 * Las 7 listas base del formulario trabajador.
 * El use case añade siempre el puesto (`ID_LISTA_PUESTO_TRABAJO`).
 */
export const ID_LISTAS_CATALOGOS_TRABAJADOR_BASE: readonly number[] = [
  ID_LISTA_GRADO_INSTRUCCION,
  ID_LISTA_CARRERA,
  ID_LISTA_ENTIDAD_BANCARIA,
  ID_LISTA_TIPO_CONTRATO,
  ID_LISTA_DURACION_CONTRATO,
  ID_LISTA_TIPO_ADJUNTO,
  ID_LISTA_PARENTESCO,
] as const;
