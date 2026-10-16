import type { OutboundMailJobPayload } from '../../../domain/mail/outbound-mail.types';
import type { EnqueueOutboundEmailDto } from '../../inputs/mail/enqueue-outbound-email.dto';
import { EnqueueOutboundEmailUseCase } from './enqueue-outbound-email.use-case';

/**
 * Fachada única para el resto de módulos: no enviar correos desde controladores;
 * inyectar MailService (o EnqueueOutboundEmailUseCase) desde casos de uso.
 */

export class MailService {
  constructor(
    private readonly enqueueOutboundEmailUseCase: EnqueueOutboundEmailUseCase,
  ) {}

  async enqueue(dto: EnqueueOutboundEmailDto): Promise<{ jobId?: string }> {
    return this.enqueueOutboundEmailUseCase.execute(dto);
  }

  async enqueuePayload(
    payload: OutboundMailJobPayload,
  ): Promise<{ jobId?: string }> {
    return this.enqueueOutboundEmailUseCase.executePayload(payload);
  }
}
