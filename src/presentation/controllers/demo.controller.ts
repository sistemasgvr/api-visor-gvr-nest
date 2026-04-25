import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { GenerarPdfDemoUseCase } from 'src/application/use-cases/pdf/generar-pdf-demo.use-case';
import { EnviarCorreoBienvenidaDemoUseCase } from 'src/application/use-cases/demo/enviar-correo-bienvenida-demo.use-case';
import { ApiResponseDto } from 'src/shared/dtos/api-response.dto';

/** Rutas de prueba / sandbox (sin auth). Ampliar aquí otros demos si hace falta. */
@ApiTags('demo')
@Controller('demo')
export class DemoController {
  constructor(
    private readonly generarPdfDemoUseCase: GenerarPdfDemoUseCase,
    private readonly enviarCorreoBienvenidaDemoUseCase: EnviarCorreoBienvenidaDemoUseCase,
  ) {}

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

  /**
   * Demo mail: busca trabajador por id (tratrabajador), lee su correo y envía plantilla welcome.
   * GET /api/demo/mail-bienvenida/:idTrabajador (según prefijo global de la app)
   */
  @Get('mail-bienvenida/:idTrabajador')
  @ApiOperation({
    summary:
      'Demo: correo de bienvenida al correo del trabajador (por id trabajador, sin auth)',
    security: [],
  })
  async mailBienvenidaDemo(
    @Param('idTrabajador', ParseIntPipe) idTrabajador: number,
  ) {
    const data =
      await this.enviarCorreoBienvenidaDemoUseCase.execute(idTrabajador);
    return ApiResponseDto.success(
      data,
      'Correo de bienvenida encolado o enviado; revisa MAIL_* y la bandeja del destinatario',
    );
  }
}
