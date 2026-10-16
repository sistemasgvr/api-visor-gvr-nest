import type { ExportarRevisionesPdfQueryDto } from '../../../inputs/acc/reviews/exportar-revisiones-pdf-query.dto';
import { ExportacionRevisionesPdfPort } from '../../../ports/exportacion-revisiones-pdf.port';

export class ExportarRevisionesPdfUseCase {
  constructor(
    private readonly exportacionRevisionesPdfService: ExportacionRevisionesPdfPort,
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
