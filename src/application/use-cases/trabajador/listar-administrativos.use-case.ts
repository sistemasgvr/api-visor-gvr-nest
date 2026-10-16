import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';

export class ListarAdministrativosUseCase {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

  async execute() {
    return await this.trabajadorRepository.listarTrabajadoresAdministrativos();
  }
}
