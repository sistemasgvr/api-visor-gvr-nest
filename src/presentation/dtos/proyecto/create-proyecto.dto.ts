import { z } from 'zod';
import { defineZodDto, isoDate } from '../../validation/zod-dto';

export class CreateProyectoDto {
  static readonly schema: z.ZodType<CreateProyectoDto> =
    defineZodDto<CreateProyectoDto>('CreateProyectoDto', {
      nombreProyecto: { schema: z.string().min(1).max(255) },
      nroProyecto: { schema: z.string().min(1).max(100) },
      idTipoProyecto: {
        schema: z
          .number()
          .int()
          .refine(
            (value) =>
              value !== undefined &&
              value !== null &&
              (value as unknown) !== '',
            { message: 'El campo es obligatorio' },
          ),
      },
      idPais: {
        schema: z
          .number()
          .int()
          .refine(
            (value) =>
              value !== undefined &&
              value !== null &&
              (value as unknown) !== '',
            { message: 'El campo es obligatorio' },
          ),
      },
      direccion1: { schema: z.string().max(255), optional: true },
      direccion2: { schema: z.string().max(255), optional: true },
      ciudad: { schema: z.string().max(100), optional: true },
      provincia: { schema: z.string().max(100), optional: true },
      codigoPostal: { schema: z.string().max(20), optional: true },
      idZonaHoraria: { schema: z.number().int(), optional: true },
      fechaInicio: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
      },
      fechaFinalizacion: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
      },
      valorProyecto: { schema: z.number().min(0), optional: true },
      idTipoMoneda: { schema: z.number().int(), optional: true },
      diaValorizar: { schema: z.number().int().min(1).max(31), optional: true },
      idCliente: { schema: z.number().int(), optional: true },
      observaciones: { schema: z.string(), optional: true },
      idModalidad: { schema: z.number().int(), optional: true },
      idEstadoProyecto: { schema: z.number().int(), optional: true },
      idEstadoCotizacion: { schema: z.number().int(), optional: true },
      idCalendario: { schema: z.number().int().min(1), optional: true },
    });

  nombreProyecto: string;

  nroProyecto: string;

  idTipoProyecto: number;

  idPais: number;

  direccion1?: string;

  direccion2?: string;

  ciudad?: string;

  provincia?: string;

  codigoPostal?: string;

  idZonaHoraria?: number;

  fechaInicio?: string;

  fechaFinalizacion?: string;

  valorProyecto?: number;

  idTipoMoneda?: number;

  diaValorizar?: number;

  idCliente?: number;

  observaciones?: string;

  idModalidad?: number;

  idEstadoProyecto?: number;

  idEstadoCotizacion?: number;

  idCalendario?: number | null;
}
