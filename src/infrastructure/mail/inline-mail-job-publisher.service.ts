import { Injectable } from '@nestjs/common';
import type { IMailJobPublisher } from '../../domain/services/mail-job-publisher.interface';
import type { OutboundMailJobPayload } from '../../domain/mail/outbound-mail.types';
import { SendOutboundEmailUseCase } from '../../application/use-cases/mail/send-outbound-email.use-case';

/**
 * Procesa el envío en el mismo proceso (sin Redis). Útil en desarrollo o cargas bajas.
 */
@Injectable()
export class InlineMailJobPublisher implements IMailJobPublisher {
    constructor(
        private readonly sendOutboundEmailUseCase: SendOutboundEmailUseCase,
    ) { }

    async enqueue(payload: OutboundMailJobPayload): Promise<string | undefined> {
        await this.sendOutboundEmailUseCase.execute({ ...payload });
        return undefined;
    }
}
