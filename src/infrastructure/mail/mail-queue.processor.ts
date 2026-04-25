import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { MAIL_QUEUE_NAME } from '../../domain/services/mail-job-publisher.interface';
import type { OutboundMailJobPayload } from '../../domain/mail/outbound-mail.types';
import { SendOutboundEmailUseCase } from '../../application/use-cases/mail/send-outbound-email.use-case';

@Processor(MAIL_QUEUE_NAME, { concurrency: 3 })
export class MailQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(MailQueueProcessor.name);

  constructor(
    private readonly sendOutboundEmailUseCase: SendOutboundEmailUseCase,
  ) {
    super();
  }

  async process(job: Job<OutboundMailJobPayload>): Promise<void> {
    const jobId = job.id != null ? String(job.id) : undefined;
    this.logger.log(
      `Procesando job mail id=${jobId} template=${job.data.templateId}`,
    );
    await this.sendOutboundEmailUseCase.execute({
      ...job.data,
      jobId,
    });
  }
}
