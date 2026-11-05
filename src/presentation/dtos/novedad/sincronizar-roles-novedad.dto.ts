import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class SincronizarRolesNovedadDto {
  static readonly schema: z.ZodType<SincronizarRolesNovedadDto> =
    defineZodDto<SincronizarRolesNovedadDto>('SincronizarRolesNovedadDto', {
      roles: { schema: z.array(z.number().int()) },
    });

  roles: number[];
}
