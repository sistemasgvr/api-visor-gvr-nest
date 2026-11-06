import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class AddComentarioArchivoDto {
  static readonly schema: z.ZodType<AddComentarioArchivoDto> =
    defineZodDto<AddComentarioArchivoDto>('AddComentarioArchivoDto', {
      contenido: { schema: z.string().min(1) },
    });

  contenido!: string;
}
