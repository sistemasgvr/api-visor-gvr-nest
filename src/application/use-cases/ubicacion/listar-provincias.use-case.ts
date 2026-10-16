import type { IUbicacionRepository } from '../../../domain/repositories/ubicacion.repository.interface';
export class ListarProvinciasUseCase {
  constructor(private readonly ubicacion: IUbicacionRepository) {}
  execute(idDepartamento?: number) {
    return this.ubicacion.listarProvincias(idDepartamento);
  }
}
