import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VisorElementoFotoArchivoDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  nombreOriginal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  tipoMime?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  tamanoBytes?: number;
}

export class CrearVisorElementoFotoDto {
  @IsString()
  @IsNotEmpty()
  documentUrn: string;

  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsOptional()
  @IsString()
  versionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  nombreDocumento?: string;

  @IsInt()
  @Min(1)
  objectId: number;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  nombreElemento?: string;

  @IsNumber()
  posicionX: number;

  @IsNumber()
  posicionY: number;

  @IsNumber()
  posicionZ: number;

  @IsOptional()
  @IsString()
  viewableGuid?: string;

  @IsOptional()
  @IsString()
  viewableName?: string;

  @IsOptional()
  @IsBoolean()
  is3D?: boolean;

  @IsOptional()
  @IsObject()
  viewerState?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(1)
  idProyectoGvr?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VisorElementoFotoArchivoDto)
  archivos: VisorElementoFotoArchivoDto[];
}

export class ActualizarVisorElementoFotoDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  posicionX?: number;

  @IsOptional()
  @IsNumber()
  posicionY?: number;

  @IsOptional()
  @IsNumber()
  posicionZ?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  nombreElemento?: string;
}

export class AgregarArchivosVisorElementoFotoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VisorElementoFotoArchivoDto)
  archivos: VisorElementoFotoArchivoDto[];
}
