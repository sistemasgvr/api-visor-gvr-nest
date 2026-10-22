import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from '../../../domain/policies/password-policy';

export class ChangePasswordDto {
  static readonly schema: z.ZodType<ChangePasswordDto> =
    defineZodDto<ChangePasswordDto>('ChangePasswordDto', {
      contrasenaActual: { schema: z.string().min(6) },
      nuevaContrasena: { schema: z.string().regex(PASSWORD_POLICY_REGEX) },
    });

  contrasenaActual: string;

  nuevaContrasena: string;
}
