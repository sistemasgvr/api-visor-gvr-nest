import type { IRolRepository } from '../../../domain/repositories/rol.repository.interface';

export class ListarPermisosDisponiblesUseCase {
  constructor(private readonly rolRepository: IRolRepository) {}

  async execute(idRol: number) {
    return await this.rolRepository.listarPermisosDisponibles(idRol);
  }
}
