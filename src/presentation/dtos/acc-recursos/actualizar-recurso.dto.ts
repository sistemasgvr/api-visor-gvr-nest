import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ActualizarRecursoDto {
  static readonly schema: z.ZodType<ActualizarRecursoDto> =
    defineZodDto<ActualizarRecursoDto>('acc-recursos_ActualizarRecursoDto', {
      idusuario_asignado: { schema: z.number().int(), optional: true },
      estado: { schema: z.string().max(50), optional: true },
      metadatos: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  idusuario_asignado?: number;

  estado?: string;

  metadatos?: any;
}
