export class CrearRecursoDto {
  external_id: string;

  resource_type: string;

  name: string;

  parent_id?: number;

  account_id?: string;
}
