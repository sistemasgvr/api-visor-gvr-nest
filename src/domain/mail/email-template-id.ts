/**
 * Identificadores de plantillas (convención tipo Blade: nombre kebab-case).
 * El front podrá mapear IDs gestionados a estos archivos .hbs.
 */
export const EMAIL_TEMPLATE_IDS = {
    WELCOME: 'welcome',
    RESET_PASSWORD: 'reset-password',
    NOTIFICATION: 'notification',
    INTERNAL_ALERT: 'internal-alert',
    REVISION_REVIEWER_NOTIFY: 'revision-reviewer-notify',
} as const;

export type EmailTemplateId =
    (typeof EMAIL_TEMPLATE_IDS)[keyof typeof EMAIL_TEMPLATE_IDS];
