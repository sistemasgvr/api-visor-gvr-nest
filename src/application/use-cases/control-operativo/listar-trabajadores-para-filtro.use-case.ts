import type { AuthorizationScope } from '../../ports/authorization.port';
import type {
  IControlOperativoRepository,
  TrabajadorParaFiltro,
} from '../../../domain/repositories/control-operativo.repository.interface';

export class ListarTrabajadoresParaFiltroUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  /** `alcances`: los concedidos de `control_operativo.jornadas.ver`. */
  async execute(
    idUsuario: number,
    alcances: readonly AuthorizationScope[],
  ): Promise<TrabajadorParaFiltro[]> {
    return this.controlOperativoRepository.listarTrabajadoresParaFiltro(
      idUsuario,
      alcances,
    );
  }
}
