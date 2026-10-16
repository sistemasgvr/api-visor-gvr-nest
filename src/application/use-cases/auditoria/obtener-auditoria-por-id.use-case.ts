import { type IAuditoriaRepository } from '../../../domain/repositories/auditoria.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class ObtenerAuditoriaPorIdUseCase {
  constructor(private readonly auditoriaRepository: IAuditoriaRepository) {}

  async execute(id: number): Promise<any> {
    const auditoria = await this.auditoriaRepository.obtenerAuditoriaPorId(id);

    if (!auditoria) {
      throw new NotFoundError('Auditoría no encontrada');
    }

    return auditoria;
  }
}
