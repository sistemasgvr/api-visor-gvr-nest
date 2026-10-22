import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class VisorElementoFotoArchivoDto {
  static readonly schema: z.ZodType<VisorElementoFotoArchivoDto> =
    defineZodDto<VisorElementoFotoArchivoDto>('VisorElementoFotoArchivoDto', {
      url: { schema: z.string().min(1) },
      nombreOriginal: { schema: z.string().max(500), optional: true },
      tipoMime: { schema: z.string().max(255), optional: true },
      tamanoBytes: { schema: z.number().int().min(0), optional: true },
      fechaAvance: { schema: z.string().max(10), optional: true },
    });

  url: string;

  nombreOriginal?: string;

  tipoMime?: string;

  tamanoBytes?: number;

  /** Fecha del avance (YYYY-MM-DD), puede ser distinta a la fecha de subida */

  fechaAvance?: string;
}

export class CrearVisorElementoFotoDto {
  static readonly schema: z.ZodType<CrearVisorElementoFotoDto> =
    defineZodDto<CrearVisorElementoFotoDto>('CrearVisorElementoFotoDto', {
      documentUrn: { schema: z.string().min(1) },
      itemId: { schema: z.string().min(1) },
      versionId: { schema: z.string(), optional: true },
      nombreDocumento: { schema: z.string().max(500), optional: true },
      objectId: { schema: z.number().int().min(1) },
      externalId: { schema: z.string(), optional: true },
      nombreElemento: { schema: z.string().max(500), optional: true },
      posicionX: { schema: z.number() },
      posicionY: { schema: z.number() },
      posicionZ: { schema: z.number() },
      viewableGuid: { schema: z.string(), optional: true },
      viewableName: { schema: z.string(), optional: true },
      is3D: { schema: z.boolean(), optional: true },
      viewerState: {
        schema: z.record(z.string(), z.unknown()),
        optional: true,
      },
      idProyectoGvr: { schema: z.number().int().min(1), optional: true },
      titulo: { schema: z.string().max(255), optional: true },
      descripcion: { schema: z.string(), optional: true },
      archivos: {
        schema: z.array(z.lazy(() => VisorElementoFotoArchivoDto.schema)),
      },
    });

  documentUrn: string;

  itemId: string;

  versionId?: string;

  nombreDocumento?: string;

  objectId: number;

  externalId?: string;

  nombreElemento?: string;

  posicionX: number;

  posicionY: number;

  posicionZ: number;

  viewableGuid?: string;

  viewableName?: string;

  is3D?: boolean;

  viewerState?: Record<string, unknown>;

  idProyectoGvr?: number;

  titulo?: string;

  descripcion?: string;

  archivos: VisorElementoFotoArchivoDto[];
}

export class ActualizarVisorElementoFotoDto {
  static readonly schema: z.ZodType<ActualizarVisorElementoFotoDto> =
    defineZodDto<ActualizarVisorElementoFotoDto>(
      'ActualizarVisorElementoFotoDto',
      {
        titulo: { schema: z.string().max(255), optional: true },
        descripcion: { schema: z.string(), optional: true },
        posicionX: { schema: z.number(), optional: true },
        posicionY: { schema: z.number(), optional: true },
        posicionZ: { schema: z.number(), optional: true },
        nombreElemento: { schema: z.string().max(500), optional: true },
      },
    );

  titulo?: string;

  descripcion?: string;

  posicionX?: number;

  posicionY?: number;

  posicionZ?: number;

  nombreElemento?: string;
}

export class AgregarArchivosVisorElementoFotoDto {
  static readonly schema: z.ZodType<AgregarArchivosVisorElementoFotoDto> =
    defineZodDto<AgregarArchivosVisorElementoFotoDto>(
      'AgregarArchivosVisorElementoFotoDto',
      {
        archivos: {
          schema: z.array(z.lazy(() => VisorElementoFotoArchivoDto.schema)),
        },
      },
    );

  archivos: VisorElementoFotoArchivoDto[];
}
