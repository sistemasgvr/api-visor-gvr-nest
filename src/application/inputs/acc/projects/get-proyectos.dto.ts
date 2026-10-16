export class GetProyectosDto {
  fields?: string;

  filter_classification?: string;

  filter_platform?: string;

  filter_products?: string[];

  filter_name?: string;

  filter_type?: string;

  filter_status?: string;

  filter_businessUnitId?: string;

  filter_jobNumber?: string;

  filter_updatedAt?: string;

  filterTextMatch?: string;

  sort?: string;

  limit?: number = 20;

  offset?: number = 0;

  token?: string;
}
