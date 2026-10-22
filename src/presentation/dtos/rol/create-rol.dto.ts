import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class CreateRolDto {
  static readonly schema: z.ZodType<CreateRolDto> = defineZodDto<CreateRolDto>(
    'CreateRolDto',
    {
      nombre: { schema: z.string().min(1).max(255) },
      descripcion: { schema: z.string().max(255), optional: true },
    },
  );

  nombre: string;

  descripcion?: string;
}
