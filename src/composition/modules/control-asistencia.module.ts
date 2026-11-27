import { Module } from '@nestjs/common';
import { CONTROL_ASISTENCIA_REPOSITORY } from '../../domain/repositories/control-asistencia.repository.interface';
import { ControlAsistenciaRepository } from '../../infrastructure/repositories/control-asistencia.repository';
import { ControlAsistenciaController } from '../../presentation/controllers/control-asistencia.controller';
import { ObtenerEstadoAsistenciaUseCase } from '../../application/use-cases/control-asistencia/obtener-estado-asistencia.use-case';
import { MarcarAsistenciaUseCase } from '../../application/use-cases/control-asistencia/marcar-asistencia.use-case';
import { ListarAsistenciaMesUseCase } from '../../application/use-cases/control-asistencia/listar-asistencia-mes.use-case';
import { ExportarAsistenciaPdfUseCase } from '../../application/use-cases/control-asistencia/exportar-asistencia-pdf.use-case';
import { REPORTE_ASISTENCIA_PDF } from '../../application/ports/reporte-asistencia-pdf.port';
import { ReporteAsistenciaPdfService } from '../../infrastructure/services/reporte-asistencia-pdf.service';
import { applicationProvider } from '../application.providers';
import { AuthenticationModule } from './platform/authentication.module';
import { DatabaseModule } from './platform/database.module';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  controllers: [ControlAsistenciaController],
  providers: [
    {
      provide: CONTROL_ASISTENCIA_REPOSITORY,
      useClass: ControlAsistenciaRepository,
    },
    applicationProvider(ObtenerEstadoAsistenciaUseCase),
    applicationProvider(MarcarAsistenciaUseCase),
    applicationProvider(ListarAsistenciaMesUseCase),
    // HTML_PDF_GENERATOR lo expone PdfModule (global).
    { provide: REPORTE_ASISTENCIA_PDF, useClass: ReporteAsistenciaPdfService },
    applicationProvider(ExportarAsistenciaPdfUseCase),
  ],
})
export class ControlAsistenciaModule {}
