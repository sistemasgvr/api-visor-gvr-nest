import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class EmailRecipientDto {
  static readonly schema: z.ZodType<EmailRecipientDto> =
    defineZodDto<EmailRecipientDto>('EmailRecipientDto', {
      email: { schema: z.string().email() },
      name: { schema: z.string(), optional: true },
    });

  email: string;

  name?: string;
}

export class EnqueueOutboundEmailDto {
  static readonly schema: z.ZodType<EnqueueOutboundEmailDto> =
    defineZodDto<EnqueueOutboundEmailDto>('EnqueueOutboundEmailDto', {
      templateId: { schema: z.string().min(1) },
      to: { schema: z.array(z.lazy(() => EmailRecipientDto.schema)).min(1) },
      cc: {
        schema: z.array(z.lazy(() => EmailRecipientDto.schema)),
        optional: true,
      },
      bcc: {
        schema: z.array(z.lazy(() => EmailRecipientDto.schema)),
        optional: true,
      },
      variables: { schema: z.record(z.string(), z.unknown()) },
      subjectOverride: { schema: z.string(), optional: true },
      correlationId: { schema: z.string(), optional: true },
    });

  templateId: string;

  to: EmailRecipientDto[];

  cc?: EmailRecipientDto[];

  bcc?: EmailRecipientDto[];

  variables: Record<string, unknown>;

  subjectOverride?: string;

  correlationId?: string;
}
