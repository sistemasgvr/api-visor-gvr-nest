import { Injectable } from '@nestjs/common';
import { ExportacionRevisionesPdfService } from '../../../../infrastructure/services/exportacion-revisiones-pdf.service';
import type { ExportarRevisionesPdfQueryDto } from '../../../dtos/acc/reviews/exportar-revisiones-pdf-query.dto';

@Injectable()
export class ExportarRevisionesPdfUseCase {
  constructor(
    private readonly exportacionRevisionesPdfService: ExportacionRevisionesPdfService,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    query: ExportarRevisionesPdfQueryDto,
  ): Promise<{ data: Buffer; contentType: string; filename: string }> {
    const data = await this.exportacionRevisionesPdfService.generarPdf(
      userId,
      projectId,
      query,
    );
    const safeId = projectId.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);
    const filename = `revisiones_${safeId}_${Date.now()}.pdf`;
    return {
      data,
      contentType: 'application/pdf',
      filename,
    };
  }
}
