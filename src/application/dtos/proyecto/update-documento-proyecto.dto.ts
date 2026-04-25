import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDocumentoProyectoDto {
  @IsInt()
  idTipoDocumento: number;

  @IsString()
  @MaxLength(255)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  linkDocumento?: string;
}
