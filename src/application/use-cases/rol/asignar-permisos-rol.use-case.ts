import type { IRolRepository } from '../../../domain/repositories/rol.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { AsignarPermisosDto } from '../../inputs/rol/asignar-permisos.dto';

export class AsignarPermisosRolUseCase {
  constructor(private readonly rolRepository: IRolRepository) {}

  async execute(
    idRol: number,
    asignarDto: AsignarPermisosDto,
    idUsuarioCreacion: number,
  ) {
    const resultado = await this.rolRepository.asignarPermisosRol({
      idRol,
      permisos: asignarDto.permisos,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al asignar los permisos',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
