import type { ExportarIncidenciasDto } from '../inputs/acc/issues/exportar-incidencias.dto';

/** Contrato de aplicación; la implementación y su configuración pertenecen a infraestructura. */

export abstract class ExportacionIncidenciasPort {
  abstract exportarPDF(
    userId: number,
    projectId: string,
    dto: ExportarIncidenciasDto,
  ): Promise<Buffer>;
  abstract exportarBCF(
    userId: number,
    projectId: string,
    dto: ExportarIncidenciasDto,
  ): Promise<Buffer>;
}
