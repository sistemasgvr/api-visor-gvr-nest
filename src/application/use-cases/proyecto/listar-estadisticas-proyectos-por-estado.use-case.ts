import type {
  IProyectoRepository,
  ProyectoPorEstadoItem,
} from '../../../domain/repositories/proyecto.repository.interface';

export class ListarEstadisticasProyectosPorEstadoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(): Promise<ProyectoPorEstadoItem[]> {
    return this.proyectoRepository.contarProyectosPorEstado();
  }
}
