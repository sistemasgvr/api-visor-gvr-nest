import { Module } from '@nestjs/common';
import { AccReviewsController } from '../../presentation/controllers/acc-reviews.controller';
import { AccVersionsReviewsController } from '../../presentation/controllers/acc-versions-reviews.controller';
import { AccWorkflowsController } from '../../presentation/controllers/acc-workflows.controller';
import { applicationProvider } from '../application.providers';

// Use Cases — Reviews
import { AddComentarioArchivoUseCase } from '../../application/use-cases/acc/reviews/add-comentario-archivo.use-case';
import { AgregarReferenciaRevisionUseCase } from '../../application/use-cases/acc/reviews/agregar-referencia-revision.use-case';
import { AnularRevisionEntireUseCase } from '../../application/use-cases/acc/reviews/anular-revision-entire.use-case';
import { CrearRevisionUseCase } from '../../application/use-cases/acc/reviews/crear-revision.use-case';
import { DelegarPasoRevisionUseCase } from '../../application/use-cases/acc/reviews/delegar-paso-revision.use-case';
import { EliminarReferenciaRevisionUseCase } from '../../application/use-cases/acc/reviews/eliminar-referencia-revision.use-case';
import { EnviarResenaPasoUseCase } from '../../application/use-cases/acc/reviews/enviar-resena-paso.use-case';
import { ExportarRevisionDetallePdfUseCase } from '../../application/use-cases/acc/reviews/exportar-revision-detalle-pdf.use-case';
import { ExportarRevisionesPdfUseCase } from '../../application/use-cases/acc/reviews/exportar-revisiones-pdf.use-case';
import { GetComentariosArchivoUseCase } from '../../application/use-cases/acc/reviews/get-comentarios-archivo.use-case';
import { IniciarPasoRevisionUseCase } from '../../application/use-cases/acc/reviews/iniciar-paso-revision.use-case';
import { NotificarRevisoresRevisionUseCase } from '../../application/use-cases/acc/reviews/notificar-revisores-revision.use-case';
import { ObtenerProgresoRevisionUseCase } from '../../application/use-cases/acc/reviews/obtener-progreso-revision.use-case';
import { ObtenerReferenciasRevisionUseCase } from '../../application/use-cases/acc/reviews/obtener-referencias-revision.use-case';
import { ObtenerRevisionPorIdUseCase } from '../../application/use-cases/acc/reviews/obtener-revision-por-id.use-case';
import { ObtenerRevisionesUseCase } from '../../application/use-cases/acc/reviews/obtener-revisiones.use-case';
import { ObtenerVersionesRevisionUseCase } from '../../application/use-cases/acc/reviews/obtener-versiones-revision.use-case';
import { ObtenerWorkflowRevisionUseCase } from '../../application/use-cases/acc/reviews/obtener-workflow-revision.use-case';
import { SaltarPasoRevisionUseCase } from '../../application/use-cases/acc/reviews/saltar-paso-revision.use-case';
import { VolverPasoAnteriorRevisionUseCase } from '../../application/use-cases/acc/reviews/volver-paso-anterior-revision.use-case';

// Use Cases — Workflows
import { ActualizarFlujoRevisionGvrUseCase } from '../../application/use-cases/acc/reviews/actualizar-flujo-revision-gvr.use-case';
import { CambiarEstadoFlujoGvrUseCase } from '../../application/use-cases/acc/reviews/cambiar-estado-flujo-gvr.use-case';
import { CrearFlujoRevisionGvrUseCase } from '../../application/use-cases/acc/reviews/crear-flujo-revision-gvr.use-case';
import { GuardarWorkflowCandidatosUseCase } from '../../application/use-cases/acc/reviews/guardar-workflow-candidatos.use-case';
import { ObtenerWorkflowCandidatosUseCase } from '../../application/use-cases/acc/reviews/obtener-workflow-candidatos.use-case';
import { ObtenerWorkflowPorIdUseCase } from '../../application/use-cases/acc/reviews/obtener-workflow-por-id.use-case';
import { ObtenerWorkflowsUseCase } from '../../application/use-cases/acc/reviews/obtener-workflows.use-case';

// Use Cases — Versions
import { ObtenerApprovalStatusesVersionUseCase } from '../../application/use-cases/acc/reviews/obtener-approval-statuses-version.use-case';

import ObtenerTokenValidoHelper from '../../application/use-cases/acc/issues/obtener-token-valido.helper';

// Services
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';

// Repositories
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { AUDITORIA_REPOSITORY } from '../../domain/repositories/auditoria.repository.interface';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import { DatabaseFunctionService } from '../../infrastructure/database/database-function.service';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { AuditoriaRepository } from '../../infrastructure/repositories/auditoria.repository';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { PostgresInternalReviewsRepository } from '../../infrastructure/repositories/internal-reviews.repository';
import { ExportacionRevisionDetallePdfService } from '../../infrastructure/services/exportacion-revision-detalle-pdf.service';
import { ExportacionRevisionesPdfService } from '../../infrastructure/services/exportacion-revisiones-pdf.service';
import { BroadcastModule } from './broadcast.module';
import { StorageModule } from './platform/storage.module';

@Module({
  imports: [BroadcastModule, StorageModule],
  controllers: [
    AccReviewsController,
    AccWorkflowsController,
    AccVersionsReviewsController,
  ],
  providers: [
    // Helper compartido
    applicationProvider(ObtenerTokenValidoHelper),

    // Use Cases — Reviews
    applicationProvider(ObtenerRevisionesUseCase),
    applicationProvider(CrearRevisionUseCase),
    applicationProvider(ObtenerRevisionPorIdUseCase),
    applicationProvider(ObtenerWorkflowRevisionUseCase),
    applicationProvider(ObtenerProgresoRevisionUseCase),
    applicationProvider(ObtenerVersionesRevisionUseCase),
    applicationProvider(ObtenerReferenciasRevisionUseCase),
    applicationProvider(AgregarReferenciaRevisionUseCase),
    applicationProvider(EliminarReferenciaRevisionUseCase),
    applicationProvider(AnularRevisionEntireUseCase),
    applicationProvider(SaltarPasoRevisionUseCase),
    applicationProvider(VolverPasoAnteriorRevisionUseCase),
    applicationProvider(IniciarPasoRevisionUseCase),
    applicationProvider(DelegarPasoRevisionUseCase),
    applicationProvider(EnviarResenaPasoUseCase),
    applicationProvider(NotificarRevisoresRevisionUseCase),
    applicationProvider(GetComentariosArchivoUseCase),
    applicationProvider(AddComentarioArchivoUseCase),
    applicationProvider(ExportarRevisionesPdfUseCase),
    ExportacionRevisionesPdfService,
    applicationProvider(ExportarRevisionDetallePdfUseCase),
    ExportacionRevisionDetallePdfService,

    // Use Cases — Workflows
    applicationProvider(ObtenerWorkflowsUseCase),
    applicationProvider(ObtenerWorkflowPorIdUseCase),
    applicationProvider(CrearFlujoRevisionGvrUseCase),
    applicationProvider(ActualizarFlujoRevisionGvrUseCase),
    applicationProvider(CambiarEstadoFlujoGvrUseCase),
    applicationProvider(GuardarWorkflowCandidatosUseCase),
    applicationProvider(ObtenerWorkflowCandidatosUseCase),

    // Use Cases — Versions
    applicationProvider(ObtenerApprovalStatusesVersionUseCase),

    // Services
    AutodeskApiService,
    HttpClientService,

    // Repositories
    {
      provide: ACC_REPOSITORY,
      useClass: AccRepository,
    },
    {
      provide: AUDITORIA_REPOSITORY,
      useClass: AuditoriaRepository,
    },
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
    DatabaseFunctionService,
    PostgresInternalReviewsRepository,
  ],
})
export class AccReviewsModule {}
