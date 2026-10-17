import { Module } from '@nestjs/common';
import {
  ActualizarImagenProyectoBim360UseCase,
  ActualizarProyectoBim360UseCase,
  CrearProyectoBim360UseCase,
  ObtenerIssueContainerIdUseCase,
  ObtenerProyectoPorIdLegacyUseCase,
  ObtenerProyectoPorIdNewUseCase,
  ObtenerProyectosLegacyUseCase,
  ObtenerProyectosNewUseCase,
} from '../../application/use-cases/bim360/projects';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { Bim360ProjectsController } from '../../presentation/controllers/bim360-projects.controller';

import { applicationProvider } from '../application.providers';

@Module({
  controllers: [Bim360ProjectsController],
  providers: [
    applicationProvider(CrearProyectoBim360UseCase),
    applicationProvider(ObtenerProyectosLegacyUseCase),
    applicationProvider(ObtenerProyectosNewUseCase),
    applicationProvider(ObtenerProyectoPorIdLegacyUseCase),
    applicationProvider(ObtenerProyectoPorIdNewUseCase),
    applicationProvider(ActualizarProyectoBim360UseCase),
    applicationProvider(ActualizarImagenProyectoBim360UseCase),
    applicationProvider(ObtenerIssueContainerIdUseCase),
    AutodeskApiService,
    HttpClientService,
  ],
})
export class Bim360ProjectsModule {}
