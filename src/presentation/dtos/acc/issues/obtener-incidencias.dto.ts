import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerIncidenciasDto {
  static readonly schema: z.ZodType<ObtenerIncidenciasDto> =
    defineZodDto<ObtenerIncidenciasDto>('acc_issues_ObtenerIncidenciasDto', {
      filter_status: { schema: z.string(), optional: true },
      filter_assignedTo: { schema: z.string(), optional: true },
      filter_issueTypeId: { schema: z.string(), optional: true },
      filter_rootCauseId: { schema: z.string(), optional: true },
      filter_locationId: { schema: z.string(), optional: true },
      filter_linkedDocumentUrn: { schema: z.string(), optional: true },
      limit: {
        schema: z.number().int().min(1).max(200),
        optional: true,
        coerce: 'number',
      },
      offset: {
        schema: z.number().int().min(0),
        optional: true,
        coerce: 'number',
      },
      sort: { schema: z.string(), optional: true },
    });

  filter_status?: string;

  filter_assignedTo?: string;

  filter_issueTypeId?: string;

  filter_rootCauseId?: string;

  filter_locationId?: string;

  filter_linkedDocumentUrn?: string;

  limit?: number;

  offset?: number;

  sort?: string;
}
