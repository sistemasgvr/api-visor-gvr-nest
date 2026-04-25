import { Injectable } from '@nestjs/common';
import { ExportacionRevisionDetallePdfService } from '../../../../infrastructure/services/exportacion-revision-detalle-pdf.service';

@Injectable()
export class ExportarRevisionDetallePdfUseCase {
  constructor(
    private readonly exportacionRevisionDetallePdfService: ExportacionRevisionDetallePdfService,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    reviewId: string,
  ): Promise<{ data: Buffer; contentType: string; filename: string }> {
    const data = await this.exportacionRevisionDetallePdfService.generarPdf(
      userId,
      projectId,
      reviewId,
    );
    const safe = String(reviewId)
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .slice(0, 80);
    const filename = `revision_detalle_${safe}_${Date.now()}.pdf`;
    return {
      data,
      contentType: 'application/pdf',
      filename,
    };
  }
}
