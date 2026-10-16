import { Module } from '@nestjs/common';
import {
  ActualizarVersionUseCase,
  CrearReferenciaUseCase,
  CrearVersionUseCase,
  ObtenerDescargasUseCase,
  ObtenerFormatosDescargaUseCase,
  ObtenerItemUseCase,
  ObtenerReferenciasUseCase,
  ObtenerRelacionesLinksUseCase,
  ObtenerRelacionesRefsUseCase,
  ObtenerVersionPorIdUseCase,
} from '../../application/use-cases/data-management/versions';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { DatabaseFunctionService } from '../../infrastructure/database/database-function.service';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { DataManagementVersionsController } from '../../presentation/controllers/data-management-versions.controller';

@Module({
  controllers: [DataManagementVersionsController],
  providers: [
    ObtenerVersionPorIdUseCase,
    ObtenerFormatosDescargaUseCase,
    ObtenerDescargasUseCase,
    ObtenerItemUseCase,
    ObtenerReferenciasUseCase,
    ObtenerRelacionesLinksUseCase,
    ObtenerRelacionesRefsUseCase,
    CrearVersionUseCase,
    CrearReferenciaUseCase,
    ActualizarVersionUseCase,
    AutodeskApiService,
    HttpClientService,
    {
      provide: ACC_REPOSITORY,
      useClass: AccRepository,
    },
    DatabaseFunctionService,
  ],
})
export class DataManagementVersionsModule {}
