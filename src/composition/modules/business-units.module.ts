import { Module } from '@nestjs/common';
import {
  BuscarBusinessUnitsUseCase,
  CrearOActualizarBusinessUnitsUseCase,
  ObtenerArbolBusinessUnitsUseCase,
  ObtenerBusinessUnitPorIdUseCase,
  ObtenerBusinessUnitsHijasUseCase,
  ObtenerBusinessUnitsUseCase,
} from '../../application/use-cases/acc/business-units';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { BusinessUnitsController } from '../../presentation/controllers/business-units.controller';
import { applicationProvider } from '../application.providers';

@Module({
  controllers: [BusinessUnitsController],
  providers: [
    applicationProvider(ObtenerBusinessUnitsUseCase),
    applicationProvider(ObtenerBusinessUnitPorIdUseCase),
    applicationProvider(ObtenerBusinessUnitsHijasUseCase),
    applicationProvider(ObtenerArbolBusinessUnitsUseCase),
    applicationProvider(BuscarBusinessUnitsUseCase),
    applicationProvider(CrearOActualizarBusinessUnitsUseCase),
    AutodeskApiService,
    HttpClientService,
  ],
})
export class BusinessUnitsModule {}
