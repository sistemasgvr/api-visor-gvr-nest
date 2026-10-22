import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerPerfilUsuarioDto {
  static readonly schema: z.ZodType<ObtenerPerfilUsuarioDto> =
    defineZodDto<ObtenerPerfilUsuarioDto>(
      'acc_issues_ObtenerPerfilUsuarioDto',
      { projectId: { schema: z.string() } },
    );

  projectId: string;
}
