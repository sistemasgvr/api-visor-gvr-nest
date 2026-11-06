import { z } from 'zod';
import { defineZodDto, isoDate } from '../../../validation/zod-dto';

class ProjectValueDto {
  static readonly schema: z.ZodType<ProjectValueDto> =
    defineZodDto<ProjectValueDto>(
      'acc_projects_ProjectValueDto_clonar_proyecto',
      {
        value: { schema: z.number(), optional: true },
        currency: { schema: z.string().max(3), optional: true },
      },
    );

  value?: number;

  currency?: string;
}

export class ClonarProyectoDto {
  static readonly schema: z.ZodType<ClonarProyectoDto> =
    defineZodDto<ClonarProyectoDto>('ClonarProyectoDto', {
      name: { schema: z.string().min(1).max(255) },
      templateId: { schema: z.string().min(1).uuid() },
      type: { schema: z.string().max(255), optional: true },
      classification: {
        schema: z
          .string()
          .refine(
            (value) =>
              (
                [
                  'production',
                  'template',
                  'component',
                  'sample',
                ] as readonly unknown[]
              ).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['production', 'template', 'component', 'sample'] }),
        optional: true,
      },
      startDate: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
      },
      endDate: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
      },
      jobNumber: { schema: z.string().max(100), optional: true },
      addressLine1: { schema: z.string().max(255), optional: true },
      addressLine2: { schema: z.string().max(255), optional: true },
      city: { schema: z.string().max(255), optional: true },
      stateOrProvince: { schema: z.string().max(255), optional: true },
      postalCode: { schema: z.string().max(255), optional: true },
      country: { schema: z.string().max(255), optional: true },
      latitude: { schema: z.string().max(25), optional: true },
      longitude: { schema: z.string().max(25), optional: true },
      timezone: { schema: z.string(), optional: true },
      constructionType: { schema: z.string(), optional: true },
      deliveryMethod: { schema: z.string(), optional: true },
      contractType: { schema: z.string(), optional: true },
      currentPhase: { schema: z.string(), optional: true },
      businessUnitId: { schema: z.string().uuid(), optional: true },
      projectValue: {
        schema: z.lazy(() => ProjectValueDto.schema),
        optional: true,
      },
      token: { schema: z.string(), optional: true },
    });

  name: string;

  templateId: string;

  type?: string;

  classification?: string;

  startDate?: string;

  endDate?: string;

  jobNumber?: string;

  addressLine1?: string;

  addressLine2?: string;

  city?: string;

  stateOrProvince?: string;

  postalCode?: string;

  country?: string;

  latitude?: string;

  longitude?: string;

  timezone?: string;

  constructionType?: string;

  deliveryMethod?: string;

  contractType?: string;

  currentPhase?: string;

  businessUnitId?: string;

  projectValue?: ProjectValueDto;

  token?: string;
}
