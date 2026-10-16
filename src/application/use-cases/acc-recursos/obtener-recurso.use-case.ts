import { type IAccRecursosRepository } from '../../../domain/repositories/acc-recursos.repository.interface';
import {
  InvalidInputError,
  NotFoundError,
} from '../../errors/application.error';

export class ObtenerRecursoUseCase {
  constructor(private readonly accRecursosRepository: IAccRecursosRepository) {}

  async execute(recursoTipo: string, recursoId: string): Promise<any> {
    if (!recursoTipo || !recursoId) {
      throw new InvalidInputError('Tipo de recurso e ID son requeridos');
    }

    const recurso = await this.accRecursosRepository.obtenerRecurso(
      recursoTipo,
      recursoId,
    );

    if (!recurso) {
      throw new NotFoundError('Recurso no encontrado');
    }

    return recurso;
  }
}
