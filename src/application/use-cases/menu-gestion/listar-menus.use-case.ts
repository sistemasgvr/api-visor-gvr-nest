import type {
  IMenuGestionRepository,
  ListarMenusParams,
} from '../../../domain/repositories/menu-gestion.repository.interface';

export class ListarMenusUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(params: ListarMenusParams) {
    return await this.menuRepository.listarMenus(params);
  }
}
