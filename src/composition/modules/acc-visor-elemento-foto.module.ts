import { Module } from '@nestjs/common';
import { ActualizarVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/actualizar-visor-elemento-foto.use-case';
import { AgregarArchivosVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/agregar-archivos-visor-elemento-foto.use-case';
import { CrearVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/crear-visor-elemento-foto.use-case';
import { EliminarArchivoVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/eliminar-archivo-visor-elemento-foto.use-case';
import { EliminarVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/eliminar-visor-elemento-foto.use-case';
import { ListarVisorElementoFotosPorDocumentoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/listar-visor-elemento-fotos-por-documento.use-case';
import { ObtenerVisorElementoFotoPorElementoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/obtener-visor-elemento-foto-por-elemento.use-case';
import { ObtenerVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/obtener-visor-elemento-foto.use-case';
import { ACC_VISOR_ELEMENTO_FOTO_REPOSITORY } from '../../domain/repositories/acc-visor-elemento-foto.repository.interface';
import { AccVisorElementoFotoRepository } from '../../infrastructure/repositories/acc-visor-elemento-foto.repository';
import { AccVisorElementoFotoController } from '../../presentation/controllers/acc-visor-elemento-foto.controller';
import { applicationProvider } from '../application.providers';
import { DatabaseModule } from './platform/database.module';
import { StorageModule } from './platform/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [AccVisorElementoFotoController],
  providers: [
    applicationProvider(CrearVisorElementoFotoUseCase),
    applicationProvider(ActualizarVisorElementoFotoUseCase),
    applicationProvider(AgregarArchivosVisorElementoFotoUseCase),
    applicationProvider(ListarVisorElementoFotosPorDocumentoUseCase),
    applicationProvider(ObtenerVisorElementoFotoPorElementoUseCase),
    applicationProvider(ObtenerVisorElementoFotoUseCase),
    applicationProvider(EliminarArchivoVisorElementoFotoUseCase),
    applicationProvider(EliminarVisorElementoFotoUseCase),
    {
      provide: ACC_VISOR_ELEMENTO_FOTO_REPOSITORY,
      useClass: AccVisorElementoFotoRepository,
    },
  ],
})
export class AccVisorElementoFotoModule {}
