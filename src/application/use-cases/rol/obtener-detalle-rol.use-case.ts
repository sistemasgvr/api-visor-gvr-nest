import type { IRolRepository } from '../../../domain/repositories/rol.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class ObtenerDetalleRolUseCase {
  constructor(private readonly rolRepository: IRolRepository) {}

  async execute(idRol: number) {
    const detalle = await this.rolRepository.obtenerDetalleRol(idRol);

    if (!detalle) {
      throw new NotFoundError('Rol no encontrado');
    }

    return detalle;
  }
}
