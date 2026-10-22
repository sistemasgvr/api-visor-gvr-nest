import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export const NOTIFY_REVIEW_SCENARIOS = [
  'skip',
  'return',
  'submit',
  'sidebar',
] as const;
export type NotifyReviewScenario = (typeof NOTIFY_REVIEW_SCENARIOS)[number];

export class NotificarRevisorDestinatarioDto {
  static readonly schema: z.ZodType<NotificarRevisorDestinatarioDto> =
    defineZodDto<NotificarRevisorDestinatarioDto>(
      'NotificarRevisorDestinatarioDto',
      {
        email: { schema: z.string().email() },
        name: { schema: z.string(), optional: true },
      },
    );

  email: string;

  name?: string;
}

export class NotificarRevisoresRevisionDto {
  static readonly schema: z.ZodType<NotificarRevisoresRevisionDto> =
    defineZodDto<NotificarRevisoresRevisionDto>(
      'NotificarRevisoresRevisionDto',
      {
        recipients: {
          schema: z
            .array(z.lazy(() => NotificarRevisorDestinatarioDto.schema))
            .min(1),
        },
        scenario: {
          schema: z
            .union([
              z.literal('skip'),
              z.literal('return'),
              z.literal('submit'),
              z.literal('sidebar'),
            ])
            .refine(
              (value) =>
                (NOTIFY_REVIEW_SCENARIOS as readonly unknown[]).includes(value),
              { message: 'Seleccione una opción válida' },
            )
            .meta({ enum: NOTIFY_REVIEW_SCENARIOS }),
        },
        message: { schema: z.string().max(5000), optional: true },
        stepTitle: { schema: z.string().min(1).max(500) },
        idHub: { schema: z.string().min(1).max(200) },
      },
    );

  recipients: NotificarRevisorDestinatarioDto[];

  scenario: NotifyReviewScenario;

  message?: string;

  stepTitle: string;

  /** Para construir enlace al detalle en el front: /gestionbim/docs/:idHub/:projectId/revisiones/:id */

  idHub: string;
}
