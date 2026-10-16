export class EmailRecipientDto {
  email: string;

  name?: string;
}

export class EnqueueOutboundEmailDto {
  templateId: string;

  to: EmailRecipientDto[];

  cc?: EmailRecipientDto[];

  bcc?: EmailRecipientDto[];

  variables: Record<string, unknown>;

  subjectOverride?: string;

  correlationId?: string;
}
