export type EmailDispatchStatus = 'sent' | 'failed' | 'skipped';

export interface EmailDispatchLogEntry {
  templateId: string;
  recipientEmails: string[];
  status: EmailDispatchStatus;
  errorMessage?: string | null;
  jobId?: string | null;
  correlationId?: string | null;
}

export interface IEmailDispatchLogRepository {
  record(entry: EmailDispatchLogEntry): Promise<void>;
}

export const EMAIL_DISPATCH_LOG_REPOSITORY = 'EMAIL_DISPATCH_LOG_REPOSITORY';
