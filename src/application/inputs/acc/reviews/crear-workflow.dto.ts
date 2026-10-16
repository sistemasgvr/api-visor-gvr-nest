/** Candidato GVR para un paso (usuario que puede iniciar/revisar/aprobar) */
export interface WorkflowCandidatoInput {
  idUsuario: number;
  tipoPaso: 'INITIATOR' | 'REVIEWER' | 'APPROVER';
  nombrePaso: string;
  ordenPaso: number;
  esOpcional?: boolean;
}

export class CrearWorkflowDto {
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
