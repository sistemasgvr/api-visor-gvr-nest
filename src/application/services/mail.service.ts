import { Injectable } from '@nestjs/common';
import { EnqueueOutboundEmailUseCase } from '../use-cases/mail/enqueue-outbound-email.use-case';
import type { EnqueueOutboundEmailDto } from '../dtos/mail/enqueue-outbound-email.dto';
import type { OutboundMailJobPayload } from '../../domain/mail/outbound-mail.types';

/**
 * Fachada única para el resto de módulos: no enviar correos desde controladores;
 * inyectar MailService (o EnqueueOutboundEmailUseCase) desde casos de uso.
 */
@Injectable()
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
