import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

class ProductDto {
  static readonly schema: z.ZodType<ProductDto> = defineZodDto<ProductDto>(
    'acc_project-users_ProductDto_actualizar_usuario_proyecto',
    {
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
    },
  );

  key: string;

  access: string;
}

export class ActualizarUsuarioProyectoDto {
  static readonly schema: z.ZodType<ActualizarUsuarioProyectoDto> =
    defineZodDto<ActualizarUsuarioProyectoDto>('ActualizarUsuarioProyectoDto', {
      companyId: { schema: z.string(), optional: true },
      roleIds: { schema: z.array(z.string()), optional: true },
      products: {
        schema: z.array(z.lazy(() => ProductDto.schema)),
        optional: true,
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

  companyId?: string;

  roleIds?: string[];

  products?: ProductDto[];

  region?: string;

  user_id?: string;
}
