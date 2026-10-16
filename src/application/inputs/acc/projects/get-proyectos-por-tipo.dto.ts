export class GetProyectosPorTipoDto {
  tipos: string[];

  fields?: string;

  filter_status?: string;

  sort?: string;

  limit?: number = 20;

  offset?: number = 0;

  token?: string;
}
