import { MailTemplateVariableDto } from './mail-template-variable.dto';

export class CreateMailPlantillaDto {
  slug!: string;

  nombre!: string;

  asuntoPlantilla!: string;

  descripcion?: string;

  cuerpoMjml?: string;

  cuerpoHtml?: string;

  designJson?: Record<string, unknown>;

  esquemaVariables?: MailTemplateVariableDto[];

  variablesPrueba?: Record<string, unknown>;

  claveLayout?: string;

  esSistema?: boolean;
}
