import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import {
  MAIL_JOB_PUBLISHER,
  MAIL_QUEUE_NAME,
} from '../../domain/services/mail-job-publisher.interface';
import { MAIL_RENDERER } from '../../domain/services/mail-renderer.interface';
import { MAIL_TRANSPORT } from '../../domain/services/mail-transport.interface';
import { EMAIL_DISPATCH_LOG_REPOSITORY } from '../../domain/repositories/email-dispatch-log.repository.interface';
import { HandlebarsMailRendererService } from '../../infrastructure/mail/handlebars-mail-renderer.service';
import { NodemailerMailTransportService } from '../../infrastructure/mail/nodemailer-mail-transport.service';
import { EmailDispatchLogRepository } from '../../infrastructure/repositories/email-dispatch-log.repository';
import { SendOutboundEmailUseCase } from '../../application/use-cases/mail/send-outbound-email.use-case';
import { EnqueueOutboundEmailUseCase } from '../../application/use-cases/mail/enqueue-outbound-email.use-case';
import { EnviarCorreoBienvenidaUseCase } from '../../application/use-cases/mail/enviar-correo-bienvenida.use-case';
import { MailService } from '../../application/services/mail.service';
import { InlineMailJobPublisher } from '../../infrastructure/mail/inline-mail-job-publisher.service';
import { BullMailJobPublisher } from '../../infrastructure/mail/bull-mail-job-publisher.service';
import { MailQueueProcessor } from '../../infrastructure/mail/mail-queue.processor';
import { MailPlantillaCorreoRepository } from '../../infrastructure/repositories/mail-plantilla-correo.repository';
import { MAIL_PLANTILLA_CORREO_REPOSITORY } from '../../domain/repositories/mail-plantilla-correo.repository.interface';
import { MjmlCompilerService } from '../../infrastructure/mail/mjml-compiler.service';
import { MailPlantillaRenderService } from '../../infrastructure/mail/mail-plantilla-render.service';

function isMailQueueEnabled(): boolean {
  return (
    process.env.MAIL_USE_QUEUE === 'true' &&
    !!(process.env.REDIS_HOST ?? '').trim()
  );
}

@Module({})
export class MailModule {
  static register(): DynamicModule {
    const useQueue = isMailQueueEnabled();

    const imports: Array<Type | DynamicModule> = [ConfigModule, DatabaseModule];

    if (useQueue) {
      imports.push(
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (config: ConfigService) => ({
            connection: {
              host: config.get<string>('REDIS_HOST'),
              port: Number(config.get('REDIS_PORT')) || 6379,
              password: config.get<string>('REDIS_PASSWORD') || undefined,
              maxRetriesPerRequest: null,
            },
          }),
          inject: [ConfigService],
        }),
        BullModule.registerQueue({
          name: MAIL_QUEUE_NAME,
        }),
      );
    }

    const publisherImpl = useQueue
      ? BullMailJobPublisher
      : InlineMailJobPublisher;

    const providers: Provider[] = [
      EmailDispatchLogRepository,
      {
        provide: EMAIL_DISPATCH_LOG_REPOSITORY,
        useExisting: EmailDispatchLogRepository,
      },
      MailPlantillaCorreoRepository,
      {
        provide: MAIL_PLANTILLA_CORREO_REPOSITORY,
        useExisting: MailPlantillaCorreoRepository,
      },
      MjmlCompilerService,
      MailPlantillaRenderService,
      HandlebarsMailRendererService,
      { provide: MAIL_RENDERER, useExisting: HandlebarsMailRendererService },
      NodemailerMailTransportService,
      { provide: MAIL_TRANSPORT, useExisting: NodemailerMailTransportService },
      SendOutboundEmailUseCase,
      publisherImpl,
      { provide: MAIL_JOB_PUBLISHER, useExisting: publisherImpl },
      EnqueueOutboundEmailUseCase,
      EnviarCorreoBienvenidaUseCase,
      MailService,
    ];

    if (useQueue) {
      providers.push(MailQueueProcessor);
    }

    return {
      module: MailModule,
      global: true,
      imports,
      providers,
      exports: [
        MailService,
        EnviarCorreoBienvenidaUseCase,
        EnqueueOutboundEmailUseCase,
        MAIL_JOB_PUBLISHER,
        MAIL_PLANTILLA_CORREO_REPOSITORY,
        MjmlCompilerService,
        MailPlantillaRenderService,
        MAIL_TRANSPORT,
        EMAIL_DISPATCH_LOG_REPOSITORY,
      ],
    };
  }
}
