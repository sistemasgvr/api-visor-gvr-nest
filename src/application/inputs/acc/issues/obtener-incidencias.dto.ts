export class ObtenerIncidenciasDto {
  filter_status?: string;

  filter_assignedTo?: string;

  filter_issueTypeId?: string;

  filter_rootCauseId?: string;

  filter_locationId?: string;

  filter_linkedDocumentUrn?: string;

  limit?: number;

  offset?: number;

  sort?: string;
}
