import { Module } from '@nestjs/common';
import { AccVisorMarcaRevisionController } from '../controllers/acc-visor-marca-revision.controller';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { BroadcastModule } from './broadcast.module';
import { AccVisorMarcaRevisionRepository } from '../../infrastructure/repositories/acc-visor-marca-revision.repository';
import { ACC_VISOR_MARCA_REVISION_REPOSITORY } from '../../domain/repositories/acc-visor-marca-revision.repository.interface';
import { CrearVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/crear-visor-marca-revision.use-case';
import { ActualizarVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/actualizar-visor-marca-revision.use-case';
import { DuplicarVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/duplicar-visor-marca-revision.use-case';
import { PublicarVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/publicar-visor-marca-revision.use-case';
import { AnularPublicacionVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/anular-publicacion-visor-marca-revision.use-case';
import { SuprimirVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/suprimir-visor-marca-revision.use-case';
import { ListarVisorMarcasRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/listar-visor-marcas-revision.use-case';
import { ContarVisorMarcasRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/contar-visor-marcas-revision.use-case';
import { ObtenerVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/obtener-visor-marca-revision.use-case';
import { SincronizarMarkupIdApsVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/sincronizar-markup-id-aps-visor-marca-revision.use-case';
import { VisorMarcaRevisionSyncService } from '../../application/use-cases/acc/visor-marca-revision/visor-marca-revision-sync.service';

@Module({
  imports: [DatabaseModule, BroadcastModule],
  controllers: [AccVisorMarcaRevisionController],
  providers: [
    CrearVisorMarcaRevisionUseCase,
    ActualizarVisorMarcaRevisionUseCase,
    DuplicarVisorMarcaRevisionUseCase,
    PublicarVisorMarcaRevisionUseCase,
    AnularPublicacionVisorMarcaRevisionUseCase,
    SuprimirVisorMarcaRevisionUseCase,
    ListarVisorMarcasRevisionUseCase,
    ContarVisorMarcasRevisionUseCase,
    ObtenerVisorMarcaRevisionUseCase,
    SincronizarMarkupIdApsVisorMarcaRevisionUseCase,
    VisorMarcaRevisionSyncService,
    {
      provide: ACC_VISOR_MARCA_REVISION_REPOSITORY,
      useClass: AccVisorMarcaRevisionRepository,
    },
  ],
})
export class AccVisorMarcaRevisionModule {}
