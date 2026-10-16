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

@Module({
  controllers: [BusinessUnitsController],
  providers: [
    ObtenerBusinessUnitsUseCase,
    ObtenerBusinessUnitPorIdUseCase,
    ObtenerBusinessUnitsHijasUseCase,
    ObtenerArbolBusinessUnitsUseCase,
    BuscarBusinessUnitsUseCase,
    CrearOActualizarBusinessUnitsUseCase,
    AutodeskApiService,
    HttpClientService,
  ],
})
export class BusinessUnitsModule {}
