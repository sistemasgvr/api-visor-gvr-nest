import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export enum TipoReporte {
  DETALLE_INCIDENCIA = 'issue_detail',
  RESUMEN_INCIDENCIAS = 'issue_summary',
  INCIDENCIAS_EN_PLANOS = 'issues_on_plans',
}

export enum FormatoExportacion {
  PDF = 'pdf',
  BCF = 'bcf',
}

export class ExportarIncidenciasDto {
  static readonly schema: z.ZodType<ExportarIncidenciasDto> =
    defineZodDto<ExportarIncidenciasDto>('ExportarIncidenciasDto', {
      issueId: { schema: z.string(), optional: true },
      tipoReporte: {
        schema: z
          .enum(TipoReporte)
          .refine(
            (value) =>
              value !== undefined &&
              value !== null &&
              (value as unknown) !== '',
            { message: 'El campo es obligatorio' },
          ),
      },
      formato: {
        schema: z
          .enum(FormatoExportacion)
          .refine(
            (value) =>
              value !== undefined &&
              value !== null &&
              (value as unknown) !== '',
            { message: 'El campo es obligatorio' },
          ),
      },
      titulo: { schema: z.string(), optional: true },
      guardarEnArchivos: {
        schema: z.boolean(),
        optional: true,
        transforms: [({ value }) => value === 'true' || value === true],
      },
      diseño: { schema: z.string(), optional: true },
      incluirCubierta: {
        schema: z.boolean(),
        optional: true,
        transforms: [({ value }) => value === 'true' || value === true],
      },
      incluirIndice: {
        schema: z.boolean(),
        optional: true,
        transforms: [({ value }) => value === 'true' || value === true],
      },
      incluirInformacionGeneralPlano: {
        schema: z.boolean(),
        optional: true,
        transforms: [({ value }) => value === 'true' || value === true],
      },
      incluirCamposPersonalizados: {
        schema: z.boolean(),
        optional: true,
        transforms: [({ value }) => value === 'true' || value === true],
      },
      incluirVinculosArchivo: {
        schema: z.boolean(),
        optional: true,
        transforms: [({ value }) => value === 'true' || value === true],
      },
      incluirFotos: {
        schema: z.boolean(),
        optional: true,
        transforms: [({ value }) => value === 'true' || value === true],
      },
      tamañoFotos: { schema: z.string(), optional: true },
      incluirOtrasReferencias: {
        schema: z.boolean(),
        optional: true,
        transforms: [({ value }) => value === 'true' || value === true],
      },
      incluirComentarios: {
        schema: z.boolean(),
        optional: true,
        transforms: [({ value }) => value === 'true' || value === true],
      },
      issueIds: { schema: z.array(z.unknown()), optional: true },
      filter_status: { schema: z.string(), optional: true },
      filter_linkedDocumentUrn: { schema: z.string(), optional: true },
      usuarioNombre: { schema: z.string(), optional: true },
      usuarioEmail: { schema: z.string(), optional: true },
    });

  issueId?: string; // Para detalle de incidencia

  tipoReporte: TipoReporte;

  formato: FormatoExportacion;

  titulo?: string;

  guardarEnArchivos?: boolean;

  diseño?: string;

  // Opciones para incluir en el reporte

  incluirCubierta?: boolean;

  incluirIndice?: boolean;

  incluirInformacionGeneralPlano?: boolean;

  incluirCamposPersonalizados?: boolean;

  incluirVinculosArchivo?: boolean;

  incluirFotos?: boolean;

  tamañoFotos?: string;

  incluirOtrasReferencias?: boolean;

  incluirComentarios?: boolean;

  // Para resumen o incidencias en planos

  issueIds?: string[];

  // Filtros para exportar múltiples incidencias

  filter_status?: string;

  filter_linkedDocumentUrn?: string;

  // Información del usuario de la sesión

  usuarioNombre?: string;

  usuarioEmail?: string;
}
