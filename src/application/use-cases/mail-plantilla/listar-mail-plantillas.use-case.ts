import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { ListMailPlantillaQueryDto } from '../../inputs/mail-plantilla/list-mail-plantilla-query.dto';

export class ListarMailPlantillasUseCase {
  constructor(private readonly repository: IMailPlantillaCorreoRepository) {}

  execute(query: ListMailPlantillaQueryDto) {
    return this.repository.listar({
      busqueda: query.busqueda,
      soloActivas: query.soloActivas,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
