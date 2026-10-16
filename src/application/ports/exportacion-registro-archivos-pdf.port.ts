import type { ExportarRegistroArchivosPdfDto } from '../inputs/data-management/folders/exportar-registro-archivos-pdf.dto';

/** Contrato de aplicación; la implementación y su configuración pertenecen a infraestructura. */
type Fila = {
  ruta: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  version: string;
  modificado: string;
  atributosExtra: string;
};

export abstract class ExportacionRegistroArchivosPdfPort {
  abstract generarPdf(
    userId: number,
    projectId: string,
    folderId: string,
    dto: ExportarRegistroArchivosPdfDto,
  ): Promise<Buffer>;
}
