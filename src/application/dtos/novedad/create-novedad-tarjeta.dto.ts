import {
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
  @IsInt()
  orden?: number;

  @IsOptional()
  @IsString()
  @IsIn(['imagen', 'video'], {
    message: 'tipoMultimedia debe ser imagen o video',
  })
  tipoMultimedia?: string;

  @IsOptional()
  @IsInt()
  idArchivo?: number;

  @ValidateIf((o) => !o.idArchivo)
  @IsNotEmpty({ message: 'Debe indicar idArchivo o urlMultimedia' })
  @IsString()
  @MaxLength(2000)
  urlMultimedia?: string;
}
