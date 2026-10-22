import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerRevisionesDto {
  static readonly schema: z.ZodType<ObtenerRevisionesDto> =
    defineZodDto<ObtenerRevisionesDto>('ObtenerRevisionesDto', {
      limit: {
        schema: z.number().int().min(1).max(50),
        optional: true,
        coerce: 'number',
      },
      offset: {
        schema: z.number().int().min(0),
        optional: true,
        coerce: 'number',
      },
      sort: { schema: z.string(), optional: true },
      filter_workflowId: { schema: z.string(), optional: true },
      filter_status: { schema: z.string(), optional: true },
      filter_currentStepDueDate: { schema: z.string(), optional: true },
      filter_createdAt: { schema: z.string(), optional: true },
      filter_updatedAt: { schema: z.string(), optional: true },
      filter_finishedAt: { schema: z.string(), optional: true },
      filter_nextActionByUser: { schema: z.string(), optional: true },
      filter_nextActionByRole: { schema: z.string(), optional: true },
      filter_nextActionByCompany: { schema: z.string(), optional: true },
      filter_name: { schema: z.string(), optional: true },
      filter_sequenceId: {
        schema: z.number().int(),
        optional: true,
        coerce: 'number',
      },
      filter_archived: {
        schema: z.boolean(),
        optional: true,
        transforms: [({ value }) => value === 'true' || value === true],
      },
      filter_archivedBy: { schema: z.string(), optional: true },
      filter_archivedAt: { schema: z.string(), optional: true },
    });

  limit?: number;

  offset?: number;

  sort?: string;

  filter_workflowId?: string;

  filter_status?: string;

  filter_currentStepDueDate?: string;

  filter_createdAt?: string;

  filter_updatedAt?: string;

  filter_finishedAt?: string;

  filter_nextActionByUser?: string;

  filter_nextActionByRole?: string;

  filter_nextActionByCompany?: string;

  filter_name?: string;

  filter_sequenceId?: number;

  filter_archived?: boolean;

  filter_archivedBy?: string;

  filter_archivedAt?: string;
}
