import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';
export class EstadosPlanesQueryDto {
  static readonly schema: z.ZodType<EstadosPlanesQueryDto> =
    defineZodDto<EstadosPlanesQueryDto>('EstadosPlanesQueryDto', {
      ids: {
        schema: z
          .array(z.number().int().min(1).max(2147483647))
          .min(1)
          .max(100),
        transforms: [
          ({ value }) => {
            if (typeof value !== 'string') return undefined;
            const tokens = value.split(',');
            if (tokens.some((id) => !/^\d+$/.test(id.trim()))) return undefined;
            return tokens.map((id) => Number(id.trim()));
          },
        ],
        description: 'Entre 1 y 100 IDs de proyecto separados por comas.',
        example: '1,2,3',
      },
    });
  ids!: number[];
}
