import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from '../../../domain/policies/password-policy';

export class UpdateCredentialsDto {
  static readonly schema: z.ZodType<UpdateCredentialsDto> =
    defineZodDto<UpdateCredentialsDto>('UpdateCredentialsDto', {
      nuevoCorreo: { schema: z.string().email(), optional: true },
      nuevaContrasena: {
        schema: z.string().min(6).regex(PASSWORD_POLICY_REGEX),
        optional: true,
        when: (o) =>
          o.nuevaContrasena !== undefined &&
          o.nuevaContrasena !== null &&
          o.nuevaContrasena !== '',
      },
    });

  nuevoCorreo?: string;

  nuevaContrasena?: string;
}
