import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { MAIL_PLANTILLA_CORREO_REPOSITORY } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { UpdateVariablesPruebaMailPlantillaDto } from '../../dtos/mail-plantilla/update-variables-prueba-mail-plantilla.dto';

@Injectable()
export class ActualizarVariablesPruebaMailPlantillaUseCase {
  constructor(
    @Inject(MAIL_PLANTILLA_CORREO_REPOSITORY)
    private readonly repository: IMailPlantillaCorreoRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateVariablesPruebaMailPlantillaDto,
    idUsuario: number,
  ) {
    const resultado = await this.repository.actualizarVariablesPrueba(
      id,
      idUsuario,
      dto.variablesPrueba ?? {},
    );

    if (!resultado.success) {
      throw new BadRequestException(
        resultado.message || 'Error al actualizar variables de prueba',
      );
    }

    return {
      message: resultado.message,
      id,
    };
  }
}
