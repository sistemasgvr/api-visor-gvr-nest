import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

class ProductImportDto {
  static readonly schema: z.ZodType<ProductImportDto> =
    defineZodDto<ProductImportDto>('ProductImportDto', {
      key: { schema: z.string().min(1) },
      access: {
        schema: z
          .string()
          .min(1)
          .refine(
            (value) =>
              (['administrator', 'user'] as readonly unknown[]).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['administrator', 'user'] }),
      },
    });

  key: string;

  access: string;
}

class UsuarioProyectoImportDto {
  static readonly schema: z.ZodType<UsuarioProyectoImportDto> =
    defineZodDto<UsuarioProyectoImportDto>('UsuarioProyectoImportDto', {
      email: { schema: z.string().min(1).email().max(255) },
      companyId: { schema: z.string(), optional: true },
      roleIds: { schema: z.array(z.string()), optional: true },
      products: {
        schema: z.array(z.lazy(() => ProductImportDto.schema)),
        optional: true,
      },
    });

  email: string;

  companyId?: string;

  roleIds?: string[];

  products?: ProductImportDto[];
}

export class ImportarUsuariosProyectoDto {
  static readonly schema: z.ZodType<ImportarUsuariosProyectoDto> =
    defineZodDto<ImportarUsuariosProyectoDto>('ImportarUsuariosProyectoDto', {
      users: {
        schema: z
          .array(z.lazy(() => UsuarioProyectoImportDto.schema))
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
      user_id: { schema: z.string(), optional: true },
    });

  users: UsuarioProyectoImportDto[];

  region?: string;

  user_id?: string;
}
