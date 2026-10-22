import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ActualizarNivelAccesoProyectoDto {
  static readonly schema: z.ZodType<ActualizarNivelAccesoProyectoDto> =
    defineZodDto<ActualizarNivelAccesoProyectoDto>(
      'ActualizarNivelAccesoProyectoDto',
      { idNivelAcceso: { schema: z.number().int() } },
    );

  idNivelAcceso: number;
}
