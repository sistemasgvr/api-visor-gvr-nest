import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';

export class EliminarActividadUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(idActividad: number, idUsuario: number): Promise<boolean> {
    return this.controlOperativoRepository.eliminarActividad(
      idActividad,
      idUsuario,
    );
  }
}
