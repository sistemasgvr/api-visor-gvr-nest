import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class AgregarReferenciaRevisionDto {
  /** Tipo de objeto: INCIDENCIA, FOTO, ARCHIVO, RFI, SUBMITTAL, etc. */
  @IsString()
  @IsNotEmpty()
  tipoReferencia!: string;

  /** ID único del objeto en ACC (UUID issue) o GVR */
  @IsString()
  @IsNotEmpty()
  idReferenciaExterna!: string;

  /** Origen: ACC | GVR | EXTERNAL (default: ACC) */
  @IsOptional()
  @IsString()
  dominioReferencia?: string;

  /** Versión del objeto al crear el vínculo (ej: V1, V3) */
  @IsOptional()
  @IsString()
  versionReferencia?: string;

  /** Notas del usuario sobre por qué se vinculó */
  @IsOptional()
  @IsString()
  notasReferencia?: string;

  /** Deep-link directo al objeto referenciado */
  @IsOptional()
  @IsString()
  urlDeepLink?: string;

  /** Snapshot de datos del objeto para display sin re-fetch */
  @IsOptional()
  @IsObject()
  metadataJson?: Record<string, any>;
}
