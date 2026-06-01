import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNamingStandardFromTemplateDto {
  @IsString()
  @IsIn(['iso19650'])
  templateCode: 'iso19650';

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  separador?: string;
}
