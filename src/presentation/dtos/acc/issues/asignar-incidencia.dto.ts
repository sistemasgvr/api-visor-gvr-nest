import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class AsignarIncidenciaDto {
  static readonly schema: z.ZodType<AsignarIncidenciaDto> =
    defineZodDto<AsignarIncidenciaDto>('AsignarIncidenciaDto', {
      issueId: { schema: z.string().min(1) },
      userIds: {
        schema: z.array(z.number().int()),
        optional: true,
        when: (o) => o.userIds !== undefined,
      },
      userId: { schema: z.number().int(), optional: true },
    });

  issueId: string;

  userIds?: number[]; // Array de IDs de usuarios a asignar. Array vacío [] para desasignar todos

  // Mantener compatibilidad con versión anterior (un solo usuario)

  userId?: number | null; // null para desasignar (deprecated, usar userIds: [] para desasignar)
}
