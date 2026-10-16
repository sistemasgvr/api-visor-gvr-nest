import { type IAccVisorMarcaRevisionRepository } from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';
import { NotFoundError } from '../../../errors/application.error';

export class ObtenerVisorMarcaRevisionUseCase {
  constructor(private readonly repository: IAccVisorMarcaRevisionRepository) {}

  async execute(id: number, idUsuario: number) {
    const data = await this.repository.obtenerPorId(id, idUsuario);
    if (!data) {
      throw new NotFoundError('Marca de revisión no encontrada o sin permiso');
    }
    return data;
  }
}
