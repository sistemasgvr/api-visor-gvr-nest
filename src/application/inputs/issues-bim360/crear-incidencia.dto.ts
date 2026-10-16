export class CrearIncidenciaDto {
  title: string;

  description?: string;

  status?: string;

  issueSubtypeId?: string;

  dueDate?: string;

  assignedTo?: string;

  assignedToType?: string;

  rootCauseId?: string;

  startDate?: string;

  locationId?: string;

  locationDetails?: string;

  linkedDocuments?: any[];
}
