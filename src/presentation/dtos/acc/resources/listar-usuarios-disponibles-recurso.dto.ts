import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ListarUsuariosDisponiblesRecursoDto {
  static readonly schema: z.ZodType<ListarUsuariosDisponiblesRecursoDto> =
    defineZodDto<ListarUsuariosDisponiblesRecursoDto>(
      'ListarUsuariosDisponiblesRecursoDto',
      {
        busqueda: { schema: z.string(), optional: true, defaultValue: '' },
        limit: {
          schema: z.number().int().min(1).max(500_000),
          optional: true,
          coerce: 'number',
          defaultValue: 100,
        },
        offset: {
          schema: z.number().int().min(0),
          optional: true,
          coerce: 'number',
          defaultValue: 0,
        },
      },
    );

  busqueda?: string = '';

  /** Listados masivos (p. ej. agregar usuarios a recurso sin paginar en cliente). */

  limit?: number = 100;

  offset?: number = 0;
}
