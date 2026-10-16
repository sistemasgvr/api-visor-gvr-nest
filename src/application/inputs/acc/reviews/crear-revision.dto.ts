export class CrearRevisionDto {
  name: string;

  /** ID interno GVR del flujo (numérico en string). */

  workflowId: string;

  description?: string;

  linkedDocuments?: Array<{
    versionUrn?: string;
    urn?: string;
    itemUrn?: string;
    itemId?: string;
  }>;
}
