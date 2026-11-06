import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CompletarSubidaChunkedDto {
  static readonly schema: z.ZodType<CompletarSubidaChunkedDto> =
    defineZodDto<CompletarSubidaChunkedDto>('CompletarSubidaChunkedDto', {
      folderId: { schema: z.string().min(1) },
      fileName: { schema: z.string().min(1) },
      storageId: { schema: z.string().min(1) },
      bucketKey: { schema: z.string().min(1) },
      objectKey: { schema: z.string().min(1) },
      uploadKey: { schema: z.string().min(1) },
      fileSize: { schema: z.number().int().min(1) },
      eTags: { schema: z.array(z.unknown()).max(10000), optional: true },
    });

  folderId: string;

  fileName: string;

  storageId: string;

  bucketKey: string;

  objectKey: string;

  uploadKey: string;

  fileSize: number;

  eTags?: string[];
}
