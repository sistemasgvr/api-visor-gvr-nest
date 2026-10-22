import { z } from 'zod';
import { defineZodDto, isoDate } from '../../validation/zod-dto';

export class CreateTrabajadorDto {
  static readonly schema: z.ZodType<CreateTrabajadorDto> =
    defineZodDto<CreateTrabajadorDto>('CreateTrabajadorDto', {
      nombres: { schema: z.string().min(1).max(255) },
      apellidos: { schema: z.string().min(1).max(255) },
      idTipoDocumento: {
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
      nroDocumento: { schema: z.string().min(1).max(50) },
      correo: { schema: z.string().min(1).email().max(255) },
      idEmpresa: {
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
      idResponsable: { schema: z.number().int(), optional: true },
      idRol: { schema: z.number().int(), optional: true },
      fechaNacimiento: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
        transforms: [({ value }) => (value === '' ? undefined : value)],
      },
      celular: { schema: z.string().max(20), optional: true },
      telefonoEmergencia: { schema: z.string().max(20), optional: true },
      contactoEmergenciaNombre: { schema: z.string().max(255), optional: true },
      idContactoEmergenciaParentesco: {
        schema: z.number().int(),
        optional: true,
        coerce: 'number',
      },
      direccionDomiciliaria: { schema: z.string(), optional: true },
      observaciones: { schema: z.string(), optional: true },
      idPais: { schema: z.number().int(), optional: true },
      idDepartamento: { schema: z.number().int(), optional: true },
      idProvincia: { schema: z.number().int(), optional: true },
      idDistrito: { schema: z.number().int(), optional: true },
      nroRuc: { schema: z.string().max(11), optional: true },
      idGradoInstruccion: { schema: z.number().int(), optional: true },
      idCarrera: { schema: z.number().int(), optional: true },
      idEntidadBancaria: { schema: z.number().int(), optional: true },
      nroCuentaCorriente: { schema: z.string().max(50), optional: true },
      nroCci: { schema: z.string().max(50), optional: true },
      remuneracion: { schema: z.number(), optional: true },
      idTipoContrato: { schema: z.number().int(), optional: true },
      idDuracionContrato: { schema: z.number().int(), optional: true },
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
      fechaInicioContrato: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
        transforms: [({ value }) => (value === '' ? undefined : value)],
      },
      fechaFinContrato: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
        transforms: [({ value }) => (value === '' ? undefined : value)],
      },
      idModalidad: { schema: z.number().int(), optional: true },
      idCalendario: {
        schema: z.number().int().min(1),
        optional: true,
        coerce: 'number',
      },
      idPuestoTrabajo: { schema: z.number().int(), optional: true },
      adjuntos: { schema: z.array(z.unknown()), optional: true },
    });

  nombres: string;
  apellidos: string;
  idTipoDocumento: number;
  nroDocumento: string;
  correo: string;
  idEmpresa: number;

  idResponsable?: number;
  idRol?: number;

  fechaNacimiento?: string;
  celular?: string;
  telefonoEmergencia?: string;
  contactoEmergenciaNombre?: string;

  idContactoEmergenciaParentesco?: number;
  direccionDomiciliaria?: string;
  observaciones?: string;
  idPais?: number;
  idDepartamento?: number;
  idProvincia?: number;
  idDistrito?: number;
  nroRuc?: string;
  idGradoInstruccion?: number;
  idCarrera?: number;
  idEntidadBancaria?: number;
  nroCuentaCorriente?: string;
  nroCci?: string;
  remuneracion?: number;
  idTipoContrato?: number;
  idDuracionContrato?: number;

  fechaInicioLabores?: string;

  fechaInicioContrato?: string;

  fechaFinContrato?: string;
  idModalidad?: number;
  idCalendario?: number | null;
  idPuestoTrabajo?: number;
  adjuntos?: { idTipoAdjunto: number; ruta: string }[];
}
