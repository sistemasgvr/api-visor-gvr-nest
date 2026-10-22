import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';
// No requiere parámetros, solo lista todos los niveles de permisos disponibles
export class ListarNivelesPermisoDto {
  static readonly schema: z.ZodType<ListarNivelesPermisoDto> =
    defineZodDto<ListarNivelesPermisoDto>('ListarNivelesPermisoDto', {});

  // Placeholder DTO - no requiere parámetros
}
