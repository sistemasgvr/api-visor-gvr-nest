import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearVisorMarcaRevisionDto {
  @IsString()
  @IsNotEmpty()
  documentUrn: string;

  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tipoMarca: string;

  @IsObject()
  markupPayload: Record<string, unknown>;

  @IsOptional()
  @IsString()
  versionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  nombreDocumento?: string;

  @IsOptional()
  @IsString()
  viewableGuid?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  viewableName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  paginaNumero?: number;

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
  @IsInt()
  @Min(1)
  idRevisionArchivo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  markupIdAps?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  layerName?: string;

  @IsOptional()
  @IsObject()
  estilos?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  boundingBox?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  miniaturaSvg?: string;
}

export class ActualizarVisorMarcaRevisionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titulo?: string;

  @IsOptional()
  @IsObject()
  markupPayload?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  markupIdAps?: string;

  @IsOptional()
  @IsObject()
  estilos?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  boundingBox?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  miniaturaSvg?: string;

  @IsOptional()
  @IsObject()
  viewerState?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  viewableGuid?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  viewableName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  paginaNumero?: number;
}

export class DuplicarVisorMarcaRevisionDto {
  @IsOptional()
  @IsObject()
  desplazamiento?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  titulo?: string;
}

export class SincronizarMarkupIdApsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  markupIdAps: string;
}
