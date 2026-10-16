import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class ResetearContrasenaUseCase {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

  async execute(idTrabajador: number, idUsuarioModificacion: number) {
    const resultado = await this.trabajadorRepository.resetearContrasena(
      idTrabajador,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al resetear la contraseña',
      );
    }

    return {
      message: resultado.message,
      nueva_contrasena: resultado.nueva_contrasena,
    };
  }
}
