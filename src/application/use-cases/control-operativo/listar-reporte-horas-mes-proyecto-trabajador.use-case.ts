import type {
  IControlOperativoRepository,
  ReporteHorasTrabajadorRangoParams,
  ReporteHorasTrabajadorRangoResult,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { type IdsPermitidos, restringirIds } from './alcance.util';

export interface ListarReporteHorasMesProyectoTrabajadorInput extends ReporteHorasTrabajadorRangoParams {
  idUsuario: number;
  /** Proyectos del alcance de `control_operativo.reportes.ver_horas_mes` (`null` = todos). */
  proyectosPermitidos: IdsPermitidos;
}

export class ListarReporteHorasMesProyectoTrabajadorUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    input: ListarReporteHorasMesProyectoTrabajadorInput,
  ): Promise<ReporteHorasTrabajadorRangoResult> {
    return this.controlOperativoRepository.listarReporteHorasDedicadasRangoPorTrabajador(
      {
        fechaInicio: input.fechaInicio,
        fechaFin: input.fechaFin,
        idTrabajadores: input.idTrabajadores ?? null,
        idProyectos: restringirIds(
          input.idProyectos,
          input.proyectosPermitidos,
        ),
        idEstadosActividad: input.idEstadosActividad ?? null,
        horasMetaDia: input.horasMetaDia,
      },
    );
  }
}
