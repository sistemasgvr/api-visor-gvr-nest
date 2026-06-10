import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { MAIL_PLANTILLA_CORREO_REPOSITORY } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';

@Injectable()
export class EliminarHistorialMailPlantillaUseCase {
  constructor(
    @Inject(MAIL_PLANTILLA_CORREO_REPOSITORY)
    private readonly repository: IMailPlantillaCorreoRepository,
  ) {}

  async execute(idHistorial: number, idUsuario: number) {
    const resultado = await this.repository.eliminarHistorial(idHistorial, idUsuario);
    if (!resultado.success) {
      throw new BadRequestException(
        resultado.message || 'Error al eliminar la versión histórica',
      );
    }

    return {
      message: resultado.message,
      idHistorial,
      idPlantilla: resultado.id_plantilla,
    };
  }
}
