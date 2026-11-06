import { z } from 'zod';
import { defineZodDto, isoDate } from '../../validation/zod-dto';

const fechaCivil = z
  .string()
  .regex(/^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
  .refine((value) => isoDate(value, true), {
    message: 'Debe ser una fecha válida YYYY-MM-DD',
  })
  .meta({ format: 'date' });

/**
 * Rango de fechas del selector de periodo del dashboard.
 *
 * Ambos campos son opcionales: si no llegan, cada función SQL aplica su periodo
 * por defecto (mes actual, o semana actual en los indicadores semanales).
 */
export class RangoFechasDashboardDto {
  static readonly schema: z.ZodType<RangoFechasDashboardDto> =
    defineZodDto<RangoFechasDashboardDto>('RangoFechasDashboardDto', {
      fechaInicio: {
        schema: fechaCivil,
        optional: true,
        description: 'Inicio del periodo (YYYY-MM-DD).',
      },
      fechaFin: {
        schema: fechaCivil,
        optional: true,
        description: 'Fin del periodo (YYYY-MM-DD), inclusivo.',
      },
    });

  fechaInicio?: string;

  fechaFin?: string;
}
