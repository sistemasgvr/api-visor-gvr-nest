import { Injectable } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

export interface WorkflowCandidatoInput {
    idUsuario: number;
    tipoPaso: 'INITIATOR' | 'REVIEWER' | 'APPROVER';
    nombrePaso: string;
    ordenPaso: number;
    esOpcional: boolean;
}

export interface GuardarWorkflowCandidatosDto {
    candidatos: WorkflowCandidatoInput[];
}

@Injectable()
export class GuardarWorkflowCandidatosUseCase {
    constructor(
        private readonly dbFunctionService: DatabaseFunctionService,
    ) { }

    async execute(
        accWorkflowId: string,
        idProyectoAcc: string,
        dto: GuardarWorkflowCandidatosDto,
        idUsuarioCreacion?: number,
    ): Promise<{ success: boolean; message: string; total: number }> {
        const isGvrNumericId = /^\d+$/.test(String(accWorkflowId).trim());

        const fn = isGvrNumericId ? 'acc_GuardarFlujoCandidatosGvr' : 'acc_GuardarWorkflowCandidatos';
        const args = isGvrNumericId
            ? [
                  parseInt(String(accWorkflowId).trim(), 10),
                  idProyectoAcc,
                  JSON.stringify(dto.candidatos),
                  idUsuarioCreacion ?? null,
              ]
            : [
                  accWorkflowId,
                  idProyectoAcc,
                  JSON.stringify(dto.candidatos),
                  idUsuarioCreacion ?? null,
              ];

        const result = await this.dbFunctionService.callFunction<{
            success: boolean;
            message: string;
            total: number;
        }>(fn, args);

        return result[0] ?? { success: false, message: 'Sin respuesta', total: 0 };
    }
}
