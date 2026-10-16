import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class ObtenerTrabajadorUseCase {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

  async execute(idTrabajador: number) {
    const trabajador =
      await this.trabajadorRepository.obtenerTrabajadorPorId(idTrabajador);

    if (!trabajador) {
      throw new NotFoundError('Trabajador no encontrado');
    }

    return trabajador;
  }
}
