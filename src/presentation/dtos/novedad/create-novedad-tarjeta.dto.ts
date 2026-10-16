import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateNovedadTarjetaDto {
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

  @ValidateIf((o) => !o.sinMultimedia)
  @IsOptional()
  @IsString()
  @IsIn(['imagen', 'video'], {
    message: 'tipoMultimedia debe ser imagen o video',
  })
  tipoMultimedia?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  sinMultimedia?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idArchivo?: number;

  /** Solo para video embebido externo (YouTube, etc.) cuando no se sube archivo. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  urlMultimedia?: string;
}
