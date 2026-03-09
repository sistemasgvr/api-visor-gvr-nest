import { Injectable } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import { ObtenerRevisionesDto } from '../../../dtos/acc/reviews/obtener-revisiones.dto';
import ObtenerTokenValidoHelper from '../issues/obtener-token-valido.helper';

@Injectable()
export class ObtenerRevisionesUseCase {
    constructor(
        private readonly autodeskApiService: AutodeskApiService,
        private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
    ) { }

    async execute(userId: number, projectId: string, dto: ObtenerRevisionesDto): Promise<any> {
        const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

        const filters: Record<string, any> = {};
        if (dto.limit !== undefined)                filters['limit'] = dto.limit;
        if (dto.offset !== undefined)               filters['offset'] = dto.offset;
        if (dto.sort)                               filters['sort'] = dto.sort;
        if (dto.filter_workflowId)                  filters['filter[workflowId]'] = dto.filter_workflowId;
        if (dto.filter_status)                      filters['filter[status]'] = dto.filter_status;
        if (dto.filter_currentStepDueDate)          filters['filter[currentStepDueDate]'] = dto.filter_currentStepDueDate;
        if (dto.filter_createdAt)                   filters['filter[createdAt]'] = dto.filter_createdAt;
        if (dto.filter_updatedAt)                   filters['filter[updatedAt]'] = dto.filter_updatedAt;
        if (dto.filter_finishedAt)                  filters['filter[finishedAt]'] = dto.filter_finishedAt;
        if (dto.filter_nextActionByUser)            filters['filter[nextActionByUser]'] = dto.filter_nextActionByUser;
        if (dto.filter_nextActionByRole)            filters['filter[nextActionByRole]'] = dto.filter_nextActionByRole;
        if (dto.filter_nextActionByCompany)         filters['filter[nextActionByCompany]'] = dto.filter_nextActionByCompany;
        if (dto.filter_name)                        filters['filter[name]'] = dto.filter_name;
        if (dto.filter_sequenceId !== undefined)    filters['filter[sequenceId]'] = dto.filter_sequenceId;
        if (dto.filter_archived !== undefined)      filters['filter[archived]'] = dto.filter_archived;
        if (dto.filter_archivedBy)                  filters['filter[archivedBy]'] = dto.filter_archivedBy;
        if (dto.filter_archivedAt)                  filters['filter[archivedAt]'] = dto.filter_archivedAt;

        return this.autodeskApiService.obtenerRevisiones(accessToken, projectId, filters);
    }
}
