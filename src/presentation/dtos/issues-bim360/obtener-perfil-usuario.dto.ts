import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';
export class ObtenerPerfilUsuarioDto {
  static readonly schema: z.ZodType<ObtenerPerfilUsuarioDto> =
    defineZodDto<ObtenerPerfilUsuarioDto>(
      'issues-bim360_ObtenerPerfilUsuarioDto',
      {},
    );
}
