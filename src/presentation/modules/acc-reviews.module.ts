import { Module } from '@nestjs/common';
import { AccReviewsController } from '../controllers/acc-reviews.controller';
import { AccWorkflowsController } from '../controllers/acc-workflows.controller';
import { AccVersionsReviewsController } from '../controllers/acc-versions-reviews.controller';

// Use Cases — Reviews
import { ObtenerRevisionesUseCase } from '../../application/use-cases/acc/reviews/obtener-revisiones.use-case';
import { CrearRevisionUseCase } from '../../application/use-cases/acc/reviews/crear-revision.use-case';
import { ObtenerRevisionPorIdUseCase } from '../../application/use-cases/acc/reviews/obtener-revision-por-id.use-case';
import { ObtenerWorkflowRevisionUseCase } from '../../application/use-cases/acc/reviews/obtener-workflow-revision.use-case';
import { ObtenerProgresoRevisionUseCase } from '../../application/use-cases/acc/reviews/obtener-progreso-revision.use-case';
import { ObtenerVersionesRevisionUseCase } from '../../application/use-cases/acc/reviews/obtener-versiones-revision.use-case';
import { ObtenerReferenciasRevisionUseCase } from '../../application/use-cases/acc/reviews/obtener-referencias-revision.use-case';
import { AgregarReferenciaRevisionUseCase } from '../../application/use-cases/acc/reviews/agregar-referencia-revision.use-case';
import { EliminarReferenciaRevisionUseCase } from '../../application/use-cases/acc/reviews/eliminar-referencia-revision.use-case';
import { AnularRevisionEntireUseCase } from '../../application/use-cases/acc/reviews/anular-revision-entire.use-case';
import { SaltarPasoRevisionUseCase } from '../../application/use-cases/acc/reviews/saltar-paso-revision.use-case';
import { VolverPasoAnteriorRevisionUseCase } from '../../application/use-cases/acc/reviews/volver-paso-anterior-revision.use-case';
import { IniciarPasoRevisionUseCase } from '../../application/use-cases/acc/reviews/iniciar-paso-revision.use-case';
import { DelegarPasoRevisionUseCase } from '../../application/use-cases/acc/reviews/delegar-paso-revision.use-case';
import { EnviarResenaPasoUseCase } from '../../application/use-cases/acc/reviews/enviar-resena-paso.use-case';
import { NotificarRevisoresRevisionUseCase } from '../../application/use-cases/acc/reviews/notificar-revisores-revision.use-case';
import { GetComentariosArchivoUseCase } from '../../application/use-cases/acc/reviews/get-comentarios-archivo.use-case';
import { AddComentarioArchivoUseCase } from '../../application/use-cases/acc/reviews/add-comentario-archivo.use-case';

// Use Cases — Workflows
import { ObtenerWorkflowsUseCase } from '../../application/use-cases/acc/reviews/obtener-workflows.use-case';
import { ObtenerWorkflowPorIdUseCase } from '../../application/use-cases/acc/reviews/obtener-workflow-por-id.use-case';
import { CrearFlujoRevisionGvrUseCase } from '../../application/use-cases/acc/reviews/crear-flujo-revision-gvr.use-case';
import { ActualizarFlujoRevisionGvrUseCase } from '../../application/use-cases/acc/reviews/actualizar-flujo-revision-gvr.use-case';
import { CambiarEstadoFlujoGvrUseCase } from '../../application/use-cases/acc/reviews/cambiar-estado-flujo-gvr.use-case';
import { GuardarWorkflowCandidatosUseCase } from '../../application/use-cases/acc/reviews/guardar-workflow-candidatos.use-case';
import { ObtenerWorkflowCandidatosUseCase } from '../../application/use-cases/acc/reviews/obtener-workflow-candidatos.use-case';

// Use Cases — Versions
import { ObtenerApprovalStatusesVersionUseCase } from '../../application/use-cases/acc/reviews/obtener-approval-statuses-version.use-case';

import ObtenerTokenValidoHelper from '../../application/use-cases/acc/issues/obtener-token-valido.helper';

// Services
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { HttpClientService } from '../../shared/services/http-client.service';

// Repositories
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { AuditoriaRepository } from '../../infrastructure/repositories/auditoria.repository';
import { AUDITORIA_REPOSITORY } from '../../domain/repositories/auditoria.repository.interface';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import { DatabaseFunctionService } from '../../infrastructure/database/database-function.service';
import { BroadcastModule } from './broadcast.module';

@Module({
    imports: [BroadcastModule],
    controllers: [AccReviewsController, AccWorkflowsController, AccVersionsReviewsController],
    providers: [
        // Helper compartido
        ObtenerTokenValidoHelper,

        // Use Cases — Reviews
        ObtenerRevisionesUseCase,
        CrearRevisionUseCase,
        ObtenerRevisionPorIdUseCase,
        ObtenerWorkflowRevisionUseCase,
        ObtenerProgresoRevisionUseCase,
        ObtenerVersionesRevisionUseCase,
        ObtenerReferenciasRevisionUseCase,
        AgregarReferenciaRevisionUseCase,
        EliminarReferenciaRevisionUseCase,
        AnularRevisionEntireUseCase,
        SaltarPasoRevisionUseCase,
        VolverPasoAnteriorRevisionUseCase,
        IniciarPasoRevisionUseCase,
        DelegarPasoRevisionUseCase,
        EnviarResenaPasoUseCase,
        NotificarRevisoresRevisionUseCase,
        GetComentariosArchivoUseCase,
        AddComentarioArchivoUseCase,

        // Use Cases — Workflows
        ObtenerWorkflowsUseCase,
        ObtenerWorkflowPorIdUseCase,
        CrearFlujoRevisionGvrUseCase,
        ActualizarFlujoRevisionGvrUseCase,
        CambiarEstadoFlujoGvrUseCase,
        GuardarWorkflowCandidatosUseCase,
        ObtenerWorkflowCandidatosUseCase,

        // Use Cases — Versions
        ObtenerApprovalStatusesVersionUseCase,

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
    ],
})
export class AccReviewsModule { }
