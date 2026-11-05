import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class UpdateDocumentoProyectoDto {
  static readonly schema: z.ZodType<UpdateDocumentoProyectoDto> =
    defineZodDto<UpdateDocumentoProyectoDto>('UpdateDocumentoProyectoDto', {
      idTipoDocumento: { schema: z.number().int() },
      nombre: { schema: z.string().max(255) },
      linkDocumento: { schema: z.string().max(1000), optional: true },
    });

  idTipoDocumento: number;

  nombre: string;

  linkDocumento?: string;
}
