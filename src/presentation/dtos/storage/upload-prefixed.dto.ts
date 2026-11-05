import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

/** Prefijo lógico (carpetas virtuales), sin barra inicial. Ej: `documentos/facturas`. */
export class UploadPrefixedDto {
  static readonly schema: z.ZodType<UploadPrefixedDto> =
    defineZodDto<UploadPrefixedDto>('UploadPrefixedDto', {
      prefix: { schema: z.string().min(1).max(500) },
      filename: { schema: z.string().max(255), optional: true },
    });

  prefix: string;

  filename?: string;
}
