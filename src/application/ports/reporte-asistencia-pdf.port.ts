import type { AsistenciaMes } from '../../domain/entities/asistencia.entity';

/** Contrato de aplicación; la plantilla y el generador PDF pertenecen a infraestructura. */
export const REPORTE_ASISTENCIA_PDF = Symbol('REPORTE_ASISTENCIA_PDF');

export interface ArchivoReporte {
  contenido: Buffer;
  nombreArchivo: string;
}

export interface ReporteAsistenciaPdfPort {
  /** Registro mensual de control de asistencia y salida (D.S. 004-2006-TR). */
  generar(mes: AsistenciaMes): Promise<ArchivoReporte>;
}
