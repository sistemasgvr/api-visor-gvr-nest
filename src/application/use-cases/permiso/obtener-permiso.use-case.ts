import type { IPermisoRepository } from '../../../domain/repositories/permiso.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class ObtenerPermisoUseCase {
  constructor(private readonly permisoRepository: IPermisoRepository) {}

  async execute(idPermiso: number) {
    const permiso = await this.permisoRepository.obtenerPermisoPorId(idPermiso);

    if (!permiso) {
      throw new NotFoundError('Permiso no encontrado');
    }

    return permiso;
  }
}
