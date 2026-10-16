import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateNovedadLanzamientoDto {
  @IsNotEmpty({ message: 'El título es requerido' })
  @IsString()
  @MaxLength(255)
  titulo: string;

  @IsOptional()
  @IsDateString()
  fechaPublicacion?: string;

  @IsOptional()
  @IsDateString()
  fechaVigenciaHasta?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  textoBotonCerrar?: string;
}
