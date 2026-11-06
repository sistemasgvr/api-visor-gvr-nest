import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

class UsuarioImportDto {
  static readonly schema: z.ZodType<UsuarioImportDto> =
    defineZodDto<UsuarioImportDto>('UsuarioImportDto', {
      email: { schema: z.string().min(1).email().max(255) },
      company_id: { schema: z.string(), optional: true },
      first_name: { schema: z.string().max(255), optional: true },
      last_name: { schema: z.string().max(255), optional: true },
    });

  email: string;

  company_id?: string;

  first_name?: string;

  last_name?: string;
}

export class ImportarUsuariosDto {
  static readonly schema: z.ZodType<ImportarUsuariosDto> =
    defineZodDto<ImportarUsuariosDto>('ImportarUsuariosDto', {
      users: {
        schema: z
          .array(z.lazy(() => UsuarioImportDto.schema))
          .refine(
            (value) =>
              value !== undefined &&
              value !== null &&
              (value as unknown) !== '',
            { message: 'El campo es obligatorio' },
          ),
      },
      region: {
        schema: z
          .string()
          .refine(
            (value) => (['US', 'EMEA'] as readonly unknown[]).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['US', 'EMEA'] }),
        optional: true,
      },
    });

  users: UsuarioImportDto[];

  region?: string;
}
