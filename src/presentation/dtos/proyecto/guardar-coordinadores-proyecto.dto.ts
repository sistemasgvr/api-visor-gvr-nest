import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class CoordinadorItemDto {
  static readonly schema: z.ZodType<CoordinadorItemDto> =
    defineZodDto<CoordinadorItemDto>('CoordinadorItemDto', {
      idtrabajador: {
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
      miembrosEquipo: { schema: z.array(z.number().int()), defaultValue: [] },
    });

  idtrabajador: number;

  miembrosEquipo: number[] = [];
}

export class GuardarCoordinadoresProyectoDto {
  static readonly schema: z.ZodType<GuardarCoordinadoresProyectoDto> =
    defineZodDto<GuardarCoordinadoresProyectoDto>(
      'GuardarCoordinadoresProyectoDto',
      {
        coordinadores: {
          schema: z.array(z.lazy(() => CoordinadorItemDto.schema)),
        },
      },
    );

  coordinadores: CoordinadorItemDto[];
}
