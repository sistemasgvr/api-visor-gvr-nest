import type {
  IControlOperativoRepository,
  ReporteHorasRangoTrabajadorProyectoDetalleResult,
  ReporteHorasTrabajadorRangoDetalleProyectoParams,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { type IdsPermitidos, restringirIds } from './alcance.util';

export interface ListarReporteHorasRangoDetalleProyectoInput extends ReporteHorasTrabajadorRangoDetalleProyectoParams {
  idUsuario: number;
  /** Proyectos del alcance del reporte de horas (`null` = todos). */
  proyectosPermitidos: IdsPermitidos;
}

export class ListarReporteHorasRangoDetalleProyectoUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    input: ListarReporteHorasRangoDetalleProyectoInput,
  ): Promise<ReporteHorasRangoTrabajadorProyectoDetalleResult> {
    return this.controlOperativoRepository.listarReporteHorasDedicadasRangoPorTrabajadorYProyecto(
      {
        fechaInicio: input.fechaInicio,
        fechaFin: input.fechaFin,
        idTrabajadores: input.idTrabajadores ?? null,
        idProyectos: restringirIds(
          input.idProyectos,
          input.proyectosPermitidos,
        ),
        idEstadosActividad: input.idEstadosActividad ?? null,
      },
    );
  }
}
