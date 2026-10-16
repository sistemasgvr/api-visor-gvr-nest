import type { IUbicacionRepository } from '../../../domain/repositories/ubicacion.repository.interface';
export class ListarDistritosUseCase {
  constructor(private readonly ubicacion: IUbicacionRepository) {}
  execute(idProvincia?: number) {
    return this.ubicacion.listarDistritos(idProvincia);
  }
}
