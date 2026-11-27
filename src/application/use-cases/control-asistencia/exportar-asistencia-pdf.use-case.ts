import type { IControlAsistenciaRepository } from '../../../domain/repositories/control-asistencia.repository.interface';
import type { ReporteAsistenciaPdfPort } from '../../ports/reporte-asistencia-pdf.port';

export class ExportarAsistenciaPdfUseCase {
  constructor(
    private readonly repository: IControlAsistenciaRepository,
    private readonly reporte: ReporteAsistenciaPdfPort,
  ) {}

  async execute(
    idUsuario: number,
    idTrabajador: number | null,
    anio: number,
    mes: number,
  ) {
    const asistencia = await this.repository.listarMes(
      idUsuario,
      idTrabajador,
      anio,
      mes,
    );
    return this.reporte.generar(asistencia);
  }
}
