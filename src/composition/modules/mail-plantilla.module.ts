import { Module } from '@nestjs/common';
import { ListarCoberturaEnviosMailUseCase } from '../../application/use-cases/mail-envio/listar-cobertura-envios-mail.use-case';
import { ListarLogsEnvioMailUseCase } from '../../application/use-cases/mail-envio/listar-logs-envio-mail.use-case';
import { ReenviarMailEnvioUseCase } from '../../application/use-cases/mail-envio/reenviar-mail-envio.use-case';
import { ReenviarPendientesMailEnvioUseCase } from '../../application/use-cases/mail-envio/reenviar-pendientes-mail-envio.use-case';
import { ActualizarMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/actualizar-mail-plantilla.use-case';
import { ActualizarVariablesPruebaMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/actualizar-variables-prueba-mail-plantilla.use-case';
import { CrearMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/crear-mail-plantilla.use-case';
import { EliminarHistorialMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/eliminar-historial-mail-plantilla.use-case';
import { EliminarMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/eliminar-mail-plantilla.use-case';
import { ListarHistorialMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/listar-historial-mail-plantilla.use-case';
import { ListarMailPlantillasUseCase } from '../../application/use-cases/mail-plantilla/listar-mail-plantillas.use-case';
import { ObtenerHistorialMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/obtener-historial-mail-plantilla.use-case';
import { ObtenerMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/obtener-mail-plantilla.use-case';
import { PreviewMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/preview-mail-plantilla.use-case';
import { SembrarMailPlantillasSistemaUseCase } from '../../application/use-cases/mail-plantilla/sembrar-mail-plantillas-sistema.use-case';
import { TestSendMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/test-send-mail-plantilla.use-case';
import { TRABAJADOR_REPOSITORY } from '../../domain/repositories/trabajador.repository.interface';
import { TrabajadorRepository } from '../../infrastructure/repositories/trabajador.repository';
import { MailEnviosController } from '../../presentation/controllers/mail-envios.controller';
import { MailPlantillaController } from '../../presentation/controllers/mail-plantilla.controller';
import { applicationProvider } from '../application.providers';
import { AuthenticationModule } from './platform/authentication.module';
import { DatabaseModule } from './platform/database.module';
import { StorageModule } from './platform/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule, AuthenticationModule],
  controllers: [MailPlantillaController, MailEnviosController],
  providers: [
    {
      provide: TRABAJADOR_REPOSITORY,
      useClass: TrabajadorRepository,
    },
    applicationProvider(ListarMailPlantillasUseCase),
    applicationProvider(ObtenerMailPlantillaUseCase),
    applicationProvider(CrearMailPlantillaUseCase),
    applicationProvider(ActualizarMailPlantillaUseCase),
    applicationProvider(ActualizarVariablesPruebaMailPlantillaUseCase),
    applicationProvider(EliminarMailPlantillaUseCase),
    applicationProvider(ListarHistorialMailPlantillaUseCase),
    applicationProvider(ObtenerHistorialMailPlantillaUseCase),
    applicationProvider(EliminarHistorialMailPlantillaUseCase),
    applicationProvider(PreviewMailPlantillaUseCase),
    applicationProvider(TestSendMailPlantillaUseCase),
    applicationProvider(SembrarMailPlantillasSistemaUseCase),
    applicationProvider(ListarCoberturaEnviosMailUseCase),
    applicationProvider(ListarLogsEnvioMailUseCase),
    applicationProvider(ReenviarMailEnvioUseCase),
    applicationProvider(ReenviarPendientesMailEnvioUseCase),
  ],
})
export class MailPlantillaModule {}
