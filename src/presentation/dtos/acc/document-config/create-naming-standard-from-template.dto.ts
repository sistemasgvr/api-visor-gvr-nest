import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CreateNamingStandardFromTemplateDto {
  static readonly schema: z.ZodType<CreateNamingStandardFromTemplateDto> =
    defineZodDto<CreateNamingStandardFromTemplateDto>(
      'CreateNamingStandardFromTemplateDto',
      {
        templateCode: {
          schema: z
            .string()
            .refine(
              (value) => (['iso19650'] as readonly unknown[]).includes(value),
              { message: 'Seleccione una opción válida' },
            )
            .meta({ enum: ['iso19650'] }),
        },
        codigo: { schema: z.string().min(1).max(100) },
        nombre: { schema: z.string().min(1).max(255) },
        descripcion: { schema: z.string(), optional: true },
        separador: { schema: z.string().max(10), optional: true },
      },
    );

  templateCode: 'iso19650';

  codigo: string;

  nombre: string;

  descripcion?: string;

  separador?: string;
}
