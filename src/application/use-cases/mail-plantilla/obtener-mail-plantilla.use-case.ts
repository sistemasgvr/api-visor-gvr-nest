import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class ObtenerMailPlantillaUseCase {
  constructor(private readonly repository: IMailPlantillaCorreoRepository) {}

  async execute(id: number) {
    const plantilla = await this.repository.obtenerPorId(id);
    if (!plantilla) {
      throw new NotFoundError('Plantilla de correo no encontrada');
    }
    return plantilla;
  }
}
