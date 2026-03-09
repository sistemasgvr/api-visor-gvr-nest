import { Injectable } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import { CrearRevisionDto } from '../../../dtos/acc/reviews/crear-revision.dto';
import ObtenerTokenValidoHelper from '../issues/obtener-token-valido.helper';

@Injectable()
export class CrearRevisionUseCase {
    constructor(
        private readonly autodeskApiService: AutodeskApiService,
        private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
    ) { }

    async execute(userId: number, projectId: string, dto: CrearRevisionDto): Promise<any> {
        const accessToken = await this.obtenerTokenValidoHelper.execute(userId);
        return this.autodeskApiService.crearRevision(accessToken, projectId, dto);
    }
}
