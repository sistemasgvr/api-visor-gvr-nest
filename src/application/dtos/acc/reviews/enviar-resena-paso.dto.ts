import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DocStatusDto {
  @IsInt()
  idArchivo!: number;

  @IsString()
  estado!: string;
}

export class EnviarResenaPasoDto {
  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocStatusDto)
  docStatuses?: DocStatusDto[];
}
