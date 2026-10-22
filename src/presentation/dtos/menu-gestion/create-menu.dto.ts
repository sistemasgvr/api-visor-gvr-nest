import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class CreateMenuDto {
  static readonly schema: z.ZodType<CreateMenuDto> =
    defineZodDto<CreateMenuDto>('CreateMenuDto', {
      nombre: { schema: z.string().min(1).max(100) },
      url: { schema: z.string().max(255), optional: true },
      icono: { schema: z.string().max(50), optional: true },
      idPadre: { schema: z.number().int(), optional: true },
      orden: { schema: z.number().int(), optional: true },
    });

  nombre: string;

  url?: string;

  icono?: string;

  idPadre?: number;

  orden?: number;
}
