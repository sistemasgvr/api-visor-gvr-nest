import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { UpdateVariablesPruebaMailPlantillaDto } from '../../inputs/mail-plantilla/update-variables-prueba-mail-plantilla.dto';

export class ActualizarVariablesPruebaMailPlantillaUseCase {
  constructor(private readonly repository: IMailPlantillaCorreoRepository) {}

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
      throw new InvalidInputError(
        resultado.message || 'Error al actualizar variables de prueba',
      );
    }

    return {
      message: resultado.message,
      id,
    };
  }
}
