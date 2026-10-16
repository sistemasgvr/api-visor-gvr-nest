import type {
  IPermisoRepository,
  ListarPermisosParams,
} from '../../../domain/repositories/permiso.repository.interface';

export class ListarPermisosUseCase {
  constructor(private readonly permisoRepository: IPermisoRepository) {}

  async execute(params: ListarPermisosParams) {
    return await this.permisoRepository.listarPermisos(params);
  }
}
