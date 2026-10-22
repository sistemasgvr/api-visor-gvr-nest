import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';
// DTO sin validación estricta para query params dinámicos
export class DescargarItemDto {
  static readonly schema: z.ZodType<DescargarItemDto> =
    defineZodDto<DescargarItemDto>('DescargarItemDto', {});

  [key: string]: any;
}
