import { Injectable, Inject } from '@nestjs/common';
import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { MAIL_PLANTILLA_CORREO_REPOSITORY } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';

@Injectable()
export class SembrarMailPlantillasSistemaUseCase {
  constructor(
    @Inject(MAIL_PLANTILLA_CORREO_REPOSITORY)
    private readonly repository: IMailPlantillaCorreoRepository,
  ) {}

  async execute(idUsuario?: number) {
    const resultados = await this.repository.sembrarPlantillasSistema(idUsuario);
    return {
      message: 'Plantillas de sistema procesadas',
      plantillas: resultados,
    };
  }
}
