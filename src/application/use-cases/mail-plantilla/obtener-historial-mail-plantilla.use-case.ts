import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class ObtenerHistorialMailPlantillaUseCase {
  constructor(private readonly repository: IMailPlantillaCorreoRepository) {}

  async execute(idHistorial: number) {
    const historial = await this.repository.obtenerHistorialPorId(idHistorial);
    if (!historial) {
      throw new NotFoundError('Versión histórica no encontrada');
    }
    return historial;
  }
}
