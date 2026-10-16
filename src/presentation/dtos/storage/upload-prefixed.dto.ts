import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

/** Prefijo lógico (carpetas virtuales), sin barra inicial. Ej: `documentos/facturas`. */
export class UploadPrefixedDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  prefix: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  filename?: string;
}
