import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class EliminarContratoTrabajadorUseCase {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

  async execute(
    idTrabajador: number,
    idContrato: number,
    idUsuarioModificacion: number,
  ) {
    const resultado =
      await this.trabajadorRepository.eliminarContratoTrabajador({
        idContrato,
        idTrabajador,
        idUsuarioModificacion,
      });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al eliminar el contrato',
      );
    }

    return { message: resultado.message };
  }
}
