import { Injectable } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

export interface WorkflowCandidatoRow {
    id: number;
    accWorkflowId: string;
    idUsuario: number;
    nombreUsuario: string;
    correoUsuario: string;
    tipoPaso: string;
    nombrePaso: string;
    ordenPaso: number;
    esOpcional: boolean;
}

@Injectable()
export class ObtenerWorkflowCandidatosUseCase {
    constructor(
        private readonly dbFunctionService: DatabaseFunctionService,
    ) { }

    async execute(
        accWorkflowId: string,
        idProyectoAcc?: string,
    ): Promise<WorkflowCandidatoRow[]> {
        const isGvrNumericId = /^\d+$/.test(String(accWorkflowId).trim());
        if (isGvrNumericId) {
            return this.dbFunctionService.callFunction<WorkflowCandidatoRow>(
                'acc_ListarCandidatosFlujoTrabajoGvr',
                [parseInt(String(accWorkflowId).trim(), 10)],
            );
        }
        return this.dbFunctionService.callFunction<WorkflowCandidatoRow>(
            'acc_ListarWorkflowCandidatos',
            [accWorkflowId, idProyectoAcc ?? null],
        );
    }
}
