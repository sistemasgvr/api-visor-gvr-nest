import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class EliminarHistorialMailPlantillaUseCase {
  constructor(private readonly repository: IMailPlantillaCorreoRepository) {}

  async execute(idHistorial: number, idUsuario: number) {
    const resultado = await this.repository.eliminarHistorial(
      idHistorial,
      idUsuario,
    );
    if (!resultado.success) {
      throw new InvalidInputError(
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
