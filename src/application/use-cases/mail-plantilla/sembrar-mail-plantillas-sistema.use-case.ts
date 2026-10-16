import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';

export class SembrarMailPlantillasSistemaUseCase {
  constructor(private readonly repository: IMailPlantillaCorreoRepository) {}

  async execute(idUsuario?: number) {
    const resultados =
      await this.repository.sembrarPlantillasSistema(idUsuario);
    return {
      message: 'Plantillas de sistema procesadas',
      plantillas: resultados,
    };
  }
}
