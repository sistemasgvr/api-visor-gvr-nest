/**
 * Nombres de Estado Proyecto (genListadoOpciones, lista "Estado Proyecto").
 * Los IDs varían por ambiente; en SQL se valida por nombre (LOWER TRIM).
 */
export const NOMBRE_ESTADO_PROYECTO_VIGENTE = 'Vigente';
export const NOMBRE_ESTADO_PROYECTO_NO_VIGENTE = 'No vigente';
export const NOMBRE_ESTADO_PROYECTO_EN_STANDBY = 'En standby';
export const NOMBRE_ESTADO_PROYECTO_CULMINADO = 'Culminado';

/** Estados que permiten registrar o editar actividades (salvo corrección de observadas). */
export const ESTADOS_PROYECTO_PERMITEN_ACTIVIDAD = [
  NOMBRE_ESTADO_PROYECTO_VIGENTE,
] as const;

export const MENSAJE_PROYECTO_NO_PERMITE_ACTIVIDAD =
  'No se pueden registrar actividades en este proyecto. Solo los proyectos en estado Vigente permiten nuevas actividades.';
