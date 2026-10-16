import { Module } from '@nestjs/common';
import {
  ActualizarCompanyUseCase,
  BuscarCompaniesUseCase,
  CrearCompanyUseCase,
  ImportarCompaniesUseCase,
  ObtenerCompaniesProyectoUseCase,
  ObtenerCompaniesUseCase,
  ObtenerCompanyPorIdUseCase,
  SubirImagenCompanyUseCase,
} from '../../application/use-cases/acc/companies';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import {
  CompaniesController,
  ProjectsCompaniesController,
} from '../../presentation/controllers/companies.controller';

@Module({
  controllers: [CompaniesController, ProjectsCompaniesController],
  providers: [
    CrearCompanyUseCase,
    ImportarCompaniesUseCase,
    ObtenerCompaniesUseCase,
    ObtenerCompanyPorIdUseCase,
    BuscarCompaniesUseCase,
    ObtenerCompaniesProyectoUseCase,
    ActualizarCompanyUseCase,
    SubirImagenCompanyUseCase,
    AutodeskApiService,
    HttpClientService,
  ],
})
export class CompaniesModule {}
