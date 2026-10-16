import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class ActivarTrabajadorUseCase {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

  async execute(idTrabajador: number, idUsuarioModificacion: number) {
    const resultado = await this.trabajadorRepository.activarTrabajador(
      idTrabajador,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al activar el trabajador',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
