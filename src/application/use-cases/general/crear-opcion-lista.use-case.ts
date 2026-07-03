import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IMenuRepository } from '../../../domain/repositories/menu.repository.interface';
import { MENU_REPOSITORY } from '../../../domain/repositories/menu.repository.interface';
import { normalizeNombreOpcionLista } from '../../../shared/utils/listado-opcion-nombre.util';

@Injectable()
export class CrearOpcionListaUseCase {
  constructor(
    @Inject(MENU_REPOSITORY)
    private readonly menuRepository: IMenuRepository,
  ) {}

  async execute(idLista: number, nombre: string): Promise<any> {
    const normalized = normalizeNombreOpcionLista(nombre ?? '', idLista);
    if (!normalized) {
      throw new BadRequestException('El nombre de la opción es obligatorio');
    }
    try {
      const created = await this.menuRepository.crearOpcionLista(
        idLista,
        normalized,
      );
      return created;
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : '';
      if (msg.includes('Ya existe una opción con el nombre')) {
        throw new BadRequestException(msg);
      }
      throw err;
    }
  }
}
