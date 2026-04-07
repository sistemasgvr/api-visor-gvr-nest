import { HttpException, HttpStatus } from '@nestjs/common';

/** SMTP no definido o incompleto cuando el envío está habilitado. */
export class MailNotConfiguredException extends HttpException {
    constructor(
        message: string = 'Servicio de correo no configurado. Revise MAIL_SMTP_* en el entorno.',
    ) {
        super({ message, code: 'MAIL_NOT_CONFIGURED' }, HttpStatus.SERVICE_UNAVAILABLE);
    }
}

/** Fallo al hablar con el servidor SMTP (red, auth, rechazo). */
export class MailSendFailedException extends HttpException {
    constructor(message: string, code: string = 'MAIL_SEND_FAILED') {
        super({ message, code }, HttpStatus.BAD_GATEWAY);
    }
}

/** Plantilla ausente en disco o error al renderizar. */
export class MailTemplateRenderException extends HttpException {
    constructor(message: string) {
        super({ message, code: 'MAIL_TEMPLATE_ERROR' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
