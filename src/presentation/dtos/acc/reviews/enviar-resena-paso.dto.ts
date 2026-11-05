import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class DocStatusDto {
  static readonly schema: z.ZodType<DocStatusDto> = defineZodDto<DocStatusDto>(
    'DocStatusDto',
    { idArchivo: { schema: z.number().int() }, estado: { schema: z.string() } },
  );

  idArchivo!: number;

  estado!: string;
}

export class EnviarResenaPasoDto {
  static readonly schema: z.ZodType<EnviarResenaPasoDto> =
    defineZodDto<EnviarResenaPasoDto>('EnviarResenaPasoDto', {
      notas: { schema: z.string(), optional: true },
      docStatuses: {
        schema: z.array(z.lazy(() => DocStatusDto.schema)),
        optional: true,
      },
    });

  notas?: string;

  docStatuses?: DocStatusDto[];
}
