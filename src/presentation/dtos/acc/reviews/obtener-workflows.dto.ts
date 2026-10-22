import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerWorkflowsDto {
  static readonly schema: z.ZodType<ObtenerWorkflowsDto> =
    defineZodDto<ObtenerWorkflowsDto>('ObtenerWorkflowsDto', {
      limit: {
        schema: z.number().int().min(1).max(200),
        optional: true,
        coerce: 'number',
      },
      offset: {
        schema: z.number().int().min(0),
        optional: true,
        coerce: 'number',
      },
      sort: { schema: z.string(), optional: true },
      filter_status: { schema: z.string(), optional: true },
      filter_name: { schema: z.string(), optional: true },
    });

  limit?: number;

  offset?: number;

  sort?: string;

  filter_status?: string;

  filter_name?: string;
}
