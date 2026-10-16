/** Contrato de aplicación; la implementación y su configuración pertenecen a infraestructura. */

export abstract class ExportacionRevisionDetallePdfPort {
  abstract generarPdf(
    userId: number,
    projectId: string,
    reviewIdParam: string,
  ): Promise<Buffer>;
}
