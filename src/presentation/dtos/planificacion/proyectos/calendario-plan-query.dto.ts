import { z } from 'zod';
import { defineZodDto, isoDate } from '../../../validation/zod-dto';
const fechaCivil = z
  .string()
  .regex(/^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
  .refine((value) => isoDate(value, true), {
    message: 'Debe ser una fecha válida YYYY-MM-DD',
  })
  .meta({ format: 'date' });
export class CalendarioPlanQueryDto {
  static readonly schema: z.ZodType<CalendarioPlanQueryDto> =
    defineZodDto<CalendarioPlanQueryDto>('CalendarioPlanQueryDto', {
      desde: { schema: fechaCivil, example: '2026-10-01' },
      hasta: {
        schema: fechaCivil,
        example: '2026-10-31',
        description: 'Fin inclusivo; máximo 366 días.',
        checks: [
          {
            validate: (value, object) => {
              const dias =
                (Date.parse(String(value) + 'T00:00:00Z') -
                  Date.parse(String(object.desde) + 'T00:00:00Z')) /
                86400000;
              return Number.isFinite(dias) && dias >= 0 && dias <= 365;
            },
            message:
              'El rango debe ser ordenado y de hasta 366 días inclusivos',
          },
        ],
      },
    });
  desde!: string;
  hasta!: string;
}
