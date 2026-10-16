import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';

export class ListarUsuariosProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(idProyecto: number) {
    return this.proyectoRepository.listarUsuariosProyecto(idProyecto);
  }
}
