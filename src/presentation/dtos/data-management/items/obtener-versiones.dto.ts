import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';
// DTO sin validación estricta para query params dinámicos
export class ObtenerVersionesDto {
  static readonly schema: z.ZodType<ObtenerVersionesDto> =
    defineZodDto<ObtenerVersionesDto>('ObtenerVersionesDto', {});

  [key: string]: any;
}
