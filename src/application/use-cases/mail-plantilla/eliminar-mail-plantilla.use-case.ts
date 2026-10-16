import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class EliminarMailPlantillaUseCase {
  constructor(private readonly repository: IMailPlantillaCorreoRepository) {}

  async execute(id: number, idUsuario: number) {
    const resultado = await this.repository.eliminar(id, idUsuario);
    if (!resultado.success) {
      throw new InvalidInputError(
        resultado.message || 'Error al eliminar la plantilla',
      );
    }
    return { message: resultado.message, id };
  }
}
