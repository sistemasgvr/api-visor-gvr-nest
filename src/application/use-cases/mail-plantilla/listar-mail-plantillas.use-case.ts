import { Injectable, Inject } from '@nestjs/common';
import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { MAIL_PLANTILLA_CORREO_REPOSITORY } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { ListMailPlantillaQueryDto } from '../../dtos/mail-plantilla/list-mail-plantilla-query.dto';

@Injectable()
export class ListarMailPlantillasUseCase {
  constructor(
    @Inject(MAIL_PLANTILLA_CORREO_REPOSITORY)
    private readonly repository: IMailPlantillaCorreoRepository,
  ) {}

  execute(query: ListMailPlantillaQueryDto) {
    return this.repository.listar({
      busqueda: query.busqueda,
      soloActivas: query.soloActivas,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
