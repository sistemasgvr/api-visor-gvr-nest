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

@Module({
  controllers: [Bim360ProjectsController],
  providers: [
    CrearProyectoBim360UseCase,
    ObtenerProyectosLegacyUseCase,
    ObtenerProyectosNewUseCase,
    ObtenerProyectoPorIdLegacyUseCase,
    ObtenerProyectoPorIdNewUseCase,
    ActualizarProyectoBim360UseCase,
    ActualizarImagenProyectoBim360UseCase,
    ObtenerIssueContainerIdUseCase,
    AutodeskApiService,
    HttpClientService,
  ],
})
export class Bim360ProjectsModule {}
