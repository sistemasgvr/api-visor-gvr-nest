import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class DesplazarItemDto {
  static readonly schema: z.ZodType<DesplazarItemDto> =
    defineZodDto<DesplazarItemDto>('DesplazarItemDto', {
      targetFolderId: { schema: z.string().min(1) },
    });

  targetFolderId: string;
}
