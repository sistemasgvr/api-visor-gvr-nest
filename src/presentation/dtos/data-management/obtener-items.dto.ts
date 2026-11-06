import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ObtenerItemsDto {
  static readonly schema: z.ZodType<ObtenerItemsDto> =
    defineZodDto<ObtenerItemsDto>('ObtenerItemsDto', {
      folder_id: { schema: z.string(), optional: true },
    });

  folder_id?: string;
}
