import type {
  IControlOperativoRepository,
  ReporteGeneralResult,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { type IdsPermitidos, restringirIds } from './alcance.util';

export interface ListarReporteGeneralInput {
  idUsuario: number;
  idTrabajadores?: number[] | null;
  idProyectos?: number[] | null;
  idEstadosActividad?: number[] | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  /** Coordinador de proyecto / responsable / coordinador en actividad (opcional). */
  idLiderEquipo?: number | null;
  limit?: number;
  offset?: number;
  /** Proyectos del alcance de `control_operativo.reportes.ver_general` (`null` = todos). */
  proyectosPermitidos: IdsPermitidos;
}

export class ListarReporteGeneralUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    input: ListarReporteGeneralInput,
  ): Promise<ReporteGeneralResult> {
    return this.controlOperativoRepository.listarReporteGeneral({
      idTrabajadores: input.idTrabajadores ?? null,
      idProyectos: restringirIds(input.idProyectos, input.proyectosPermitidos),
      idEstadosActividad: input.idEstadosActividad ?? null,
      fechaInicio: input.fechaInicio ?? null,
      fechaFin: input.fechaFin ?? null,
      idLiderEquipo: input.idLiderEquipo ?? null,
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
    });
  }
}
