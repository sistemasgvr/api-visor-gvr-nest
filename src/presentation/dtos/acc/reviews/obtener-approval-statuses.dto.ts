import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerApprovalStatusesDto {
  static readonly schema: z.ZodType<ObtenerApprovalStatusesDto> =
    defineZodDto<ObtenerApprovalStatusesDto>('ObtenerApprovalStatusesDto', {
      limit: {
        schema: z.number().int().min(1).max(50),
        optional: true,
        coerce: 'number',
      },
      offset: {
        schema: z.number().int().min(0),
        optional: true,
        coerce: 'number',
      },
    });

  limit?: number;

  offset?: number;
}
