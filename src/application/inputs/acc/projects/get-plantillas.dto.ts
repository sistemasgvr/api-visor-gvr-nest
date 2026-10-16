export class GetPlantillasDto {
  fields?: string;

  filter_name?: string;

  filter_type?: string;

  sort?: string;

  limit?: number = 20;

  offset?: number = 0;

  token?: string;
}
