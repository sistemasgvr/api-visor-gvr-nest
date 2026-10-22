import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class GenerarNombreDocumentoDto {
  static readonly schema: z.ZodType<GenerarNombreDocumentoDto> =
    defineZodDto<GenerarNombreDocumentoDto>('GenerarNombreDocumentoDto', {
      folderExternalId: { schema: z.string().min(1) },
      valores: { schema: z.record(z.string(), z.unknown()) },
      extension: { schema: z.string(), optional: true },
    });

  folderExternalId: string;

  valores: Record<string, string>;

  extension?: string;
}
