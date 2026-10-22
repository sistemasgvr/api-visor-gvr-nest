import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerProyectosNewDto {
  static readonly schema: z.ZodType<ObtenerProyectosNewDto> =
    defineZodDto<ObtenerProyectosNewDto>('ObtenerProyectosNewDto', {});

  // Cualquier filtro opcional se pasa como query params
  [key: string]: any;
}
