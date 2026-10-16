import { IsInt, IsNotEmpty } from 'class-validator';

export class MarcarNovedadVistaDto {
  @IsNotEmpty({ message: 'El ID del lanzamiento es requerido' })
  @IsInt()
  idNovedadLanzamiento: number;
}
