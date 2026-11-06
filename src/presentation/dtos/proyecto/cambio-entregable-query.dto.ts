import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class CambioEntregableQueryDto {
  static readonly schema: z.ZodType<CambioEntregableQueryDto> =
    defineZodDto<CambioEntregableQueryDto>('CambioEntregableQueryDto', {
      revisionPlan: {
        schema: z.number().int().min(1),
        when: (_o, v) => v !== undefined,
        coerce: 'number',
      },
      motivo: {
        schema: z.string().max(1000),
        when: (_o, v) => v !== undefined,
        transforms: [
          ({ value }: { value: unknown }) =>
            typeof value === 'string' ? value.trim() : value,
        ],
      },
    });

  revisionPlan?: number;

  motivo?: string;
}
