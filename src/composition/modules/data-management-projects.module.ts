import { Module } from '@nestjs/common';
import { DataManagementProjectsController } from '../../presentation/controllers/data-management-projects.controller';
import { applicationProvider } from '../application.providers';
import { DatabaseModule } from './platform/database.module';

// Use cases
import { CrearDescargaUseCase } from '../../application/use-cases/data-management/projects/crear-descarga.use-case';
import { CrearStorageUseCase } from '../../application/use-cases/data-management/projects/crear-storage.use-case';
import { ObtenerCarpetasPrincipalesUseCase } from '../../application/use-cases/data-management/projects/obtener-carpetas-principales.use-case';
import { ObtenerEstadoDescargaUseCase } from '../../application/use-cases/data-management/projects/obtener-estado-descarga.use-case';
import { ObtenerEstadoJobUseCase } from '../../application/use-cases/data-management/projects/obtener-estado-job.use-case';
import { ObtenerHubDeProyectoUseCase } from '../../application/use-cases/data-management/projects/obtener-hub-de-proyecto.use-case';
import { ObtenerProyectoHubPorIdUseCase } from '../../application/use-cases/data-management/projects/obtener-proyecto-hub-por-id.use-case';
import { ObtenerProyectosHubUseCase } from '../../application/use-cases/data-management/projects/obtener-proyectos-hub.use-case';

// Infrastructure
import { ACC_RESOURCES_REPOSITORY } from '../../domain/repositories/acc-resources.repository.interface';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AccResourcesRepository } from '../../infrastructure/repositories/acc-resources.repository';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DataManagementProjectsController],
  providers: [
    // Use cases
    applicationProvider(ObtenerProyectosHubUseCase),
    applicationProvider(ObtenerProyectoHubPorIdUseCase),
    applicationProvider(ObtenerHubDeProyectoUseCase),
    applicationProvider(ObtenerCarpetasPrincipalesUseCase),
    applicationProvider(CrearStorageUseCase),
    applicationProvider(CrearDescargaUseCase),
    applicationProvider(ObtenerEstadoDescargaUseCase),
    applicationProvider(ObtenerEstadoJobUseCase),
    // Infrastructure
    AutodeskApiService,
    HttpClientService,
    {
      provide: ACC_REPOSITORY,
      useClass: AccRepository,
    },
    {
      provide: ACC_RESOURCES_REPOSITORY,
      useClass: AccResourcesRepository,
    },
  ],
})
export class DataManagementProjectsModule {}
