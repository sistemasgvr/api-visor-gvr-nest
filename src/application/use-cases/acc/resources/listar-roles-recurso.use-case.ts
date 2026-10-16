import type { IAccResourcesRepository } from '../../../../domain/repositories/acc-resources.repository.interface';

export class ListarRolesRecursoUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(resourceId: number) {
    return await this.accResourcesRepository.listarRolesRecurso(resourceId);
  }
}
