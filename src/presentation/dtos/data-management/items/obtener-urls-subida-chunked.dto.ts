import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerUrlsSubidaChunkedDto {
  static readonly schema: z.ZodType<ObtenerUrlsSubidaChunkedDto> =
    defineZodDto<ObtenerUrlsSubidaChunkedDto>('ObtenerUrlsSubidaChunkedDto', {
      bucketKey: { schema: z.string().min(1) },
      objectKey: { schema: z.string().min(1) },
      uploadKey: { schema: z.string().min(1) },
      firstPart: { schema: z.number().int().min(1) },
      parts: { schema: z.number().int().min(1), optional: true },
    });

  bucketKey: string;

  objectKey: string;

  uploadKey: string;

  firstPart: number;

  parts?: number;
}
