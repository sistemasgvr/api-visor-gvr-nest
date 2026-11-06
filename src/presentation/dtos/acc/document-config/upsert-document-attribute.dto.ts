import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class DocumentAttributeOptionDto {
  static readonly schema: z.ZodType<DocumentAttributeOptionDto> =
    defineZodDto<DocumentAttributeOptionDto>('DocumentAttributeOptionDto', {
      valor: { schema: z.string().min(1).max(255) },
      etiqueta: { schema: z.string().max(255), optional: true },
      orden: {
        schema: z.number().int().min(0),
        optional: true,
        coerce: 'number',
      },
    });

  valor: string;

  etiqueta?: string;

  orden?: number;
}

export class UpsertDocumentAttributeDto {
  static readonly schema: z.ZodType<UpsertDocumentAttributeDto> =
    defineZodDto<UpsertDocumentAttributeDto>('UpsertDocumentAttributeDto', {
      id: { schema: z.number().int(), optional: true, coerce: 'number' },
      codigo: { schema: z.string().min(1).max(100) },
      nombre: { schema: z.string().min(1).max(255) },
      tipo: { schema: z.string().min(1).max(50) },
      descripcion: { schema: z.string(), optional: true },
      esObligatorio: { schema: z.boolean(), optional: true },
      orden: {
        schema: z.number().int().min(0),
        optional: true,
        coerce: 'number',
      },
      opciones: {
        schema: z.array(z.lazy(() => DocumentAttributeOptionDto.schema)),
        optional: true,
      },
    });

  id?: number;

  codigo: string;

  nombre: string;

  tipo: string;

  descripcion?: string;

  esObligatorio?: boolean;

  orden?: number;

  opciones?: DocumentAttributeOptionDto[];
}
