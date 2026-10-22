import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class CreateDocumentoProyectoDto {
  static readonly schema: z.ZodType<CreateDocumentoProyectoDto> =
    defineZodDto<CreateDocumentoProyectoDto>('CreateDocumentoProyectoDto', {
      idTipoDocumento: { schema: z.number().int() },
      nombre: { schema: z.string().max(255) },
      linkDocumento: { schema: z.string().max(1000), optional: true },
    });

  idTipoDocumento: number;

  nombre: string;

  linkDocumento?: string;
}
