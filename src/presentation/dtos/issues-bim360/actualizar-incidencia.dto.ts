import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ActualizarIncidenciaDto {
  static readonly schema: z.ZodType<ActualizarIncidenciaDto> =
    defineZodDto<ActualizarIncidenciaDto>(
      'issues-bim360_ActualizarIncidenciaDto',
      {
        title: { schema: z.string(), optional: true },
        description: { schema: z.string(), optional: true },
        status: { schema: z.string(), optional: true },
        issueSubtypeId: { schema: z.string(), optional: true },
        dueDate: { schema: z.string(), optional: true },
        assignedTo: { schema: z.string(), optional: true },
        assignedToType: { schema: z.string(), optional: true },
        rootCauseId: { schema: z.string(), optional: true },
        startDate: { schema: z.string(), optional: true },
        locationId: { schema: z.string(), optional: true },
        locationDetails: { schema: z.string(), optional: true },
      },
    );

  title?: string;

  description?: string;

  status?: string;

  issueSubtypeId?: string;

  dueDate?: string;

  assignedTo?: string;

  assignedToType?: string;

  rootCauseId?: string;

  startDate?: string;

  locationId?: string;

  locationDetails?: string;
}
