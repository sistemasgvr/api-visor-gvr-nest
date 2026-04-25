import type { EmailRecipient } from '../mail/outbound-mail.types';

export interface MailTransportMessage {
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
}

export interface IMailTransport {
  send(message: MailTransportMessage): Promise<void>;
}

export const MAIL_TRANSPORT = 'MAIL_TRANSPORT';
