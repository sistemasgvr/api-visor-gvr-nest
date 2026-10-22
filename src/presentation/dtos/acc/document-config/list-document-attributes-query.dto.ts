import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ListDocumentAttributesQueryDto {
  static readonly schema: z.ZodType<ListDocumentAttributesQueryDto> =
    defineZodDto<ListDocumentAttributesQueryDto>(
      'ListDocumentAttributesQueryDto',
      {
        busqueda: { schema: z.string(), optional: true },
        limit: {
          schema: z.number().int().min(1).max(500),
          optional: true,
          coerce: 'number',
        },
        offset: {
          schema: z.number().int().min(0),
          optional: true,
          coerce: 'number',
        },
      },
    );

  busqueda?: string;

  limit?: number;

  offset?: number;
}
