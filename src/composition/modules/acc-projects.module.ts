import { Module } from '@nestjs/common';
import { AccProjectsController } from '../../presentation/controllers/acc-projects.controller';
import { applicationProvider } from '../application.providers';

// Use Cases
import { ActivarServicioProyectoUseCase } from '../../application/use-cases/acc/projects/activar-servicio-proyecto.use-case';
import { ActualizarProyectoUseCase } from '../../application/use-cases/acc/projects/actualizar-proyecto.use-case';
import { ClonarProyectoUseCase } from '../../application/use-cases/acc/projects/clonar-proyecto.use-case';
import { CrearProyectoUseCase } from '../../application/use-cases/acc/projects/crear-proyecto.use-case';
import { DesactivarServicioProyectoUseCase } from '../../application/use-cases/acc/projects/desactivar-servicio-proyecto.use-case';
import { GetPlantillasUseCase } from '../../application/use-cases/acc/projects/get-plantillas.use-case';
import { GetProyectoPorIdUseCase } from '../../application/use-cases/acc/projects/get-proyecto-por-id.use-case';
import { GetProyectosActivosUseCase } from '../../application/use-cases/acc/projects/get-proyectos-activos.use-case';
import { GetProyectosPorTipoUseCase } from '../../application/use-cases/acc/projects/get-proyectos-por-tipo.use-case';
import { GetProyectosUseCase } from '../../application/use-cases/acc/projects/get-proyectos.use-case';
import { SubirImagenProyectoUseCase } from '../../application/use-cases/acc/projects/subir-imagen-proyecto.use-case';

// Services
import ObtenerTokenValidoHelper from '../../application/use-cases/acc/issues/obtener-token-valido.helper';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { SharpAccProjectImagePreparerService } from '../../infrastructure/images/sharp-acc-project-image-preparer.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';

// Repositories
import { ACC_RESOURCES_REPOSITORY } from '../../domain/repositories/acc-resources.repository.interface';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { AUDITORIA_REPOSITORY } from '../../domain/repositories/auditoria.repository.interface';
import { DatabaseFunctionService } from '../../infrastructure/database/database-function.service';
import { AccResourcesRepository } from '../../infrastructure/repositories/acc-resources.repository';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { AuditoriaRepository } from '../../infrastructure/repositories/auditoria.repository';
import { DatabaseModule } from './platform/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AccProjectsController],
  providers: [
    // Helpers
    applicationProvider(ObtenerTokenValidoHelper),

    // Use Cases
    applicationProvider(GetProyectosUseCase),
    applicationProvider(GetProyectoPorIdUseCase),
    applicationProvider(GetPlantillasUseCase),
    applicationProvider(GetProyectosPorTipoUseCase),
    applicationProvider(GetProyectosActivosUseCase),
    applicationProvider(CrearProyectoUseCase),
    applicationProvider(ClonarProyectoUseCase),
    applicationProvider(ActualizarProyectoUseCase),
    applicationProvider(SubirImagenProyectoUseCase),
    applicationProvider(ActivarServicioProyectoUseCase),
    applicationProvider(DesactivarServicioProyectoUseCase),

    // Services
    AutodeskApiService,
    SharpAccProjectImagePreparerService,
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
      provide: ACC_RESOURCES_REPOSITORY,
      useClass: AccResourcesRepository,
    },
    DatabaseFunctionService,
  ],
})
export class AccProjectsModule {}
