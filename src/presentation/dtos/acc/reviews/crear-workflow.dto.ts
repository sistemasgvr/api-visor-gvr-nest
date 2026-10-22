import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

/** Candidato GVR para un paso (usuario que puede iniciar/revisar/aprobar) */
export interface WorkflowCandidatoInput {
  idUsuario: number;
  tipoPaso: 'INITIATOR' | 'REVIEWER' | 'APPROVER';
  nombrePaso: string;
  ordenPaso: number;
  esOpcional?: boolean;
}

export class CrearWorkflowDto {
  static readonly schema: z.ZodType<CrearWorkflowDto> =
    defineZodDto<CrearWorkflowDto>('CrearWorkflowDto', {
      name: { schema: z.string().min(1).max(255) },
      description: { schema: z.string().max(4096), optional: true },
      notes: { schema: z.string().max(4096), optional: true },
      additionalOptions: {
        schema: z.object({
          allowInitiatorToEdit: z
            .union([z.literal(false), z.literal(true)])
            .optional(),
        }),
        optional: true,
      },
      steps: { schema: z.array(z.unknown()), optional: true },
      candidatos: { schema: z.array(z.unknown()), optional: true },
      approvalStatusOptions: { schema: z.array(z.unknown()), optional: true },
      additionalApprovalStatusOptions: {
        schema: z.array(z.unknown()),
        optional: true,
      },
      copyFilesOptions: { schema: z.unknown(), optional: true },
      attachedAttributes: { schema: z.array(z.unknown()), optional: true },
      updateAttributesOptions: { schema: z.unknown(), optional: true },
      saveAsDraft: { schema: z.boolean(), optional: true },
      workflowStatus: {
        schema: z
          .union([z.literal('ACTIVE'), z.literal('INACTIVE')])
          .refine(
            (value) =>
              (['ACTIVE', 'INACTIVE'] as readonly unknown[]).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['ACTIVE', 'INACTIVE'] }),
        optional: true,
      },
    });

  name: string;

  description?: string;

  notes?: string;

  additionalOptions?: {
    allowInitiatorToEdit?: boolean;
  };

  steps?: any[];

  /** Candidatos GVR por paso (idUsuario, tipoPaso, ordenPaso). Se integran en el flujo al crear en BD. */

  candidatos?: WorkflowCandidatoInput[];

  approvalStatusOptions?: any[];

  additionalApprovalStatusOptions?: { label: string; value: string }[];

  copyFilesOptions?: any;

  attachedAttributes?: any[];

  updateAttributesOptions?: any;

  /** Si true, el flujo se crea como Borrador (acc_flujo_estado). */

  saveAsDraft?: boolean;

  /** Estado explícito (listado UI ACTIVE/INACTIVE). Tiene prioridad sobre saveAsDraft al crear. */

  workflowStatus?: 'ACTIVE' | 'INACTIVE';
}
