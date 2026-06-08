import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { MAIL_PLANTILLA_CORREO_REPOSITORY } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';

@Injectable()
export class ObtenerHistorialMailPlantillaUseCase {
  constructor(
    @Inject(MAIL_PLANTILLA_CORREO_REPOSITORY)
    private readonly repository: IMailPlantillaCorreoRepository,
  ) {}

  async execute(idHistorial: number) {
    const historial = await this.repository.obtenerHistorialPorId(idHistorial);
    if (!historial) {
      throw new NotFoundException('Versión histórica no encontrada');
    }
    return historial;
  }
}
