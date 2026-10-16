import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CallbackAutorizacionUseCase } from '../../application/use-cases/acc/callback-autorizacion.use-case';
import { CronRefrescarTokensAccUseCase } from '../../application/use-cases/acc/cron-refrescar-tokens-acc.use-case';
import { GenerarUrlAutorizacionUseCase } from '../../application/use-cases/acc/generar-url-autorizacion.use-case';
import { ObtenerMiTokenUseCase } from '../../application/use-cases/acc/obtener-mi-token.use-case';
import { ObtenerToken2LeggedUseCase } from '../../application/use-cases/acc/obtener-token-2legged.use-case';
import { RefrescarToken3LeggedUseCase } from '../../application/use-cases/acc/refrescar-token-3legged.use-case';
import { RevocarTokenUseCase } from '../../application/use-cases/acc/revocar-token.use-case';
import { ValidarExpiracionUseCase } from '../../application/use-cases/acc/validar-expiracion.use-case';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { AccController } from '../../presentation/controllers/acc.controller';
import { applicationProvider } from '../application.providers';
import { DatabaseModule } from './platform/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [AccController],
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
    applicationProvider(ObtenerToken2LeggedUseCase),
    applicationProvider(GenerarUrlAutorizacionUseCase),
    applicationProvider(ObtenerMiTokenUseCase),
    applicationProvider(CallbackAutorizacionUseCase),
    applicationProvider(RefrescarToken3LeggedUseCase),
    applicationProvider(CronRefrescarTokensAccUseCase),
    applicationProvider(RevocarTokenUseCase),
    applicationProvider(ValidarExpiracionUseCase),
  ],
  exports: [ACC_REPOSITORY, AutodeskApiService, RefrescarToken3LeggedUseCase],
})
export class AccModule {}
