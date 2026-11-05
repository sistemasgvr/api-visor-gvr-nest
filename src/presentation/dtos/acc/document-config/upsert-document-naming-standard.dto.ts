import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class NamingStandardPartDto {
  static readonly schema: z.ZodType<NamingStandardPartDto> =
    defineZodDto<NamingStandardPartDto>('NamingStandardPartDto', {
      attributeId: { schema: z.number().int(), coerce: 'number' },
      orden: { schema: z.number().int().min(1), coerce: 'number' },
    });

  attributeId: number;

  orden: number;
}

export class UpsertDocumentNamingStandardDto {
  static readonly schema: z.ZodType<UpsertDocumentNamingStandardDto> =
    defineZodDto<UpsertDocumentNamingStandardDto>(
      'UpsertDocumentNamingStandardDto',
      {
        id: { schema: z.number().int(), optional: true, coerce: 'number' },
        codigo: { schema: z.string().min(1).max(100) },
        nombre: { schema: z.string().min(1).max(255) },
        descripcion: { schema: z.string(), optional: true },
        separador: { schema: z.string().max(10), optional: true },
        partes: {
          schema: z.array(z.lazy(() => NamingStandardPartDto.schema)),
          optional: true,
        },
      },
    );

  id?: number;

  codigo: string;

  nombre: string;

  descripcion?: string;

  separador?: string;

  partes?: NamingStandardPartDto[];
}
