import { Injectable, Inject } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    ListarActividadesParams,
    ListarActividadesResult,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

@Injectable()
export class ListarActividadesUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
    ) {}

    async execute(params: ListarActividadesParams): Promise<ListarActividadesResult> {
        return this.controlOperativoRepository.listarActividades(params);
    }
}
