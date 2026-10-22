import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';
// DTO vacío para permitir cualquier parámetro de query sin validación
// Se usa 'any' en el controller en lugar de este DTO
export class ObtenerContenidoCarpetaDto {
  static readonly schema: z.ZodType<ObtenerContenidoCarpetaDto> =
    defineZodDto<ObtenerContenidoCarpetaDto>('ObtenerContenidoCarpetaDto', {});

  [key: string]: any;
}
