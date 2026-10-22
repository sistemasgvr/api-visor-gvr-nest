import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class UpdatePermisoDto {
  static readonly schema: z.ZodType<UpdatePermisoDto> =
    defineZodDto<UpdatePermisoDto>('UpdatePermisoDto', {
      nombre: { schema: z.string().min(1).max(255) },
      descripcion: { schema: z.string().max(255), optional: true },
    });

  nombre: string;

  descripcion?: string;
}
