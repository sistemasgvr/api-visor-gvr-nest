import { Injectable } from '@nestjs/common';
import { ExportacionPermisosCarpetaPdfService } from '../../../../infrastructure/services/exportacion-permisos-carpeta-pdf.service';
import type { ExportarPermisosCarpetaPdfDto } from '../../../dtos/data-management/folders/exportar-permisos-carpeta-pdf.dto';

@Injectable()
export class ExportarPermisosCarpetaPdfUseCase {
  constructor(
    private readonly exportacionPermisosCarpetaPdfService: ExportacionPermisosCarpetaPdfService,
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
    const safe = (dto.titulo || 'permisos-carpeta')
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
