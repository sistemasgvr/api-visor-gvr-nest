import { Injectable } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import { CrearWorkflowDto } from '../../../dtos/acc/reviews/crear-workflow.dto';
import ObtenerTokenValidoHelper from '../issues/obtener-token-valido.helper';

@Injectable()
export class CrearWorkflowUseCase {
    constructor(
        private readonly autodeskApiService: AutodeskApiService,
        private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
    ) { }

    async execute(userId: number, projectId: string, dto: CrearWorkflowDto): Promise<any> {
        const accessToken = await this.obtenerTokenValidoHelper.execute(userId);
        return this.autodeskApiService.crearWorkflow(accessToken, projectId, dto);
    }
}
