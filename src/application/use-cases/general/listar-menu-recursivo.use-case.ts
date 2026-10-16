import type { IMenuRepository } from '../../../domain/repositories/menu.repository.interface';
import { TokenServicePort } from '../../ports/runtime.port';

export class ListarMenuRecursivoUseCase {
  constructor(
    private readonly menuRepository: IMenuRepository,
    private readonly jwtService: TokenServicePort,
  ) {}

  async execute(token: string): Promise<any> {
    // Validate and decode token to get user ID
    const payload = await this.jwtService.verifyAsync(token);

    if (!payload || !payload.sub) {
      throw new Error('Token inválido');
    }

    const menuOpciones = await this.menuRepository.listarMenuRecursivo(
      payload.sub,
    );

    return menuOpciones || [];
  }
}
