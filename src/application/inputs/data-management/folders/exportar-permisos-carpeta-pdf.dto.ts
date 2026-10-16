export class ExportarPermisosCarpetaPdfDto {
  titulo: string;

  /** current_tree = desde carpeta actual; all_project_folders = todo el árbol de archivos del proyecto */

  alcance: 'current_tree' | 'all_project_folders';

  /** Obligatorio si alcance = all_project_folders (mismo id de hub que en el front) */

  hubId?: string;
}
