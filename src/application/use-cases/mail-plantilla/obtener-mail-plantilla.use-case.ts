import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { MAIL_PLANTILLA_CORREO_REPOSITORY } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';

@Injectable()
export class ObtenerMailPlantillaUseCase {
  constructor(
    @Inject(MAIL_PLANTILLA_CORREO_REPOSITORY)
    private readonly repository: IMailPlantillaCorreoRepository,
  ) {}

  async execute(id: number) {
    const plantilla = await this.repository.obtenerPorId(id);
    if (!plantilla) {
      throw new NotFoundException('Plantilla de correo no encontrada');
    }
    return plantilla;
  }
}
