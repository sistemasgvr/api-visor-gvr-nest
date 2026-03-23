import { IsString, IsNotEmpty, IsOptional, MaxLength, IsArray } from 'class-validator';

/** Candidato GVR para un paso (usuario que puede iniciar/revisar/aprobar) */
export interface WorkflowCandidatoInput {
    idUsuario: number;
    tipoPaso: 'INITIATOR' | 'REVIEWER' | 'APPROVER';
    nombrePaso: string;
    ordenPaso: number;
    esOpcional?: boolean;
}

export class CrearWorkflowDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(4096)
    description?: string;

    @IsOptional()
    @IsString()
    @MaxLength(4096)
    notes?: string;

    @IsOptional()
    additionalOptions?: {
        allowInitiatorToEdit?: boolean;
    };

    @IsOptional()
    @IsArray()
    steps?: any[];

    /** Candidatos GVR por paso (idUsuario, tipoPaso, ordenPaso). Se integran en el flujo al crear en BD. */
    @IsOptional()
    @IsArray()
    candidatos?: WorkflowCandidatoInput[];

    @IsOptional()
    @IsArray()
    approvalStatusOptions?: any[];

    @IsOptional()
    @IsArray()
    additionalApprovalStatusOptions?: { label: string; value: string }[];

    @IsOptional()
    copyFilesOptions?: any;

    @IsOptional()
    @IsArray()
    attachedAttributes?: any[];

    @IsOptional()
    updateAttributesOptions?: any;
}
