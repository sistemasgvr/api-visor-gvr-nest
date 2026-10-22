import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class SubirArchivoDto {
  static readonly schema: z.ZodType<SubirArchivoDto> =
    defineZodDto<SubirArchivoDto>('SubirArchivoDto', {
      folderId: { schema: z.string().min(1) },
    });

  folderId: string;
}
