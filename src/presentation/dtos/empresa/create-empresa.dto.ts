import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class CreateEmpresaDto {
  static readonly schema: z.ZodType<CreateEmpresaDto> =
    defineZodDto<CreateEmpresaDto>('CreateEmpresaDto', {
      razonSocial: { schema: z.string().min(1).max(255) },
      nombreComercial: { schema: z.string().max(255), optional: true },
      idTipoDocumento: {
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
      nroDocumento: { schema: z.string().min(1).max(50) },
      celularEmpresa: { schema: z.string().max(40), optional: true },
      correoEmpresa: {
        schema: z.string().email().max(255),
        optional: true,
        when: (_, v) => v != null && String(v).trim() !== '',
      },
      urlLogo: { schema: z.string().max(2000), optional: true },
      direccion: { schema: z.string().max(500), optional: true },
      idDepartamento: { schema: z.number().int(), optional: true },
      idProvincia: { schema: z.number().int(), optional: true },
      idDistrito: { schema: z.number().int(), optional: true },
    });

  razonSocial: string;

  nombreComercial?: string;

  idTipoDocumento: number;

  nroDocumento: string;

  celularEmpresa?: string;

  correoEmpresa?: string;

  urlLogo?: string;

  direccion?: string;

  idDepartamento?: number;

  idProvincia?: number;

  idDistrito?: number;
}
