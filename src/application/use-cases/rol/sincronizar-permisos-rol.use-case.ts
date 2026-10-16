import type { IRolRepository } from '../../../domain/repositories/rol.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { AsignarPermisosDto } from '../../inputs/rol/asignar-permisos.dto';

export class SincronizarPermisosRolUseCase {
  constructor(private readonly rolRepository: IRolRepository) {}

  async execute(
    idRol: number,
    sincronizarDto: AsignarPermisosDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.rolRepository.sincronizarPermisosRol({
      idRol,
      permisos: sincronizarDto.permisos,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al sincronizar los permisos',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
