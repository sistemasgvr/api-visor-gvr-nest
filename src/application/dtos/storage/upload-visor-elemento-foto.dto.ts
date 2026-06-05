import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class UploadVisorElementoFotoDto {
  @IsString()
  @IsOptional()
  idProyectoAcc?: string;

  @IsString()
  itemId: string;

  /** id del anclaje en BD, o objectId Forge si aún no existe anclaje */
  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  identificador: number;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  dia: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const n = parseInt(String(value), 10);
    return Number.isNaN(n) ? undefined : n;
  })
  @IsInt()
  @Min(1)
  indiceFoto?: number;
}
