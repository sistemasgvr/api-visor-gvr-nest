import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';
// DTO sin validación estricta para query params dinámicos
export class ObtenerRelacionesLinksItemDto {
  static readonly schema: z.ZodType<ObtenerRelacionesLinksItemDto> =
    defineZodDto<ObtenerRelacionesLinksItemDto>(
      'ObtenerRelacionesLinksItemDto',
      {},
    );

  [key: string]: any;
}
