import type { IPermisoRepository } from '../../../domain/repositories/permiso.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { CreatePermisoDto } from '../../inputs/permiso/create-permiso.dto';

export class CrearPermisoUseCase {
  constructor(private readonly permisoRepository: IPermisoRepository) {}

  async execute(createDto: CreatePermisoDto, idUsuarioCreacion: number) {
    const resultado = await this.permisoRepository.crearPermiso({
      ...createDto,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al crear el permiso',
      );
    }

    return {
      message: resultado.message,
      id_permiso: resultado.id_permiso,
    };
  }
}
