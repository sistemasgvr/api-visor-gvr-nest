import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateNovedadTarjetaDto {
  @IsNotEmpty({ message: 'El título de la tarjeta es requerido' })
  @IsString()
  @MaxLength(255)
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orden?: number;

  @IsOptional()
  @IsString()
  @IsIn(['imagen', 'video'], {
    message: 'tipoMultimedia debe ser imagen o video',
  })
  tipoMultimedia?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idArchivo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  urlMultimedia?: string;

  /** Quita archivo y URL (tarjeta solo texto). */
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  limpiarMultimedia?: boolean;

  /** Alias aceptado desde el front (misma acción que limpiarMultimedia). */
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  sinMultimedia?: boolean;
}
