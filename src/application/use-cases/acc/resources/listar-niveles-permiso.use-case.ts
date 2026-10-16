import type { IAccResourcesRepository } from '../../../../domain/repositories/acc-resources.repository.interface';

export class ListarNivelesPermisoUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute() {
    return await this.accResourcesRepository.listarNivelesPermiso();
  }
}
