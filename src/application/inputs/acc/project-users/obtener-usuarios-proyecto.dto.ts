export class ObtenerUsuariosProyectoDto {
  filter?: Record<string, any>;

  sort?: string[];

  fields?: string[];

  orFilters?: string[];

  filterTextMatch?: string;

  limit?: number;

  offset?: number;

  region?: string;

  user_id?: string;
}
