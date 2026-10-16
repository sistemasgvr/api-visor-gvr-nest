import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ObtenerHubsUseCase } from '../../application/use-cases/data-management/obtener-hubs.use-case';
import { ObtenerItemPorIdUseCase } from '../../application/use-cases/data-management/obtener-item-por-id.use-case';
import { ObtenerItemsUseCase } from '../../application/use-cases/data-management/obtener-items.use-case';
import { ObtenerProyectoPorIdUseCase } from '../../application/use-cases/data-management/obtener-proyecto-por-id.use-case';
import { ObtenerProyectosUseCase } from '../../application/use-cases/data-management/obtener-proyectos.use-case';
import { ObtenerVersionesItemUseCase } from '../../application/use-cases/data-management/obtener-versiones-item.use-case';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { DataManagementController } from '../../presentation/controllers/data-management.controller';
import { applicationProvider } from '../application.providers';
import { DatabaseModule } from './platform/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [DataManagementController],
  providers: [
    // Shared Services
    HttpClientService,
    AutodeskApiService,

    // Repository
    {
      provide: ACC_REPOSITORY,
      useClass: AccRepository,
    },

    // Use Cases
    applicationProvider(ObtenerHubsUseCase),
    applicationProvider(ObtenerProyectosUseCase),
    applicationProvider(ObtenerProyectoPorIdUseCase),
    applicationProvider(ObtenerItemsUseCase),
    applicationProvider(ObtenerItemPorIdUseCase),
    applicationProvider(ObtenerVersionesItemUseCase),
  ],
})
export class DataManagementModule {}
