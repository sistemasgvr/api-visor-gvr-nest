import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class UploadVisorElementoFotoDto {
  static readonly schema: z.ZodType<UploadVisorElementoFotoDto> =
    defineZodDto<UploadVisorElementoFotoDto>('UploadVisorElementoFotoDto', {
      idProyectoAcc: { schema: z.string(), optional: true },
      itemId: { schema: z.string() },
      identificador: {
        schema: z.number().int().min(1),
        transforms: [({ value }) => parseInt(String(value), 10)],
      },
      dia: { schema: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) },
      indiceFoto: {
        schema: z.number().int().min(1),
        optional: true,
        transforms: [
          ({ value }) => {
            if (value === undefined || value === null || value === '')
              return undefined;
            const n = parseInt(String(value), 10);
            return Number.isNaN(n) ? undefined : n;
          },
        ],
      },
    });

  idProyectoAcc?: string;

  itemId: string;

  /** id del anclaje en BD, o objectId Forge si aún no existe anclaje */

  identificador: number;

  dia: string;

  indiceFoto?: number;
}
