import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class CreateNovedadTarjetaDto {
  static readonly schema: z.ZodType<CreateNovedadTarjetaDto> =
    defineZodDto<CreateNovedadTarjetaDto>('CreateNovedadTarjetaDto', {
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
        when: (o) => !o.sinMultimedia,
      },
      sinMultimedia: {
        schema: z.boolean(),
        optional: true,
        transforms: [({ value }) => value === true || value === 'true'],
      },
      idArchivo: { schema: z.number().int(), optional: true, coerce: 'number' },
      urlMultimedia: { schema: z.string().max(2000), optional: true },
    });

  titulo: string;

  descripcion?: string;

  orden?: number;

  tipoMultimedia?: string;

  sinMultimedia?: boolean;

  idArchivo?: number;

  /** Solo para video embebido externo (YouTube, etc.) cuando no se sube archivo. */

  urlMultimedia?: string;
}
