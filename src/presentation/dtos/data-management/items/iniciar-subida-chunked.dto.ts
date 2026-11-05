import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class IniciarSubidaChunkedDto {
  static readonly schema: z.ZodType<IniciarSubidaChunkedDto> =
    defineZodDto<IniciarSubidaChunkedDto>('IniciarSubidaChunkedDto', {
      folderId: { schema: z.string().min(1) },
      fileName: { schema: z.string().min(1) },
      fileSize: { schema: z.number().int().min(1) },
      partSizeBytes: {
        schema: z
          .number()
          .int()
          .min(1024 * 1024)
          .max(512 * 1024 * 1024),
        optional: true,
      },
    });

  folderId: string;

  fileName: string;

  fileSize: number;

  partSizeBytes?: number;
}
