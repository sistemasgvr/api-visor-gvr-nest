export class ListarAuditoriasDto {
  idusuario?: number;

  accion?: string;

  entidad?: string;

  fecha_desde?: string;

  fecha_hasta?: string;

  limit?: number;

  offset?: number;
}
