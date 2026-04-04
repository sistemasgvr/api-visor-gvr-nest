import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { GenerarPdfDemoUseCase } from 'src/application/use-cases/pdf/generar-pdf-demo.use-case';

/** Rutas de prueba / sandbox (sin auth). Ampliar aquí otros demos si hace falta. */
@ApiTags('demo')
@Controller('demo')
export class DemoController {
  constructor(private readonly generarPdfDemoUseCase: GenerarPdfDemoUseCase) {}

  @Get('pdf')
  @ApiOperation({
    summary:
      'Demo: PDF desde plantilla HTML sample-report (Puppeteer + Handlebars)',
    security: [],
  })
  async pdfDemo(
    @Query('titulo') titulo: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.generarPdfDemoUseCase.execute({ titulo });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="demo-visor-gvr.pdf"',
    );
    res.send(buffer);
  }
}
