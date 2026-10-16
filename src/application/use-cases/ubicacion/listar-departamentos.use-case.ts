import type { IUbicacionRepository } from '../../../domain/repositories/ubicacion.repository.interface';
export class ListarDepartamentosUseCase {
  constructor(private readonly ubicacion: IUbicacionRepository) {}
  execute(idPais?: number) {
    return this.ubicacion.listarDepartamentos(idPais);
  }
}
