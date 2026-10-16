export class CrearProyectoBim360Dto {
  name: string;

  start_date: string;

  end_date: string;

  project_type: string;

  value: number;

  currency: string;

  job_number?: string;

  address_line_1?: string;

  city?: string;

  state_or_province?: string;

  postal_code?: string;

  country?: string;

  timezone?: string;

  language?: string;

  construction_type?: string;

  contract_type?: string;

  template_project_id?: string;

  include_locations?: boolean;

  include_companies?: boolean;

  region?: string;
}
