import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

import type { AuthorizationScope } from '../../../application/ports/authorization.port';

export class RolePermissionGrantDto {
  static readonly schema: z.ZodType<RolePermissionGrantDto> =
    defineZodDto<RolePermissionGrantDto>('RolePermissionGrantDto', {
      idpermiso: { schema: z.number().int().min(1).max(2147483647) },
      alcances: {
        schema: z
          .array(
            z
              .unknown()
              .refine(
                (value) =>
                  (
                    [
                      'global',
                      'propios',
                      'asignados',
                      'todos',
                    ] as readonly unknown[]
                  ).includes(value),
                { message: 'Seleccione una opción válida' },
              )
              .meta({ enum: ['global', 'propios', 'asignados', 'todos'] }),
          )
          .min(1)
          .refine(
            (values) => {
              const keys = values.map((value) => value);
              return new Set(keys).size === keys.length;
            },
            { message: 'No se permiten valores repetidos' },
          )
          .meta({ uniqueItems: true }),
      },
    });

  idpermiso!: number;

  alcances!: AuthorizationScope[];
}

export class SynchronizeRolePermissionsDto {
  static readonly schema: z.ZodType<SynchronizeRolePermissionsDto> =
    defineZodDto<SynchronizeRolePermissionsDto>(
      'SynchronizeRolePermissionsDto',
      {
        revision: { schema: z.number().int().min(0).max(2147483647) },
        permisos: {
          schema: z
            .array(z.lazy(() => RolePermissionGrantDto.schema))
            .max(10000)
            .refine(
              (values) => {
                const keys = values.map(
                  (grant: RolePermissionGrantDto) => grant?.idpermiso,
                );
                return new Set(keys).size === keys.length;
              },
              { message: 'No se permiten valores repetidos' },
            )
            .meta({ 'x-unique-by': 'idpermiso' }),
        },
      },
    );

  revision!: number;

  permisos!: RolePermissionGrantDto[];
}

export class SynchronizeMenuPermissionsDto {
  static readonly schema: z.ZodType<SynchronizeMenuPermissionsDto> =
    defineZodDto<SynchronizeMenuPermissionsDto>(
      'SynchronizeMenuPermissionsDto',
      {
        revision: { schema: z.number().int().min(0).max(2147483647) },
        permisos: {
          schema: z
            .array(z.number().int().min(1).max(2147483647))
            .max(10000)
            .refine(
              (values) => {
                const keys = values.map((value) => value);
                return new Set(keys).size === keys.length;
              },
              { message: 'No se permiten valores repetidos' },
            )
            .meta({ uniqueItems: true }),
        },
      },
    );

  revision!: number;

  permisos!: number[];
}
