import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import type { IMailJobPublisher } from '../../domain/services/mail-job-publisher.interface';
import { MAIL_QUEUE_NAME } from '../../domain/services/mail-job-publisher.interface';
import type { OutboundMailJobPayload } from '../../domain/mail/outbound-mail.types';

@Injectable()
export class BullMailJobPublisher implements IMailJobPublisher {
  constructor(
    @InjectQueue(MAIL_QUEUE_NAME)
    private readonly mailQueue: Queue,
  ) {}

  async enqueue(payload: OutboundMailJobPayload): Promise<string | undefined> {
    const job = await this.mailQueue.add('send', payload, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: { age: 86400, count: 1000 },
      removeOnFail: false,
    });
    return job.id != null ? String(job.id) : undefined;
  }
}
