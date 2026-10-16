import {
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
  IsNotEmpty,
  IsEmail,
  ValidateIf,
} from 'class-validator';

export class UpdateEmpresaDto {
  @IsNotEmpty({ message: 'La razón social es requerida' })
  @IsString()
  @MaxLength(255)
  razonSocial: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nombreComercial?: string;

  @IsNotEmpty({ message: 'El tipo de documento es requerido' })
  @IsInt()
  idTipoDocumento: number;

  @IsNotEmpty({ message: 'El número de documento es requerido' })
  @IsString()
  @MaxLength(50)
  nroDocumento: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  celularEmpresa?: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null && String(v).trim() !== '')
  @IsEmail({}, { message: 'Correo de empresa inválido' })
  @MaxLength(255)
  correoEmpresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  urlLogo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccion?: string;

  @IsOptional()
  @IsInt()
  idDepartamento?: number;

  @IsOptional()
  @IsInt()
  idProvincia?: number;

  @IsOptional()
  @IsInt()
  idDistrito?: number;
}
