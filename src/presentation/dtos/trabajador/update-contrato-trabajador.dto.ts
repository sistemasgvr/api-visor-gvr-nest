import { z } from 'zod';
import { defineZodDto, isoDate } from '../../validation/zod-dto';

export class UpdateContratoTrabajadorDto {
  static readonly schema: z.ZodType<UpdateContratoTrabajadorDto> =
    defineZodDto<UpdateContratoTrabajadorDto>('UpdateContratoTrabajadorDto', {
      idTipoContrato: {
        schema: z.number().int(),
        optional: true,
        coerce: 'number',
      },
      idDuracionContrato: {
        schema: z.number().int(),
        optional: true,
        coerce: 'number',
      },
      fechaInicio: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
        transforms: [({ value }) => (value === '' ? undefined : value)],
      },
      fechaFin: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
        transforms: [({ value }) => (value === '' ? undefined : value)],
      },
      remuneracion: { schema: z.number(), optional: true },
      fechaInicioLabores: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
        transforms: [({ value }) => (value === '' ? undefined : value)],
      },
      idPuestoTrabajo: {
        schema: z.number().int(),
        optional: true,
        coerce: 'number',
      },
    });

  idTipoContrato?: number;

  idDuracionContrato?: number;

  fechaInicio?: string;

  fechaFin?: string;

  remuneracion?: number;

  fechaInicioLabores?: string;

  idPuestoTrabajo?: number;
}
