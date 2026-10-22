import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

class BusinessUnitDto {
  static readonly schema: z.ZodType<BusinessUnitDto> =
    defineZodDto<BusinessUnitDto>('BusinessUnitDto', {
      id: { schema: z.string(), optional: true },
      parent_id: { schema: z.string(), optional: true },
      name: { schema: z.string().min(1).max(255) },
      description: { schema: z.string().max(500), optional: true },
    });

  id?: string;

  parent_id?: string;

  name: string;

  description?: string;
}

export class CrearOActualizarBusinessUnitsDto {
  static readonly schema: z.ZodType<CrearOActualizarBusinessUnitsDto> =
    defineZodDto<CrearOActualizarBusinessUnitsDto>(
      'CrearOActualizarBusinessUnitsDto',
      {
        business_units: {
          schema: z
            .array(z.lazy(() => BusinessUnitDto.schema))
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
      },
    );

  business_units: BusinessUnitDto[];

  region?: string;
}
