import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';

export class CerrarHabilitacionesVencidasUseCase {
  constructor(private readonly repository: IControlOperativoRepository) {}

  execute() {
    return this.repository.cerrarHabilitacionesVencidas();
  }
}
