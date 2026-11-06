import { z } from 'zod';
import { defineZodDto } from '../validation/zod-dto';

export class LoginDto {
  static readonly schema: z.ZodType<LoginDto> = defineZodDto<LoginDto>(
    'LoginDto',
    {
      correo: { schema: z.string().email() },
      contrasena: { schema: z.string().min(6) },
    },
  );

  correo: string;

  contrasena: string;
}
