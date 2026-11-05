import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ListarNovedadLanzamientosQueryDto {
  static readonly schema: z.ZodType<ListarNovedadLanzamientosQueryDto> =
    defineZodDto<ListarNovedadLanzamientosQueryDto>(
      'ListarNovedadLanzamientosQueryDto',
      {
        busqueda: { schema: z.string(), optional: true },
        soloActivos: {
          schema: z.boolean(),
          optional: true,
          transforms: [
            ({ value }) => value === true || value === 'true' || value === '1',
          ],
        },
        limit: {
          schema: z.number().int().min(1),
          optional: true,
          transforms: [
            ({ value }) => (value !== undefined ? Number(value) : undefined),
          ],
        },
        offset: {
          schema: z.number().int().min(0),
          optional: true,
          transforms: [
            ({ value }) => (value !== undefined ? Number(value) : undefined),
          ],
        },
      },
    );

  busqueda?: string;

  soloActivos?: boolean;

  limit?: number;

  offset?: number;
}
