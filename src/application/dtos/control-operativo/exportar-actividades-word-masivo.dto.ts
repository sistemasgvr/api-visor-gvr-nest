import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class ExportarActividadesWordMasivoDto {
  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsDateString()
  fechaEmision?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos un colaborador.' })
  @IsInt({ each: true })
  @Min(1, { each: true })
  idsTrabajador: number[];
}
