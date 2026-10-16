import type {
  IProyectoRepository,
  ListarProyectosParams,
} from '../../../domain/repositories/proyecto.repository.interface';

export class ListarProyectosUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(params: ListarProyectosParams) {
    return await this.proyectoRepository.listarProyectos(params);
  }
}
