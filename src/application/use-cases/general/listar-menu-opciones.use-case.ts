import type { IMenuRepository } from '../../../domain/repositories/menu.repository.interface';

export class ListarMenuOpcionesUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(): Promise<any[]> {
    const menuOpciones = await this.menuRepository.listarMenuOpciones();

    // Decode JSON fields if they are strings
    if (menuOpciones) {
      menuOpciones.forEach((menu) => {
        if (menu.opciones && typeof menu.opciones === 'string') {
          try {
            menu.opciones = JSON.parse(menu.opciones);
          } catch (e) {
            // Keep as is if parsing fails
          }
        }
      });
    }

    return menuOpciones || [];
  }
}
