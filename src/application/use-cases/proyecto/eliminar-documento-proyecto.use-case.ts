import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';

export class EliminarDocumentoProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(idDocumento: number, idUsuarioModificacion: number) {
    return this.proyectoRepository.eliminarDocumentoProyecto(
      idDocumento,
      idUsuarioModificacion,
    );
  }
}
