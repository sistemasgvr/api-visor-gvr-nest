import { MailTemplateVariableDto } from './mail-template-variable.dto';

export class UpdateMailPlantillaDto {
  nombre?: string;

  descripcion?: string;

  asuntoPlantilla?: string;

  cuerpoMjml?: string;

  cuerpoHtml?: string;

  designJson?: Record<string, unknown> | null;

  esquemaVariables?: MailTemplateVariableDto[];

  variablesPrueba?: Record<string, unknown>;

  claveLayout?: string;

  estado?: number;
}
