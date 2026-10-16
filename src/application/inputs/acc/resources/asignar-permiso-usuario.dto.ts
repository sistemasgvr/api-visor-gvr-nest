export class AsignarPermisoUsuarioDto {
  user_id: number;

  resource_id: number;

  permission_level_id?: number; // ID del nivel de permiso (default: 2 = "view_download")
}
