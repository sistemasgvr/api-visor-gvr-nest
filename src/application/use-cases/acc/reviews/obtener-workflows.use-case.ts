import { Injectable } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import { ObtenerWorkflowsDto } from '../../../dtos/acc/reviews/obtener-workflows.dto';
import ObtenerTokenValidoHelper from '../issues/obtener-token-valido.helper';

@Injectable()
export class ObtenerWorkflowsUseCase {
    constructor(
        private readonly autodeskApiService: AutodeskApiService,
        private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
    ) { }

    async execute(userId: number, projectId: string, dto: ObtenerWorkflowsDto): Promise<any> {
        const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

        const filters: Record<string, any> = {};
        if (dto.limit !== undefined)   filters['limit'] = dto.limit;
        if (dto.offset !== undefined)  filters['offset'] = dto.offset;
        if (dto.sort)                  filters['sort'] = dto.sort;
        if (dto.filter_status)         filters['filter[status]'] = dto.filter_status;
        if (dto.filter_name)           filters['filter[name]'] = dto.filter_name;

        return this.autodeskApiService.obtenerWorkflows(accessToken, projectId, filters);
    }
}
