import { Inject, Injectable } from '@nestjs/common';
import type { AsistenciaMes } from '../../domain/entities/asistencia.entity';
import { formatLimaDate } from '../../domain/utils/lima-date.util';
import {
  HTML_PDF_GENERATOR,
  type IHtmlPdfGenerator,
} from '../../application/ports/html-pdf-generator.interface';
import type {
  ArchivoReporte,
  ReporteAsistenciaPdfPort,
} from '../../application/ports/reporte-asistencia-pdf.port';
import {
  mapAsistenciaReporte,
  nombreArchivoAsistencia,
} from '../pdf/mappers/asistencia-report.mapper';

/** Registro mensual de asistencia con la plantilla HTML control-asistencia-report (A4 horizontal). */
@Injectable()
export class ReporteAsistenciaPdfService implements ReporteAsistenciaPdfPort {
  constructor(
    @Inject(HTML_PDF_GENERATOR)
    private readonly htmlPdf: IHtmlPdfGenerator,
  ) {}

  async generar(mes: AsistenciaMes): Promise<ArchivoReporte> {
    const generado = formatLimaDate(new Date(), 'es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    const contenido = await this.htmlPdf.renderPdfFromTemplate(
      'control-asistencia-report',
      mapAsistenciaReporte(mes, generado),
      {
        format: 'A4',
        landscape: true,
        margin: { top: '10mm', right: '10mm', bottom: '12mm', left: '10mm' },
      },
    );
    return { contenido, nombreArchivo: nombreArchivoAsistencia(mes, 'pdf') };
  }
}
