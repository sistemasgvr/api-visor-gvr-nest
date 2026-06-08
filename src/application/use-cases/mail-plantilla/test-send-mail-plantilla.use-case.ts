import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { MAIL_PLANTILLA_CORREO_REPOSITORY } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import type { IMailTransport } from '../../../domain/services/mail-transport.interface';
import { MAIL_TRANSPORT } from '../../../domain/services/mail-transport.interface';
import type { IEmailDispatchLogRepository } from '../../../domain/repositories/email-dispatch-log.repository.interface';
import { EMAIL_DISPATCH_LOG_REPOSITORY } from '../../../domain/repositories/email-dispatch-log.repository.interface';
import { TestSendMailPlantillaDto } from '../../dtos/mail-plantilla/preview-mail-plantilla.dto';
import { MailPlantillaRenderService } from '../../../infrastructure/mail/mail-plantilla-render.service';
import { resolveMailPlantillaPreviewInput } from './mail-plantilla-preview.helper';

@Injectable()
export class TestSendMailPlantillaUseCase {
  private readonly logger = new Logger(TestSendMailPlantillaUseCase.name);

  constructor(
    @Inject(MAIL_PLANTILLA_CORREO_REPOSITORY)
    private readonly repository: IMailPlantillaCorreoRepository,
    private readonly renderService: MailPlantillaRenderService,
    @Inject(MAIL_TRANSPORT)
    private readonly mailTransport: IMailTransport,
    @Inject(EMAIL_DISPATCH_LOG_REPOSITORY)
    private readonly dispatchLogRepository: IEmailDispatchLogRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: TestSendMailPlantillaDto) {
    const input = await resolveMailPlantillaPreviewInput(dto, this.repository);
    const rendered = await this.renderService.render(input);
    const email = dto.email.trim();

    const mailEnabled =
      this.configService.get<string>('MAIL_ENABLED') !== 'false';

    if (!mailEnabled) {
      this.logger.warn(
        `MAIL_ENABLED=false — omitiendo envío de prueba template=${input.templateId} to=${email}`,
      );
      await this.dispatchLogRepository.record({
        templateId: input.templateId,
        recipientEmails: [email],
        status: 'skipped',
        errorMessage: 'MAIL_DISABLED',
        correlationId: `mail-plantilla-test:${input.templateId}`,
      });
      throw new BadRequestException(
        'El envío de correo está deshabilitado (MAIL_ENABLED=false)',
      );
    }

    try {
      await this.mailTransport.send({
        to: [{ email, name: dto.nombreDestinatario?.trim() }],
        subject: rendered.subject,
        html: rendered.html,
      });

      await this.dispatchLogRepository.record({
        templateId: input.templateId,
        recipientEmails: [email],
        status: 'sent',
        correlationId: `mail-plantilla-test:${input.templateId}`,
      });

      return {
        message: 'Correo de prueba enviado',
        templateId: input.templateId,
        email,
        subject: rendered.subject,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.dispatchLogRepository.record({
        templateId: input.templateId,
        recipientEmails: [email],
        status: 'failed',
        errorMessage: message.slice(0, 2000),
        correlationId: `mail-plantilla-test:${input.templateId}`,
      });
      throw err;
    }
  }
}
