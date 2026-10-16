import type { IMenuRepository } from '../../../domain/repositories/menu.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class ObtenerOpcionesListaUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(idLista: number): Promise<any[]> {
    const listaOpciones =
      await this.menuRepository.obtenerOpcionesPorLista(idLista);

    if (!listaOpciones) {
      throw new NotFoundError('Opciones no encontradas');
    }

    return listaOpciones;
  }
}
