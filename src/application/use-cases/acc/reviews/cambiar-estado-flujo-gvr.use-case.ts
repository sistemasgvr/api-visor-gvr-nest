import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';
import { CambiarEstadoWorkflowDto } from '../../../dtos/acc/reviews/cambiar-estado-workflow.dto';

@Injectable()
export class CambiarEstadoFlujoGvrUseCase {
    constructor(
        private readonly dbFunctionService: DatabaseFunctionService,
    ) {}

    async execute(
        projectId: string,
        workflowId: string,
        dto: CambiarEstadoWorkflowDto,
    ): Promise<{ id: string; mensaje: string }> {
        const flowId = parseInt(workflowId, 10);
        if (Number.isNaN(flowId)) {
            throw new BadRequestException('Solo se puede cambiar el estado de flujos internos GVR (id numérico).');
        }

        const nombreEstado = dto.status === 'INACTIVE' ? 'Borrador' : 'Activo';

        let result: { id: number; mensaje: string }[];
        try {
            result = await this.dbFunctionService.callFunction<{
                id: number;
                mensaje: string;
            }>('acc_CambiarEstadoFlujoTrabajoGvr', [projectId, flowId, nombreEstado]);
        } catch (e: any) {
            throw new BadRequestException(e?.message ?? 'No se pudo cambiar el estado del flujo.');
        }

        const row = result?.[0];
        if (!row?.id) {
            throw new BadRequestException('No se pudo cambiar el estado del flujo.');
        }

        return {
            id: String(row.id),
            mensaje: row.mensaje ?? 'Estado actualizado.',
        };
    }
}
