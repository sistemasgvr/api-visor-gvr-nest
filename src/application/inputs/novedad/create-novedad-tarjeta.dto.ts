export class CreateNovedadTarjetaDto {
  titulo: string;

  descripcion?: string;

  orden?: number;

  tipoMultimedia?: string;

  sinMultimedia?: boolean;

  idArchivo?: number;

  /** Solo para video embebido externo (YouTube, etc.) cuando no se sube archivo. */

  urlMultimedia?: string;
}
