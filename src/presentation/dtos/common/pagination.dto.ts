import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class PaginationDto {
  static readonly schema: z.ZodType<PaginationDto> =
    defineZodDto<PaginationDto>('PaginationDto', {
      page: {
        schema: z.number().int().min(1),
        optional: true,
        coerce: 'number',
        defaultValue: 1,
      },
      limit: {
        schema: z.number().int().min(1).max(100),
        optional: true,
        coerce: 'number',
        defaultValue: 10,
      },
    });

  page: number = 1;

  limit: number = 10;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get take(): number {
    return this.limit;
  }
}
