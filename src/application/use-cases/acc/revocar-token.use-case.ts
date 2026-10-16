import type { IAccRepository } from '../../../domain/repositories/acc.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class RevocarTokenUseCase {
  constructor(private readonly accRepository: IAccRepository) {}

  async execute(idUsuario: number): Promise<void> {
    // Get user's current token
    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(idUsuario);

    if (!token) {
      throw new NotFoundError('No se encontró token activo para este usuario');
    }

    // Revoke the token
    await this.accRepository.revocarToken3Legged(token.id!);
  }
}
