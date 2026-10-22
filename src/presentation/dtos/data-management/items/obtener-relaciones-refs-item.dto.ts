import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';
// DTO sin validación estricta para query params dinámicos
export class ObtenerRelacionesRefsItemDto {
  static readonly schema: z.ZodType<ObtenerRelacionesRefsItemDto> =
    defineZodDto<ObtenerRelacionesRefsItemDto>(
      'ObtenerRelacionesRefsItemDto',
      {},
    );

  [key: string]: any;
}
