import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class UpdateNovedadTarjetaDto {
  static readonly schema: z.ZodType<UpdateNovedadTarjetaDto> =
    defineZodDto<UpdateNovedadTarjetaDto>('UpdateNovedadTarjetaDto', {
      titulo: { schema: z.string().min(1).max(255) },
      descripcion: { schema: z.string(), optional: true },
      orden: { schema: z.number().int(), optional: true, coerce: 'number' },
      tipoMultimedia: {
        schema: z
          .string()
          .refine(
            (value) =>
              (['imagen', 'video'] as readonly unknown[]).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['imagen', 'video'] }),
        optional: true,
      },
      idArchivo: { schema: z.number().int(), optional: true, coerce: 'number' },
      urlMultimedia: { schema: z.string().max(2000), optional: true },
      limpiarMultimedia: {
        schema: z.boolean(),
        optional: true,
        transforms: [({ value }) => value === true || value === 'true'],
      },
      sinMultimedia: {
        schema: z.boolean(),
        optional: true,
        transforms: [({ value }) => value === true || value === 'true'],
      },
    });

  titulo: string;

  descripcion?: string;

  orden?: number;

  tipoMultimedia?: string;

  idArchivo?: number;

  urlMultimedia?: string;

  /** Quita archivo y URL (tarjeta solo texto). */

  limpiarMultimedia?: boolean;

  /** Alias aceptado desde el front (misma acción que limpiarMultimedia). */

  sinMultimedia?: boolean;
}
