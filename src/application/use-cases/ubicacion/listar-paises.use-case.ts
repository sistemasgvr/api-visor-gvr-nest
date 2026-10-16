import type { IUbicacionRepository } from '../../../domain/repositories/ubicacion.repository.interface';
export class ListarPaisesUseCase {
  constructor(private readonly ubicacion: IUbicacionRepository) {}
  execute() {
    return this.ubicacion.listarPaises();
  }
}
