export class ListarUsuariosDisponiblesRecursoDto {
  busqueda?: string = '';

  /** Listados masivos (p. ej. agregar usuarios a recurso sin paginar en cliente). */

  limit?: number = 100;

  offset?: number = 0;
}
