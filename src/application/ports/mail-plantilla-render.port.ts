import type { RenderedMail } from './mail-renderer.interface';

/** Contrato de aplicación; la implementación y su configuración pertenecen a infraestructura. */
export interface MailPlantillaRenderInput {
  asuntoPlantilla: string;
  cuerpoMjml?: string | null;
  cuerpoHtml?: string | null;
  claveLayout?: string;
  variables?: Record<string, unknown>;
}

export interface MailPlantillaRenderedResult extends RenderedMail {
  mjmlWarnings: string[];
}

export abstract class MailPlantillaRenderPort {
  abstract render(
    input: MailPlantillaRenderInput,
  ): Promise<MailPlantillaRenderedResult>;
}
