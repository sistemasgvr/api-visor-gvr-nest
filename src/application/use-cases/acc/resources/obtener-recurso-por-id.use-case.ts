import type { IAccResourcesRepository } from '../../../../domain/repositories/acc-resources.repository.interface';
import { NotFoundError } from '../../../errors/application.error';

export class ObtenerRecursoPorIdUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(id: number) {
    const resultado = await this.accResourcesRepository.obtenerRecursoPorId(id);

    if (!resultado) {
      throw new NotFoundError('Recurso no encontrado');
    }

    return resultado;
  }
}
