import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';

export class ListarCalendariosPublicadosUseCase {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

  execute() {
    return this.trabajadorRepository.listarCalendariosPublicados();
  }
}
