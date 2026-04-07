import type { EmailTemplateId } from './email-template-id';

export interface EmailRecipient {
    email: string;
    name?: string;
}

/**
 * Carga útil para un envío (uno o muchos destinatarios, plantilla y variables).
 * `templateId` puede ser un id conocido o uno futuro gestionado desde el front
 * siempre que exista el .hbs y la entrada en el registro de plantillas.
 */
export interface OutboundMailJobPayload {
    templateId: EmailTemplateId | string;
    to: EmailRecipient[];
    cc?: EmailRecipient[];
    bcc?: EmailRecipient[];
    /** Variables para Handlebars (name, link, code, appName, etc.) */
    variables: Record<string, unknown>;
    /** Si se informa, sustituye el asunto por defecto del template (también puede ser plantilla Handlebars). */
    subjectOverride?: string;
    correlationId?: string;
}
