import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ClonarMenuDto {
  static readonly schema: z.ZodType<ClonarMenuDto> =
    defineZodDto<ClonarMenuDto>('ClonarMenuDto', {
      nombre_nuevo: { schema: z.string().min(1).max(100) },
      id_padre_nuevo: { schema: z.number().int(), optional: true },
      clonar_roles: { schema: z.boolean(), optional: true },
    });

  nombre_nuevo: string;

  id_padre_nuevo?: number;

  clonar_roles?: boolean;
}
