import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class ActividadEvidenciaInDto {
  @IsString()
  @MaxLength(2000)
  url: string = '';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  nombreOriginal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  tipoMime?: string;

  @IsOptional()
  @Type(() => Number)
  @ValidateIf((o) => o.tamanoBytes != null)
  @IsNumber()
  @Min(0)
  @Max(56 * 1024 * 1024 * 1024)
  tamanoBytes?: number;
}

export class AgregarEvidenciasActividadDto {
  /** Nuevo: metadatos por URL (nombre, mime, tamaño en genArchivo). */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ActividadEvidenciaInDto)
  evidencias?: ActividadEvidenciaInDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  /** Compat: solo URL (sin metadatos). */
  urls?: string[];
}
