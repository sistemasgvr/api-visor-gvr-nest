import { type IAuditoriaRepository } from '../../../domain/repositories/auditoria.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class ObtenerHistorialEntidadUseCase {
  constructor(private readonly auditoriaRepository: IAuditoriaRepository) {}

  async execute(entidad: string, identidad: string): Promise<any> {
    if (!entidad || !identidad) {
      throw new InvalidInputError('Entidad e identidad son requeridos');
    }

    const historial = await this.auditoriaRepository.obtenerHistorialEntidad(
      entidad,
      identidad,
    );

    return historial || [];
  }
}
