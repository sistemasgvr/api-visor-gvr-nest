import type {
  MailEnvioCoberturaItem,
  MailEnvioCoberturaResumen,
  MailEnvioLogItem,
  MailEnvioPagination,
} from '../entities/mail-envio.entity';

export type EmailDispatchStatus = 'sent' | 'failed' | 'skipped';

export interface EmailDispatchLogEntry {
  templateId: string;
  recipientEmails: string[];
  status: EmailDispatchStatus;
  errorMessage?: string | null;
  jobId?: string | null;
  correlationId?: string | null;
}

export interface ListarCoberturaEnviosParams {
  templateId: string;
  busqueda?: string;
  estadoEnvio?: string;
  limit?: number;
  offset?: number;
}

export interface ListarLogsEnvioParams {
  templateId?: string;
  busqueda?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface ListarCoberturaEnviosResponse {
  data: MailEnvioCoberturaItem[];
  resumen: MailEnvioCoberturaResumen;
  pagination: MailEnvioPagination;
}

export interface ListarLogsEnvioResponse {
  data: MailEnvioLogItem[];
  pagination: MailEnvioPagination;
}

export interface IEmailDispatchLogRepository {
  record(entry: EmailDispatchLogEntry): Promise<void>;
  listarCobertura(
    params: ListarCoberturaEnviosParams,
  ): Promise<ListarCoberturaEnviosResponse>;
  listarLogs(params: ListarLogsEnvioParams): Promise<ListarLogsEnvioResponse>;
}

export const EMAIL_DISPATCH_LOG_REPOSITORY = 'EMAIL_DISPATCH_LOG_REPOSITORY';
