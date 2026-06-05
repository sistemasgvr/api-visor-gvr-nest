import { Module } from '@nestjs/common';
import { AccVisorElementoFotoController } from '../controllers/acc-visor-elemento-foto.controller';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { AccVisorElementoFotoRepository } from '../../infrastructure/repositories/acc-visor-elemento-foto.repository';
import { ACC_VISOR_ELEMENTO_FOTO_REPOSITORY } from '../../domain/repositories/acc-visor-elemento-foto.repository.interface';
import { CrearVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/crear-visor-elemento-foto.use-case';
import { ActualizarVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/actualizar-visor-elemento-foto.use-case';
import { AgregarArchivosVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/agregar-archivos-visor-elemento-foto.use-case';
import { ListarVisorElementoFotosPorDocumentoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/listar-visor-elemento-fotos-por-documento.use-case';
import { ObtenerVisorElementoFotoPorElementoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/obtener-visor-elemento-foto-por-elemento.use-case';
import { ObtenerVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/obtener-visor-elemento-foto.use-case';
import { EliminarArchivoVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/eliminar-archivo-visor-elemento-foto.use-case';
import { EliminarVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/eliminar-visor-elemento-foto.use-case';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [AccVisorElementoFotoController],
  providers: [
    CrearVisorElementoFotoUseCase,
    ActualizarVisorElementoFotoUseCase,
    AgregarArchivosVisorElementoFotoUseCase,
    ListarVisorElementoFotosPorDocumentoUseCase,
    ObtenerVisorElementoFotoPorElementoUseCase,
    ObtenerVisorElementoFotoUseCase,
    EliminarArchivoVisorElementoFotoUseCase,
    EliminarVisorElementoFotoUseCase,
    {
      provide: ACC_VISOR_ELEMENTO_FOTO_REPOSITORY,
      useClass: AccVisorElementoFotoRepository,
    },
  ],
})
export class AccVisorElementoFotoModule {}
