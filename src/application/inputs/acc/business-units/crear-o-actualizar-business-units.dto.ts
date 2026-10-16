class BusinessUnitDto {
  id?: string;

  parent_id?: string;

  name: string;

  description?: string;
}

export class CrearOActualizarBusinessUnitsDto {
  business_units: BusinessUnitDto[];

  region?: string;
}
