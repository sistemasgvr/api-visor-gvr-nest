import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CopiarItemDto {
  static readonly schema: z.ZodType<CopiarItemDto> =
    defineZodDto<CopiarItemDto>('CopiarItemDto', {
      sourceItemId: { schema: z.string().min(1) },
      sourceVersionId: { schema: z.string().min(1) },
      targetFolderId: { schema: z.string().min(1) },
      fileName: { schema: z.string().min(1) },
    });

  sourceItemId: string;

  sourceVersionId: string;

  targetFolderId: string;

  fileName: string;
}
