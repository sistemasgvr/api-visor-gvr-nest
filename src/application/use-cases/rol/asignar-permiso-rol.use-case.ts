import type { IRolRepository } from '../../../domain/repositories/rol.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { AsignarPermisoDto } from '../../inputs/rol/asignar-permiso.dto';

export class AsignarPermisoRolUseCase {
  constructor(private readonly rolRepository: IRolRepository) {}

  async execute(
    idRol: number,
    asignarDto: AsignarPermisoDto,
    idUsuarioCreacion: number,
  ) {
    const resultado = await this.rolRepository.asignarPermisoRol({
      idRol,
      idPermiso: asignarDto.id_permiso,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al asignar el permiso',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
