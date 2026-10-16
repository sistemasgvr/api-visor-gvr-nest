import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';

export class ListarDocumentosProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(idProyecto: number) {
    return this.proyectoRepository.listarDocumentosProyecto(idProyecto);
  }
}
