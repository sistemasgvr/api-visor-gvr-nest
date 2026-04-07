import type { OutboundMailJobPayload } from '../mail/outbound-mail.types';

export interface IMailJobPublisher {
    /**
     * Encola el envío o lo procesa en línea según configuración.
     * @returns id del job BullMQ si aplica, o un identificador sintético / vacío si es inline.
     */
    enqueue(payload: OutboundMailJobPayload): Promise<string | undefined>;
}

export const MAIL_JOB_PUBLISHER = 'MAIL_JOB_PUBLISHER';

export const MAIL_QUEUE_NAME = 'mail';
