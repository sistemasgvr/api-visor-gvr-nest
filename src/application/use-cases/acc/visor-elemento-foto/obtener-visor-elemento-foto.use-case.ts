import { type IAccVisorElementoFotoRepository } from '../../../../domain/repositories/acc-visor-elemento-foto.repository.interface';
import { NotFoundError } from '../../../errors/application.error';

export class ObtenerVisorElementoFotoUseCase {
  constructor(private readonly repository: IAccVisorElementoFotoRepository) {}

  async execute(id: number) {
    const data = await this.repository.obtenerPorId(id);
    if (!data) {
      throw new NotFoundError('Anclaje de fotos no encontrado');
    }
    return data;
  }
}
