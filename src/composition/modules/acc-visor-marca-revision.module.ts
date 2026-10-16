import { Module } from '@nestjs/common';
import { ActualizarVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/actualizar-visor-marca-revision.use-case';
import { AnularPublicacionVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/anular-publicacion-visor-marca-revision.use-case';
import { ContarVisorMarcasRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/contar-visor-marcas-revision.use-case';
import { CrearVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/crear-visor-marca-revision.use-case';
import { DuplicarVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/duplicar-visor-marca-revision.use-case';
import { ListarVisorMarcasRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/listar-visor-marcas-revision.use-case';
import { ObtenerVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/obtener-visor-marca-revision.use-case';
import { PublicarVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/publicar-visor-marca-revision.use-case';
import { SincronizarMarkupIdApsVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/sincronizar-markup-id-aps-visor-marca-revision.use-case';
import { SuprimirVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/suprimir-visor-marca-revision.use-case';
import { VisorMarcaRevisionSyncService } from '../../application/use-cases/acc/visor-marca-revision/visor-marca-revision-sync.service';
import { ACC_VISOR_MARCA_REVISION_REPOSITORY } from '../../domain/repositories/acc-visor-marca-revision.repository.interface';
import { AccVisorMarcaRevisionRepository } from '../../infrastructure/repositories/acc-visor-marca-revision.repository';
import { AccVisorMarcaRevisionController } from '../../presentation/controllers/acc-visor-marca-revision.controller';
import { applicationProvider } from '../application.providers';
import { BroadcastModule } from './broadcast.module';
import { DatabaseModule } from './platform/database.module';

@Module({
  imports: [DatabaseModule, BroadcastModule],
  controllers: [AccVisorMarcaRevisionController],
  providers: [
    applicationProvider(CrearVisorMarcaRevisionUseCase),
    applicationProvider(ActualizarVisorMarcaRevisionUseCase),
    applicationProvider(DuplicarVisorMarcaRevisionUseCase),
    applicationProvider(PublicarVisorMarcaRevisionUseCase),
    applicationProvider(AnularPublicacionVisorMarcaRevisionUseCase),
    applicationProvider(SuprimirVisorMarcaRevisionUseCase),
    applicationProvider(ListarVisorMarcasRevisionUseCase),
    applicationProvider(ContarVisorMarcasRevisionUseCase),
    applicationProvider(ObtenerVisorMarcaRevisionUseCase),
    applicationProvider(SincronizarMarkupIdApsVisorMarcaRevisionUseCase),
    applicationProvider(VisorMarcaRevisionSyncService),
    {
      provide: ACC_VISOR_MARCA_REVISION_REPOSITORY,
      useClass: AccVisorMarcaRevisionRepository,
    },
  ],
})
export class AccVisorMarcaRevisionModule {}
