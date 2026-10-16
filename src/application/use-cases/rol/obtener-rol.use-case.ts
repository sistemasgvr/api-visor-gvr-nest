import type { IRolRepository } from '../../../domain/repositories/rol.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class ObtenerRolUseCase {
  constructor(private readonly rolRepository: IRolRepository) {}

  async execute(idRol: number) {
    const rol = await this.rolRepository.obtenerRolPorId(idRol);

    if (!rol) {
      throw new NotFoundError('Rol no encontrado');
    }

    return rol;
  }
}
