export class PreviewMailPlantillaDto {
  id?: number;

  slug?: string;

  asuntoPlantilla?: string;

  cuerpoMjml?: string;

  cuerpoHtml?: string;

  claveLayout?: string;

  variables?: Record<string, unknown>;
}

export class TestSendMailPlantillaDto extends PreviewMailPlantillaDto {
  email!: string;

  nombreDestinatario?: string;
}
