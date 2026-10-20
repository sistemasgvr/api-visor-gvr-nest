import type {
  IControlOperativoRepository,
  LiderEquipoReporteGeneralItem,
} from '../../../domain/repositories/control-operativo.repository.interface';

/** Opciones del filtro «líder de equipo»; la ruta exige `control_operativo.reportes.ver_general`. */
export class ListarLideresEquipoReporteGeneralUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(): Promise<LiderEquipoReporteGeneralItem[]> {
    return this.controlOperativoRepository.listarLideresEquipoReporteGeneral();
  }
}
