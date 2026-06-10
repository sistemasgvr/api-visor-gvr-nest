export type MailEnvioCoberturaEstado =
  | 'sent'
  | 'failed'
  | 'skipped'
  | 'no_enviado'
  | 'no_aplica';

export interface MailEnvioCoberturaItem {
  idTrabajador: number;
  nombreCompleto: string;
  correo: string | null;
  estadoEnvio: MailEnvioCoberturaEstado;
  fechaUltimoEnvio: string | null;
  errorMensaje: string | null;
  idLog: string | null;
}

export interface MailEnvioCoberturaResumen {
  total: number;
  enviados: number;
  fallidos: number;
  omitidos: number;
  noEnviados: number;
  noAplica: number;
}

export interface MailEnvioLogItem {
  id: string;
  templateId: string;
  recipients: string[];
  status: string;
  errorMessage: string | null;
  jobId: string | null;
  correlationId: string | null;
  createdAt: string;
}

export interface MailEnvioPagination {
  total: number;
  limit: number;
  offset: number;
  total_pages: number;
  current_page: number;
}
