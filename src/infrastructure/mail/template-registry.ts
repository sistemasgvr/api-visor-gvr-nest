/**
 * Registro de plantillas: archivo .hbs bajo templates/ y asunto por defecto (Handlebars).
 * Para nuevos templates, añadir aquí (o más adelante desde BD/config vía front).
 */
export interface MailTemplateDefinition {
  /** Nombre del archivo en templates/, ej. welcome.hbs */
  file: string;
  /** Asunto por defecto; puede usar {{variables}} */
  defaultSubject: string;
}

export const MAIL_TEMPLATE_REGISTRY: Record<string, MailTemplateDefinition> = {
  welcome: {
    file: 'welcome.hbs',
    defaultSubject: 'Bienvenido a {{appName}}',
  },
  'reset-password': {
    file: 'reset-password.hbs',
    defaultSubject: 'Recuperación de contraseña',
  },
  notification: {
    file: 'notification.hbs',
    defaultSubject: '{{title}}',
  },
  'internal-alert': {
    file: 'internal-alert.hbs',
    defaultSubject: '[Alerta interna] {{title}}',
  },
  'revision-reviewer-notify': {
    file: 'revision-reviewer-notify.hbs',
    defaultSubject: '[{{appName}}] {{actionHeading}} — {{reviewLabel}}',
  },
  'user-invitation': {
    file: 'notification.hbs',
    defaultSubject: 'Te invitaron a {{appName}}',
  },
  'password-changed': {
    file: 'notification.hbs',
    defaultSubject: 'Tu contraseña fue actualizada',
  },
  'account-locked': {
    file: 'internal-alert.hbs',
    defaultSubject: 'Tu cuenta fue bloqueada temporalmente',
  },
  'task-assigned': {
    file: 'notification.hbs',
    defaultSubject: '[{{appName}}] Nueva tarea: {{taskTitle}}',
  },
  'digest-summary': {
    file: 'notification.hbs',
    defaultSubject: '[{{appName}}] Resumen diario',
  },
};
