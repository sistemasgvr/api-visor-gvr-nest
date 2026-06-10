import type { EmailRecipient } from '../mail/outbound-mail.types';

export interface MailTransportAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
  cid: string;
}

export interface MailTransportMessage {
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  attachments?: MailTransportAttachment[];
}

export interface IMailTransport {
  send(message: MailTransportMessage): Promise<void>;
}

export const MAIL_TRANSPORT = 'MAIL_TRANSPORT';
