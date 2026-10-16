import { IsInt, IsOptional } from 'class-validator';

export class AsignarAccesoProyectoDto {
  @IsInt()
  idUsuario: number;

  @IsOptional()
  @IsInt()
  idNivelAcceso?: number;
}
