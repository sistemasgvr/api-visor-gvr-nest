import type {
  ActualizarDocumentoProyectoData,
  IProyectoRepository,
} from '../../../domain/repositories/proyecto.repository.interface';

export class ActualizarDocumentoProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(
    idDocumento: number,
    data: ActualizarDocumentoProyectoData,
    idUsuarioModificacion: number,
  ) {
    return this.proyectoRepository.actualizarDocumentoProyecto(
      idDocumento,
      data,
      idUsuarioModificacion,
    );
  }
}
