export class UpdateNovedadTarjetaDto {
  titulo: string;

  descripcion?: string;

  orden?: number;

  tipoMultimedia?: string;

  idArchivo?: number;

  urlMultimedia?: string;

  /** Quita archivo y URL (tarjeta solo texto). */

  limpiarMultimedia?: boolean;

  /** Alias aceptado desde el front (misma acción que limpiarMultimedia). */

  sinMultimedia?: boolean;
}
