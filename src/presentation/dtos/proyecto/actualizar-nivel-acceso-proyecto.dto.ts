import { IsInt } from 'class-validator';

export class ActualizarNivelAccesoProyectoDto {
  @IsInt()
  idNivelAcceso: number;
}
