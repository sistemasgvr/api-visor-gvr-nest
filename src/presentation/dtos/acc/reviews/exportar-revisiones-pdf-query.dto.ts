import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

/** Mismos filtros que GET /reviews; sin paginación (el export recorre todas las páginas). */
export class ExportarRevisionesPdfQueryDto {
  static readonly schema: z.ZodType<ExportarRevisionesPdfQueryDto> =
    defineZodDto<ExportarRevisionesPdfQueryDto>(
      'ExportarRevisionesPdfQueryDto',
      {
        filter_status: { schema: z.string(), optional: true },
        filter_name: { schema: z.string(), optional: true },
        filter_createdAt: { schema: z.string(), optional: true },
        filter_finishedAt: { schema: z.string(), optional: true },
        filter_currentStepDueDate: { schema: z.string(), optional: true },
        filter_workflowId: { schema: z.string(), optional: true },
      },
    );

  filter_status?: string;

  filter_name?: string;

  filter_createdAt?: string;

  filter_finishedAt?: string;

  filter_currentStepDueDate?: string;

  filter_workflowId?: string;
}
