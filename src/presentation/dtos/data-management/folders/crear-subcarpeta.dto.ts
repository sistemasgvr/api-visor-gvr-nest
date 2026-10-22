import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CrearSubcarpetaDto {
  static readonly schema: z.ZodType<CrearSubcarpetaDto> =
    defineZodDto<CrearSubcarpetaDto>('CrearSubcarpetaDto', {
      folderName: { schema: z.string().min(1) },
      folderType: { schema: z.string(), optional: true },
    });

  folderName: string;

  folderType?: string;
}
