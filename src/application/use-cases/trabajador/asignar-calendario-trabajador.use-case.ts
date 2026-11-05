import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
export class AsignarCalendarioTrabajadorUseCase {
  constructor(private readonly repository: ITrabajadorRepository) {}
  execute(
    actor: number,
    idTrabajador: number,
    datos: { idCalendario: number; idCalendarioAnterior: number | null },
  ) {
    return this.repository.asignarCalendario(
      actor,
      idTrabajador,
      datos.idCalendario,
      datos.idCalendarioAnterior,
    );
  }
}
