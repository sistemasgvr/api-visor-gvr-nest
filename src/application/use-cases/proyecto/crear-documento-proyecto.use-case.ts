import type {
  CrearDocumentoProyectoData,
  IProyectoRepository,
} from '../../../domain/repositories/proyecto.repository.interface';

export class CrearDocumentoProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(
    idProyecto: number,
    data: CrearDocumentoProyectoData,
    idUsuarioCreacion: number,
  ) {
    return this.proyectoRepository.crearDocumentoProyecto(
      idProyecto,
      data,
      idUsuarioCreacion,
    );
  }
}
