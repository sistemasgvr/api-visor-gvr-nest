import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class EliminarTrabajadorUseCase {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

  async execute(idTrabajador: number, idUsuarioModificacion: number) {
    const resultado = await this.trabajadorRepository.eliminarTrabajador(
      idTrabajador,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al eliminar el trabajador',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
