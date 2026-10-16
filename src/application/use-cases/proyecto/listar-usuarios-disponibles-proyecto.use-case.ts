import type {
  IProyectoRepository,
  ListarUsuariosDisponiblesParams,
} from '../../../domain/repositories/proyecto.repository.interface';

export class ListarUsuariosDisponiblesProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(params: ListarUsuariosDisponiblesParams) {
    return this.proyectoRepository.listarUsuariosDisponiblesProyecto(params);
  }
}
