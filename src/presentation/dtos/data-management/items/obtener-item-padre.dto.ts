import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';
// DTO sin validación estricta para query params dinámicos
export class ObtenerItemPadreDto {
  static readonly schema: z.ZodType<ObtenerItemPadreDto> =
    defineZodDto<ObtenerItemPadreDto>('ObtenerItemPadreDto', {});

  [key: string]: any;
}
