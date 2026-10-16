import type { IRolRepository } from '../../../domain/repositories/rol.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { CreateRolDto } from '../../inputs/rol/create-rol.dto';

export class CrearRolUseCase {
  constructor(private readonly rolRepository: IRolRepository) {}

  async execute(createDto: CreateRolDto, idUsuarioCreacion: number) {
    const resultado = await this.rolRepository.crearRol({
      ...createDto,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al crear el rol',
      );
    }

    return {
      message: resultado.message,
      id_rol: resultado.id_rol,
    };
  }
}
