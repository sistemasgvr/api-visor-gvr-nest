import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class AsignarAccesoProyectoDto {
  static readonly schema: z.ZodType<AsignarAccesoProyectoDto> =
    defineZodDto<AsignarAccesoProyectoDto>('AsignarAccesoProyectoDto', {
      idUsuario: { schema: z.number().int() },
      idNivelAcceso: { schema: z.number().int(), optional: true },
    });

  idUsuario: number;

  idNivelAcceso?: number;
}
