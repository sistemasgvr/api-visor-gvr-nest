import type { IMenuRepository } from '../../../domain/repositories/menu.repository.interface';
import { normalizeNombreOpcionLista } from '../../../domain/utils/listado-opcion-nombre.util';
import { InvalidInputError } from '../../errors/application.error';

export class CrearOpcionListaUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(idLista: number, nombre: string): Promise<any> {
    const normalized = normalizeNombreOpcionLista(nombre ?? '', idLista);
    if (!normalized) {
      throw new InvalidInputError('El nombre de la opción es obligatorio');
    }
    try {
      const created = await this.menuRepository.crearOpcionLista(
        idLista,
        normalized,
      );
      return created;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : typeof err === 'string' ? err : '';
      if (msg.includes('Ya existe una opción con el nombre')) {
        throw new InvalidInputError(msg);
      }
      throw err;
    }
  }
}
