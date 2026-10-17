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

import { applicationProvider } from '../application.providers';

@Module({
  controllers: [CompaniesController, ProjectsCompaniesController],
  providers: [
    applicationProvider(CrearCompanyUseCase),
    applicationProvider(ImportarCompaniesUseCase),
    applicationProvider(ObtenerCompaniesUseCase),
    applicationProvider(ObtenerCompanyPorIdUseCase),
    applicationProvider(BuscarCompaniesUseCase),
    applicationProvider(ObtenerCompaniesProyectoUseCase),
    applicationProvider(ActualizarCompanyUseCase),
    applicationProvider(SubirImagenCompanyUseCase),
    AutodeskApiService,
    HttpClientService,
  ],
})
export class CompaniesModule {}
