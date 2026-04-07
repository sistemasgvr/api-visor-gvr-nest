import {
    Injectable,
    Inject,
    Logger,
    BadRequestException,
    HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OutboundMailJobPayload } from '../../../domain/mail/outbound-mail.types';
import type { IMailRenderer } from '../../../domain/services/mail-renderer.interface';
import { MAIL_RENDERER } from '../../../domain/services/mail-renderer.interface';
import type { IMailTransport } from '../../../domain/services/mail-transport.interface';
import { MAIL_TRANSPORT } from '../../../domain/services/mail-transport.interface';
import type { IEmailDispatchLogRepository } from '../../../domain/repositories/email-dispatch-log.repository.interface';
import { EMAIL_DISPATCH_LOG_REPOSITORY } from '../../../domain/repositories/email-dispatch-log.repository.interface';
import { MailSendFailedException } from '../../../shared/exceptions/mail.exceptions';

export interface SendOutboundEmailInput extends OutboundMailJobPayload {
    /** Id de job BullMQ cuando el envío proviene de la cola */
    jobId?: string;
}

@Injectable()
export class SendOutboundEmailUseCase {
    private readonly logger = new Logger(SendOutboundEmailUseCase.name);

    private resolveErrorMessage(err: unknown): string {
        if (err instanceof HttpException) {
            const body = err.getResponse();
            if (typeof body === 'string') {
                return body;
            }
            if (body && typeof body === 'object' && 'message' in body) {
                const m = (body as { message?: unknown }).message;
                if (Array.isArray(m)) {
                    return m.map(String).join(', ');
                }
                if (typeof m === 'string') {
                    return m;
                }
            }
        }
        if (err instanceof Error) {
            return err.message;
        }
        return String(err);
    }

    constructor(
        @Inject(MAIL_RENDERER)
        private readonly mailRenderer: IMailRenderer,
        @Inject(MAIL_TRANSPORT)
        private readonly mailTransport: IMailTransport,
        @Inject(EMAIL_DISPATCH_LOG_REPOSITORY)
        private readonly dispatchLogRepository: IEmailDispatchLogRepository,
        private readonly configService: ConfigService,
    ) { }

    async execute(input: SendOutboundEmailInput): Promise<void> {
        const mailEnabled = this.configService.get<string>('MAIL_ENABLED') !== 'false';
        const to = (input.to ?? []).map((r) => ({
            email: (r.email ?? '').trim(),
            name: r.name?.trim(),
        }));
        const invalid = to.filter((r) => !r.email);
        if (invalid.length) {
            throw new BadRequestException('Destinatarios inválidos');
        }
        if (to.length === 0) {
            throw new BadRequestException('Se requiere al menos un destinatario');
        }

        const recipientEmails = to.map((r) => r.email);

        if (!mailEnabled) {
            this.logger.warn(
                `MAIL_ENABLED=false — omitiendo envío template=${input.templateId} to=${recipientEmails.join(',')}`,
            );
            await this.dispatchLogRepository.record({
                templateId: input.templateId,
                recipientEmails,
                status: 'skipped',
                errorMessage: 'MAIL_DISABLED',
                jobId: input.jobId ?? null,
                correlationId: input.correlationId ?? null,
            });
            return;
        }

        try {
            const rendered = await this.mailRenderer.render(
                input.templateId,
                input.variables ?? {},
                input.subjectOverride,
            );

            await this.mailTransport.send({
                to,
                cc: input.cc,
                bcc: input.bcc,
                subject: rendered.subject,
                html: rendered.html,
                text: rendered.text,
            });

            this.logger.log(
                `Correo enviado template=${input.templateId} to=${recipientEmails.join(',')} jobId=${input.jobId ?? 'inline'}`,
            );

            await this.dispatchLogRepository.record({
                templateId: input.templateId,
                recipientEmails,
                status: 'sent',
                jobId: input.jobId ?? null,
                correlationId: input.correlationId ?? null,
            });
        } catch (err) {
            const message = this.resolveErrorMessage(err);
            this.logger.error(
                `Fallo envío correo template=${input.templateId} to=${recipientEmails.join(',')}: ${message}`,
                err instanceof Error ? err.stack : undefined,
            );
            await this.dispatchLogRepository.record({
                templateId: input.templateId,
                recipientEmails,
                status: 'failed',
                errorMessage: message.slice(0, 2000),
                jobId: input.jobId ?? null,
                correlationId: input.correlationId ?? null,
            });
            if (err instanceof HttpException) {
                throw err;
            }
            const safe =
                message.length > 0 && message.length < 400
                    ? message
                    : 'Error inesperado al procesar el envío de correo.';
            throw new MailSendFailedException(safe);
        }
    }
}
