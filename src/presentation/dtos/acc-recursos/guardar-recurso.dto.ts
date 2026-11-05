import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class GuardarRecursoDto {
  static readonly schema: z.ZodType<GuardarRecursoDto> =
    defineZodDto<GuardarRecursoDto>('GuardarRecursoDto', {
      recurso_tipo: { schema: z.string().min(1).max(50) },
      recurso_id: { schema: z.string().min(1).max(255) },
      recurso_urn: { schema: z.string(), optional: true },
      project_id: { schema: z.string().max(255), optional: true },
      parent_id: { schema: z.string().max(255), optional: true },
      idusuario_creador: {
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
      idusuario_asignado: { schema: z.number().int(), optional: true },
      nombre: { schema: z.string(), optional: true },
      descripcion: { schema: z.string(), optional: true },
      estado: { schema: z.string().max(50), optional: true },
      metadatos: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  recurso_tipo: string;

  recurso_id: string;

  recurso_urn?: string;

  project_id?: string;

  parent_id?: string;

  idusuario_creador: number;

  idusuario_asignado?: number;

  nombre?: string;

  descripcion?: string;

  estado?: string;

  metadatos?: any;
}
