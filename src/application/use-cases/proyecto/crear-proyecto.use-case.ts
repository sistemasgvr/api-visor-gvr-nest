import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { CreateProyectoDto } from '../../inputs/proyecto/create-proyecto.dto';

export class CrearProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(createDto: CreateProyectoDto, idUsuarioCreacion: number) {
    const resultado = await this.proyectoRepository.crearProyecto({
      ...createDto,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al crear el proyecto',
      );
    }

    return {
      message: resultado.message,
      id_proyecto: resultado.id_proyecto,
    };
  }
}
