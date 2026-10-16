export class ListMailEnvioCoberturaQueryDto {
  templateId!: string;

  busqueda?: string;

  estadoEnvio?: string;

  limit?: number = 20;

  offset?: number = 0;
}

export class ListMailEnvioLogsQueryDto {
  templateId?: string;

  busqueda?: string;

  status?: string;

  limit?: number = 20;

  offset?: number = 0;
}
