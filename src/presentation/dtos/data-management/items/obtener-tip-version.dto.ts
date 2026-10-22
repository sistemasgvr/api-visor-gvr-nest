import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';
// DTO sin validación estricta para query params dinámicos
export class ObtenerTipVersionDto {
  static readonly schema: z.ZodType<ObtenerTipVersionDto> =
    defineZodDto<ObtenerTipVersionDto>('ObtenerTipVersionDto', {});

  [key: string]: any;
}
