import type {
  IProyectoRepository,
  ListarEntregablesProyectoParams,
} from '../../../domain/repositories/proyecto.repository.interface';

export class ListarEntregablesProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(
    params: ListarEntregablesProyectoParams,
    idUsuario?: number,
    esAdminSistemas = false,
  ) {
    return this.proyectoRepository.listarEntregablesProyecto({
      ...params,
      idUsuario,
      soloVigentes: params.soloVigentes ?? true,
      esAdminSistemas,
    });
  }
}
