import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { EmptyStringToUndefined } from '../common/empty-string-to-undefined.transform';

export class UpdateContratoTrabajadorDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  idTipoContrato?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  idDuracionContrato?: number;

  @EmptyStringToUndefined()
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @EmptyStringToUndefined()
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsNumber()
  remuneracion?: number;

  @EmptyStringToUndefined()
  @IsOptional()
  @IsDateString()
  fechaInicioLabores?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  idPuestoTrabajo?: number;
}
