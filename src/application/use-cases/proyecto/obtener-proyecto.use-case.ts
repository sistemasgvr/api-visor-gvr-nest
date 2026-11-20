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

    const [documentos, usuarios, actividades] = await Promise.all([
      this.proyectoRepository.listarDocumentosProyecto(idProyecto),
      this.proyectoRepository.listarUsuariosProyecto(idProyecto),
      this.proyectoRepository.obtenerRangoActividadesProyecto(idProyecto),
    ]);

    return {
      ...proyecto,
      documentos: documentos ?? [],
      usuarios: usuarios ?? [],
      // Rango de actividad real registrada (control operativo).
      actividades: actividades ?? {
        primeraActividad: null,
        ultimaActividad: null,
        diasTranscurridos: null,
        totalActividades: 0,
      },
    };
  }
}
