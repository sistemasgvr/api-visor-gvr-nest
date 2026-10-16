import type { ExportarPermisosCarpetaPdfDto } from '../../../inputs/data-management/folders/exportar-permisos-carpeta-pdf.dto';
import { ExportacionPermisosCarpetaPdfPort } from '../../../ports/exportacion-permisos-carpeta-pdf.port';

export class ExportarPermisosCarpetaPdfUseCase {
  constructor(
    private readonly exportacionPermisosCarpetaPdfService: ExportacionPermisosCarpetaPdfPort,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    folderId: string,
    dto: ExportarPermisosCarpetaPdfDto,
  ): Promise<{ data: Buffer; contentType: string; filename: string }> {
    const data = await this.exportacionPermisosCarpetaPdfService.generarPdf(
      userId,
      projectId,
      folderId,
      dto,
    );
    const safe =
      (dto.titulo || 'permisos-carpeta')
        .replace(/[^a-zA-Z0-9áéíóúüñÑ _-]+/g, '_')
        .trim()
        .slice(0, 60) || 'permisos-carpeta';
    return {
      data,
      contentType: 'application/pdf',
      filename: `export_${safe}_${Date.now()}.pdf`,
    };
  }
}
