import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CrearAdjuntoDto {
  static readonly schema: z.ZodType<CrearAdjuntoDto> =
    defineZodDto<CrearAdjuntoDto>('acc_issues_CrearAdjuntoDto', {
      issueId: { schema: z.string() },
      urn: { schema: z.string(), optional: true },
      name: { schema: z.string(), optional: true },
      fileName: { schema: z.string(), optional: true },
      displayName: { schema: z.string(), optional: true },
      type: { schema: z.string(), optional: true },
      fileType: { schema: z.string(), optional: true },
    });

  issueId: string;

  urn?: string;

  name?: string;

  fileName?: string;

  displayName?: string;

  type?: string;

  fileType?: string;
}
