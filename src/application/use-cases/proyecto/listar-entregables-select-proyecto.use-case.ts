import {
  type EntregableSelectOption,
  type IProyectoRepository,
} from '../../../domain/repositories/proyecto.repository.interface';

export class ListarEntregablesSelectProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(
    idProyecto: number,
    idUsuario?: number,
    esAdminSistemas = false,
  ): Promise<EntregableSelectOption[]> {
    if (idProyecto == null || idProyecto < 1) return [];
    return this.proyectoRepository.listarEntregablesParaSelect({
      idProyecto,
      idUsuario,
      esAdminSistemas,
    });
  }
}
