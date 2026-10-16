export class GetProyectosActivosDto {
  fields?: string;

  filter_type?: string;

  filter_name?: string;

  sort?: string;

  limit?: number = 20;

  offset?: number = 0;

  token?: string;
}
