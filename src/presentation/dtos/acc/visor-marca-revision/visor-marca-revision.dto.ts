import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CrearVisorMarcaRevisionDto {
  static readonly schema: z.ZodType<CrearVisorMarcaRevisionDto> =
    defineZodDto<CrearVisorMarcaRevisionDto>('CrearVisorMarcaRevisionDto', {
      documentUrn: { schema: z.string().min(1) },
      itemId: { schema: z.string().min(1) },
      tipoMarca: { schema: z.string().min(1).max(50) },
      markupPayload: { schema: z.record(z.string(), z.unknown()) },
      versionId: { schema: z.string(), optional: true },
      nombreDocumento: { schema: z.string().max(500), optional: true },
      viewableGuid: { schema: z.string(), optional: true },
      viewableName: { schema: z.string().max(500), optional: true },
      paginaNumero: { schema: z.number().int().min(1), optional: true },
      is3D: { schema: z.boolean(), optional: true },
      viewerState: {
        schema: z.record(z.string(), z.unknown()),
        optional: true,
      },
      idProyectoGvr: { schema: z.number().int().min(1), optional: true },
      idRevisionArchivo: { schema: z.number().int().min(1), optional: true },
      titulo: { schema: z.string().max(255), optional: true },
      markupIdAps: { schema: z.string().max(255), optional: true },
      layerName: { schema: z.string().max(255), optional: true },
      estilos: { schema: z.record(z.string(), z.unknown()), optional: true },
      boundingBox: {
        schema: z.record(z.string(), z.unknown()),
        optional: true,
      },
      miniaturaSvg: { schema: z.string(), optional: true },
    });

  documentUrn: string;

  itemId: string;

  tipoMarca: string;

  markupPayload: Record<string, unknown>;

  versionId?: string;

  nombreDocumento?: string;

  viewableGuid?: string;

  viewableName?: string;

  paginaNumero?: number;

  is3D?: boolean;

  viewerState?: Record<string, unknown>;

  idProyectoGvr?: number;

  idRevisionArchivo?: number;

  titulo?: string;

  markupIdAps?: string;

  layerName?: string;

  estilos?: Record<string, unknown>;

  boundingBox?: Record<string, unknown>;

  miniaturaSvg?: string;
}

export class ActualizarVisorMarcaRevisionDto {
  static readonly schema: z.ZodType<ActualizarVisorMarcaRevisionDto> =
    defineZodDto<ActualizarVisorMarcaRevisionDto>(
      'ActualizarVisorMarcaRevisionDto',
      {
        titulo: { schema: z.string().max(255), optional: true },
        markupPayload: {
          schema: z.record(z.string(), z.unknown()),
          optional: true,
        },
        markupIdAps: { schema: z.string().max(255), optional: true },
        estilos: { schema: z.record(z.string(), z.unknown()), optional: true },
        boundingBox: {
          schema: z.record(z.string(), z.unknown()),
          optional: true,
        },
        miniaturaSvg: { schema: z.string(), optional: true },
        viewerState: {
          schema: z.record(z.string(), z.unknown()),
          optional: true,
        },
        viewableGuid: { schema: z.string(), optional: true },
        viewableName: { schema: z.string().max(500), optional: true },
        paginaNumero: { schema: z.number().int().min(1), optional: true },
      },
    );

  titulo?: string;

  markupPayload?: Record<string, unknown>;

  markupIdAps?: string;

  estilos?: Record<string, unknown>;

  boundingBox?: Record<string, unknown>;

  miniaturaSvg?: string;

  viewerState?: Record<string, unknown>;

  viewableGuid?: string;

  viewableName?: string;

  paginaNumero?: number;
}

export class DuplicarVisorMarcaRevisionDto {
  static readonly schema: z.ZodType<DuplicarVisorMarcaRevisionDto> =
    defineZodDto<DuplicarVisorMarcaRevisionDto>(
      'DuplicarVisorMarcaRevisionDto',
      {
        desplazamiento: {
          schema: z.record(z.string(), z.unknown()),
          optional: true,
        },
        titulo: { schema: z.string().max(255), optional: true },
      },
    );

  desplazamiento?: Record<string, unknown>;

  titulo?: string;
}

export class SincronizarMarkupIdApsDto {
  static readonly schema: z.ZodType<SincronizarMarkupIdApsDto> =
    defineZodDto<SincronizarMarkupIdApsDto>('SincronizarMarkupIdApsDto', {
      markupIdAps: { schema: z.string().min(1).max(255) },
    });

  markupIdAps: string;
}
