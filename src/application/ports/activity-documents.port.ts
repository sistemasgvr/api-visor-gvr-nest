import type {
  ActividadInformeServicioLinea,
  DatosReporteActividadesRow,
} from '../../domain/repositories/control-operativo.repository.interface';
export type ReporteActividadesPrimeraPaginaInput = {
  row: DatosReporteActividadesRow;
  fechaInicioYmd: string;
  fechaFinYmd: string;
  fechaEmisionYmd: string;
  actividadesDetalle?: ActividadInformeServicioLinea[];
  logoBuffer?: Buffer | null;
  logoMime?: 'png' | 'jpg' | null;
  firmaBuffer?: Buffer | null;
  firmaMime?: 'png' | 'jpg' | null;
  /**
   * Si false (defecto legal), no se muestra «Horas dedicadas» en el detalle por actividad.
   * Solo true para roles en `REPORTE_ACTIVIDAD_WORD_ROLES_CON_HORAS_DEDICADAS`.
   */
  incluirHorasDedicadasEnDetalle?: boolean;
};
export abstract class ActivityDocumentsPort {
  abstract loadImage(
    stored: string,
    options?: { maxEdgePx?: number },
  ): Promise<{ buffer: Buffer; mime: 'png' | 'jpg' } | null>;
  abstract render(input: ReporteActividadesPrimeraPaginaInput): Promise<Buffer>;
}
