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

// Use Cases — Workflows
import { ObtenerWorkflowsUseCase } from '../../application/use-cases/acc/reviews/obtener-workflows.use-case';
import { ObtenerWorkflowPorIdUseCase } from '../../application/use-cases/acc/reviews/obtener-workflow-por-id.use-case';
import { CrearWorkflowUseCase } from '../../application/use-cases/acc/reviews/crear-workflow.use-case';

// Use Cases — Versions
import { ObtenerApprovalStatusesVersionUseCase } from '../../application/use-cases/acc/reviews/obtener-approval-statuses-version.use-case';

import ObtenerTokenValidoHelper from '../../application/use-cases/acc/issues/obtener-token-valido.helper';

// Services
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { HttpClientService } from '../../shared/services/http-client.service';

// Repositories
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
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

        // Use Cases — Workflows
        ObtenerWorkflowsUseCase,
        ObtenerWorkflowPorIdUseCase,
        CrearWorkflowUseCase,

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
            provide: AUTH_REPOSITORY,
            useClass: AuthRepository,
        },
        DatabaseFunctionService,
    ],
})
export class AccReviewsModule { }
