export interface MailTemplateVariableSchemaItem {
  name: string;
  label?: string;
  required?: boolean;
  example?: string;
}

export interface MailPlantillaCorreoListItem {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string | null;
  asuntoPlantilla: string;
  claveLayout: string;
  esSistema: boolean;
  numeroVersion: number;
  estado: number;
  tieneMjml: boolean;
  tieneHtml: boolean;
  tieneDesignJson: boolean;
  cantidadVariables: number;
  fechaCreacion: Date | string;
  fechaModificacion: Date | string;
  idUsuarioCreacion: number | null;
  nombreUsuarioCreacion: string | null;
  idUsuarioModificacion: number | null;
  nombreUsuarioModificacion: string | null;
}

export interface MailPlantillaCorreoDetalle extends MailPlantillaCorreoListItem {
  cuerpoMjml: string | null;
  cuerpoHtml: string | null;
  designJson: Record<string, unknown> | null;
  esquemaVariables: MailTemplateVariableSchemaItem[];
  variablesPrueba: Record<string, unknown>;
}

export interface MailPlantillaCorreoHistorialItem {
  id: number;
  idPlantillaCorreo: number;
  numeroVersion: number;
  asuntoPlantilla: string;
  tieneMjml: boolean;
  tieneHtml: boolean;
  cantidadVariables: number;
  claveLayout: string;
  idUsuarioModificacion: number | null;
  nombreUsuarioModificacion: string | null;
  fechaCreacion: Date | string;
}

export interface MailPlantillaCorreoHistorialDetalle
  extends MailPlantillaCorreoHistorialItem {
  cuerpoMjml: string | null;
  cuerpoHtml: string | null;
  designJson: Record<string, unknown> | null;
  esquemaVariables: MailTemplateVariableSchemaItem[];
  variablesPrueba: Record<string, unknown>;
}

export interface MailPlantillaCorreoSlugRow {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string | null;
  asuntoPlantilla: string;
  cuerpoMjml: string | null;
  cuerpoHtml: string | null;
  designJson: Record<string, unknown> | null;
  esquemaVariables: MailTemplateVariableSchemaItem[];
  variablesPrueba: Record<string, unknown>;
  claveLayout: string;
  esSistema: boolean;
  numeroVersion: number;
  estado: number;
  fechaModificacion: Date | string;
}
