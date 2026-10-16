import type {
  ITrabajadorRepository,
  ListarTrabajadoresParams,
} from '../../../domain/repositories/trabajador.repository.interface';

export class ListarTrabajadoresUseCase {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

  async execute(params: ListarTrabajadoresParams) {
    return await this.trabajadorRepository.listarTrabajadores(params);
  }
}
