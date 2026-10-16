import type { ExportarRevisionesPdfQueryDto } from '../inputs/acc/reviews/exportar-revisiones-pdf-query.dto';

/** Contrato de aplicación; la implementación y su configuración pertenecen a infraestructura. */
type RevisionRow = Record<string, unknown>;

export abstract class ExportacionRevisionesPdfPort {
  abstract generarPdf(
    userId: number,
    projectId: string,
    query: ExportarRevisionesPdfQueryDto,
  ): Promise<Buffer>;
}
