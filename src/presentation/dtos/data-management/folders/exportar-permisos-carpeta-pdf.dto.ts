import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ExportarPermisosCarpetaPdfDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  titulo: string;

  /** current_tree = desde carpeta actual; all_project_folders = todo el árbol de archivos del proyecto */
  @IsIn(['current_tree', 'all_project_folders'])
  alcance: 'current_tree' | 'all_project_folders';

  /** Obligatorio si alcance = all_project_folders (mismo id de hub que en el front) */
  @IsOptional()
  @IsString()
  hubId?: string;
}
