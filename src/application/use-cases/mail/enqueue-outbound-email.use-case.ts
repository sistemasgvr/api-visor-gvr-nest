import type { OutboundMailJobPayload } from '../../../domain/mail/outbound-mail.types';
import type { IMailJobPublisher } from '../../../domain/services/mail-job-publisher.interface';
import type { EnqueueOutboundEmailDto } from '../../inputs/mail/enqueue-outbound-email.dto';

export class EnqueueOutboundEmailUseCase {
  constructor(private readonly mailJobPublisher: IMailJobPublisher) {}

  async execute(dto: EnqueueOutboundEmailDto): Promise<{ jobId?: string }> {
    const payload: OutboundMailJobPayload = {
      templateId: dto.templateId,
      to: dto.to,
      cc: dto.cc,
      bcc: dto.bcc,
      variables: dto.variables ?? {},
      subjectOverride: dto.subjectOverride,
      correlationId: dto.correlationId,
    };
    const jobId = await this.mailJobPublisher.enqueue(payload);
    return { jobId: jobId ?? undefined };
  }

  /**
   * Para otros casos de uso que ya construyen el payload en dominio/aplicación.
   */
  async executePayload(
    payload: OutboundMailJobPayload,
  ): Promise<{ jobId?: string }> {
    const jobId = await this.mailJobPublisher.enqueue(payload);
    return { jobId: jobId ?? undefined };
  }
}
