import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CrearRevisionDto {
  static readonly schema: z.ZodType<CrearRevisionDto> =
    defineZodDto<CrearRevisionDto>('CrearRevisionDto', {
      name: { schema: z.string().min(1) },
      workflowId: { schema: z.string().min(1) },
      description: { schema: z.string(), optional: true },
      linkedDocuments: { schema: z.array(z.unknown()), optional: true },
    });

  name: string;

  /** ID interno GVR del flujo (numérico en string). */

  workflowId: string;

  description?: string;

  linkedDocuments?: Array<{
    versionUrn?: string;
    urn?: string;
    itemUrn?: string;
    itemId?: string;
  }>;
}
