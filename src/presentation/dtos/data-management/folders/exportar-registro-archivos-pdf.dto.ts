import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ExportarRegistroArchivosPdfDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  titulo: string;

  /** true = carpeta actual y subcarpetas; false = solo carpeta actual */
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  incluirSubcarpetas: boolean;

  /** Incluir columna de atributos personalizados (extension.data) */
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  incluirAtributosPersonalizados: boolean;

  /** Hub ACC (mismo id de ruta) para resolver el nombre del proyecto al exportar */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  hubId?: string;
}
