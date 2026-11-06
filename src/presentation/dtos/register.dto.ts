import { z } from 'zod';
import { defineZodDto } from '../validation/zod-dto';

export class RegisterDto {
  static readonly schema: z.ZodType<RegisterDto> = defineZodDto<RegisterDto>(
    'RegisterDto',
    {
      nombre: { schema: z.string().max(255) },
      correo: { schema: z.string().email().max(255) },
      contrasena: { schema: z.string().min(6) },
      estado: {
        schema: z
          .number()
          .int()
          .refine((value) => ([0, 1] as readonly unknown[]).includes(value), {
            message: 'Seleccione una opción válida',
          })
          .meta({ enum: [0, 1] }),
        optional: true,
      },
      id: { schema: z.number().int(), optional: true },
    },
  );

  nombre: string;

  correo: string;

  contrasena: string;

  estado?: number;

  id?: number | null;
}
