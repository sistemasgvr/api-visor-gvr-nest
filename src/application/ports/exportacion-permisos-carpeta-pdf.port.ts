import type { ExportarPermisosCarpetaPdfDto } from '../inputs/data-management/folders/exportar-permisos-carpeta-pdf.dto';

/** Contrato de aplicación; la implementación y su configuración pertenecen a infraestructura. */
type Fila = {
  carpeta: string;
  usuario: string;
  email: string;
  nivel: string;
};

export abstract class ExportacionPermisosCarpetaPdfPort {
  abstract generarPdf(
    userId: number,
    projectId: string,
    folderId: string,
    dto: ExportarPermisosCarpetaPdfDto,
  ): Promise<Buffer>;
}
