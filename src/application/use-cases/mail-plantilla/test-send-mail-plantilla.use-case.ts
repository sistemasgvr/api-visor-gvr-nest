import type { IEmailDispatchLogRepository } from '../../../domain/repositories/email-dispatch-log.repository.interface';
import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import type { IMailTransport } from '../../ports/mail-transport.interface';
import { InvalidInputError } from '../../errors/application.error';
import { resolveMailHtmlInlineDataUris } from '../../helpers/mail-inline-data-uri.resolver';
import { TestSendMailPlantillaDto } from '../../inputs/mail-plantilla/preview-mail-plantilla.dto';
import { MailPlantillaRenderPort } from '../../ports/mail-plantilla-render.port';
import {
  ApplicationLogger,
  ConfigurationPort,
  LoggerFactoryPort,
} from '../../ports/runtime.port';
import { resolveMailPlantillaPreviewInput } from './mail-plantilla-preview.helper';

export class TestSendMailPlantillaUseCase {
  private readonly logger: ApplicationLogger;

  constructor(
    private readonly repository: IMailPlantillaCorreoRepository,
    private readonly renderService: MailPlantillaRenderPort,

    private readonly mailTransport: IMailTransport,

    private readonly dispatchLogRepository: IEmailDispatchLogRepository,
    private readonly configService: ConfigurationPort,
    private readonly loggerFactory: LoggerFactoryPort,
  ) {
    this.logger = this.loggerFactory.create(TestSendMailPlantillaUseCase.name);
  }

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
      throw new InvalidInputError(
        'El envío de correo está deshabilitado (MAIL_ENABLED=false)',
      );
    }

    try {
      const { html, attachments } = resolveMailHtmlInlineDataUris(
        rendered.html,
      );

      await this.mailTransport.send({
        to: [{ email, name: dto.nombreDestinatario?.trim() }],
        subject: rendered.subject,
        html,
        attachments: attachments.length ? attachments : undefined,
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
