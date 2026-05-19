import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateNovedadLanzamientoDto {
  @IsNotEmpty({ message: 'El código de versión es requerido' })
  @IsString()
  @MaxLength(50)
  codigoVersion: string;

  @IsNotEmpty({ message: 'El título es requerido' })
  @IsString()
  @MaxLength(255)
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

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
