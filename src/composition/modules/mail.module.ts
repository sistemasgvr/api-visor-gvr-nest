import { BullModule } from '@nestjs/bullmq';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from '../../application/use-cases/mail/mail.service';
import { EnqueueOutboundEmailUseCase } from '../../application/use-cases/mail/enqueue-outbound-email.use-case';
import { EnviarCorreoBienvenidaUseCase } from '../../application/use-cases/mail/enviar-correo-bienvenida.use-case';
import { SendOutboundEmailUseCase } from '../../application/use-cases/mail/send-outbound-email.use-case';
import { EMAIL_DISPATCH_LOG_REPOSITORY } from '../../domain/repositories/email-dispatch-log.repository.interface';
import { MAIL_PLANTILLA_CORREO_REPOSITORY } from '../../domain/repositories/mail-plantilla-correo.repository.interface';
import {
  MAIL_JOB_PUBLISHER,
  MAIL_QUEUE_NAME,
} from '../../application/ports/mail-job-publisher.interface';
import { MAIL_RENDERER } from '../../application/ports/mail-renderer.interface';
import { MAIL_TRANSPORT } from '../../application/ports/mail-transport.interface';
import { BullMailJobPublisher } from '../../infrastructure/mail/bull-mail-job-publisher.service';
import { HandlebarsMailRendererService } from '../../infrastructure/mail/handlebars-mail-renderer.service';
import { InlineMailJobPublisher } from '../../infrastructure/mail/inline-mail-job-publisher.service';
import { MailPlantillaRenderService } from '../../infrastructure/mail/mail-plantilla-render.service';
import { MailQueueProcessor } from '../../infrastructure/mail/mail-queue.processor';
import { MjmlCompilerService } from '../../infrastructure/mail/mjml-compiler.service';
import { NodemailerMailTransportService } from '../../infrastructure/mail/nodemailer-mail-transport.service';
import { EmailDispatchLogRepository } from '../../infrastructure/repositories/email-dispatch-log.repository';
import { MailPlantillaCorreoRepository } from '../../infrastructure/repositories/mail-plantilla-correo.repository';
import { applicationProvider } from '../application.providers';
import { DatabaseModule } from './platform/database.module';

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
      applicationProvider(SendOutboundEmailUseCase),
      publisherImpl,
      { provide: MAIL_JOB_PUBLISHER, useExisting: publisherImpl },
      applicationProvider(EnqueueOutboundEmailUseCase),
      applicationProvider(EnviarCorreoBienvenidaUseCase),
      applicationProvider(MailService),
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
