import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';
// DTO sin validación estricta para query params dinámicos
export class ObtenerItemPorIdDto {
  static readonly schema: z.ZodType<ObtenerItemPorIdDto> =
    defineZodDto<ObtenerItemPorIdDto>('ObtenerItemPorIdDto', {});

  [key: string]: any;
}
