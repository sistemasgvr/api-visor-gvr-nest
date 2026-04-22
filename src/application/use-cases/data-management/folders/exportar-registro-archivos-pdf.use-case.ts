import { Injectable } from '@nestjs/common';
import { ExportacionRegistroArchivosPdfService } from '../../../../infrastructure/services/exportacion-registro-archivos-pdf.service';
import type { ExportarRegistroArchivosPdfDto } from '../../../dtos/data-management/folders/exportar-registro-archivos-pdf.dto';

@Injectable()
export class ExportarRegistroArchivosPdfUseCase {
  constructor(
    private readonly exportacionRegistroArchivosPdfService: ExportacionRegistroArchivosPdfService,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    folderId: string,
    dto: ExportarRegistroArchivosPdfDto,
  ): Promise<{ data: Buffer; contentType: string; filename: string }> {
    const data = await this.exportacionRegistroArchivosPdfService.generarPdf(
      userId,
      projectId,
      folderId,
      dto,
    );
    const safe = (dto.titulo || 'registro')
      .replace(/[^a-zA-Z0-9áéíóúüñÑ _-]+/g, '_')
      .trim()
      .slice(0, 60) || 'registro';
    return {
      data,
      contentType: 'application/pdf',
      filename: `export_${safe}_${Date.now()}.pdf`,
    };
  }
}
