import { Injectable, Inject } from '@nestjs/common';
import type { IMenuRepository } from '../../../domain/repositories/menu.repository.interface';
import { MENU_REPOSITORY } from '../../../domain/repositories/menu.repository.interface';

@Injectable()
export class CrearOpcionListaUseCase {
    constructor(
        @Inject(MENU_REPOSITORY)
        private readonly menuRepository: IMenuRepository,
    ) {}

    async execute(idLista: number, nombre: string): Promise<any> {
        const created = await this.menuRepository.crearOpcionLista(idLista, nombre);
        return created;
    }
}
