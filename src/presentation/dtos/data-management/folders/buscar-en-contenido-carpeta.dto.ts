import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class BuscarEnContenidoCarpetaDto {
  static readonly schema: z.ZodType<BuscarEnContenidoCarpetaDto> =
    defineZodDto<BuscarEnContenidoCarpetaDto>('BuscarEnContenidoCarpetaDto', {
      searchName: { schema: z.string(), optional: true },
      filterType: { schema: z.string(), optional: true },
      extensionType: { schema: z.string(), optional: true },
      additionalFilters: {
        schema: z.record(z.string(), z.unknown()),
        optional: true,
      },
    });

  searchName?: string;

  filterType?: string;

  extensionType?: string;

  additionalFilters?: Record<string, any>;
}
