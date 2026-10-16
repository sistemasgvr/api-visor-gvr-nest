class ProjectValueDto {
  value?: number;

  currency?: string;
}

export class ClonarProyectoDto {
  name: string;

  templateId: string;

  type?: string;

  classification?: string;

  startDate?: string;

  endDate?: string;

  jobNumber?: string;

  addressLine1?: string;

  addressLine2?: string;

  city?: string;

  stateOrProvince?: string;

  postalCode?: string;

  country?: string;

  latitude?: string;

  longitude?: string;

  timezone?: string;

  constructionType?: string;

  deliveryMethod?: string;

  contractType?: string;

  currentPhase?: string;

  businessUnitId?: string;

  projectValue?: ProjectValueDto;

  token?: string;
}
