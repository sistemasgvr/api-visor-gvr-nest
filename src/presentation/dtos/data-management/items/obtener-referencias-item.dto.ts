import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';
// DTO sin validación estricta para query params dinámicos
export class ObtenerReferenciasItemDto {
  static readonly schema: z.ZodType<ObtenerReferenciasItemDto> =
    defineZodDto<ObtenerReferenciasItemDto>('ObtenerReferenciasItemDto', {});

  [key: string]: any;
}
