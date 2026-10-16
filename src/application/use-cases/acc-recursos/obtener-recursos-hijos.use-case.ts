import { type IAccRecursosRepository } from '../../../domain/repositories/acc-recursos.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { ObtenerRecursosHijosDto } from '../../inputs/acc-recursos/obtener-recursos-hijos.dto';

export class ObtenerRecursosHijosUseCase {
  constructor(private readonly accRecursosRepository: IAccRecursosRepository) {}

  async execute(parentId: string, dto: ObtenerRecursosHijosDto): Promise<any> {
    if (!parentId) {
      throw new InvalidInputError('El ID del recurso padre es requerido');
    }

    const recursos = await this.accRecursosRepository.obtenerRecursosHijos(
      parentId,
      dto.tipo || null,
    );

    return recursos || [];
  }
}
