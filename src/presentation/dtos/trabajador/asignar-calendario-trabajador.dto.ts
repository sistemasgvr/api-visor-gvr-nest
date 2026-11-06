import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';
export class AsignarCalendarioTrabajadorDto {
  static readonly schema: z.ZodType<AsignarCalendarioTrabajadorDto> =
    defineZodDto<AsignarCalendarioTrabajadorDto>(
      'AsignarCalendarioTrabajadorDto',
      {
        idCalendario: { schema: z.number().int().min(1).max(2147483647) },
        idCalendarioAnterior: {
          schema: z.number().int().min(1).max(2147483647).nullable(),
        },
      },
    );
  idCalendario!: number;
  idCalendarioAnterior!: number | null;
}
