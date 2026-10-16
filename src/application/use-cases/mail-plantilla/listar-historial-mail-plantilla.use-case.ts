import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';

export class ListarHistorialMailPlantillaUseCase {
  constructor(private readonly repository: IMailPlantillaCorreoRepository) {}

  execute(idPlantilla: number, limit = 20, offset = 0) {
    return this.repository.listarHistorial(idPlantilla, limit, offset);
  }
}
