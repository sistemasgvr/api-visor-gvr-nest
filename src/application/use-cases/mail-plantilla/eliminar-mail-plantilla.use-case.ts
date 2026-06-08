import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { MAIL_PLANTILLA_CORREO_REPOSITORY } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';

@Injectable()
export class EliminarMailPlantillaUseCase {
  constructor(
    @Inject(MAIL_PLANTILLA_CORREO_REPOSITORY)
    private readonly repository: IMailPlantillaCorreoRepository,
  ) {}

  async execute(id: number, idUsuario: number) {
    const resultado = await this.repository.eliminar(id, idUsuario);
    if (!resultado.success) {
      throw new BadRequestException(
        resultado.message || 'Error al eliminar la plantilla',
      );
    }
    return { message: resultado.message, id };
  }
}
