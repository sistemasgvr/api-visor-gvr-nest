import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class ObtenerProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(idProyecto: number) {
    const proyecto =
      await this.proyectoRepository.obtenerProyectoPorId(idProyecto);

    if (!proyecto) {
      throw new NotFoundError('Proyecto no encontrado');
    }

    const [documentos, usuarios] = await Promise.all([
      this.proyectoRepository.listarDocumentosProyecto(idProyecto),
      this.proyectoRepository.listarUsuariosProyecto(idProyecto),
    ]);

    return {
      ...proyecto,
      documentos: documentos ?? [],
      usuarios: usuarios ?? [],
    };
  }
}
