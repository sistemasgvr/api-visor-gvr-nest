import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class GenerarNombreDocumentoDto {
  @IsString()
  @IsNotEmpty()
  folderExternalId: string;

  @IsObject()
  valores: Record<string, string>;

  @IsOptional()
  @IsString()
  extension?: string;
}
