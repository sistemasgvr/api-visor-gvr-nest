import { Module } from '@nestjs/common';
import { CrearNovedadLanzamientoUseCase } from '../../application/use-cases/novedad/crear-novedad-lanzamiento.use-case';
import { CrearNovedadTarjetaUseCase } from '../../application/use-cases/novedad/crear-novedad-tarjeta.use-case';
import { EditarNovedadLanzamientoUseCase } from '../../application/use-cases/novedad/editar-novedad-lanzamiento.use-case';
import { EditarNovedadTarjetaUseCase } from '../../application/use-cases/novedad/editar-novedad-tarjeta.use-case';
import { EliminarNovedadLanzamientoUseCase } from '../../application/use-cases/novedad/eliminar-novedad-lanzamiento.use-case';
import { EliminarNovedadTarjetaUseCase } from '../../application/use-cases/novedad/eliminar-novedad-tarjeta.use-case';
import { ListarNovedadLanzamientosUseCase } from '../../application/use-cases/novedad/listar-novedad-lanzamientos.use-case';
import { MarcarNovedadVistaUseCase } from '../../application/use-cases/novedad/marcar-novedad-vista.use-case';
import { ObtenerNovedadLanzamientoUseCase } from '../../application/use-cases/novedad/obtener-novedad-lanzamiento.use-case';
import { ObtenerNovedadPendientesUsuarioUseCase } from '../../application/use-cases/novedad/obtener-novedad-pendientes-usuario.use-case';
import { SincronizarRolesNovedadUseCase } from '../../application/use-cases/novedad/sincronizar-roles-novedad.use-case';
import { NOVEDAD_REPOSITORY } from '../../domain/repositories/novedad.repository.interface';
import { NovedadRepository } from '../../infrastructure/repositories/novedad.repository';
import { NovedadTarjetaMediaStorageService } from '../../infrastructure/services/novedad-tarjeta-media-storage.service';
import { NovedadController } from '../../presentation/controllers/novedad.controller';
import { applicationProvider } from '../application.providers';
import { AuthenticationModule } from './platform/authentication.module';
import { DatabaseModule } from './platform/database.module';
import { StorageModule } from './platform/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule, AuthenticationModule],
  controllers: [NovedadController],
  providers: [
    {
      provide: NOVEDAD_REPOSITORY,
      useClass: NovedadRepository,
    },
    applicationProvider(ListarNovedadLanzamientosUseCase),
    applicationProvider(ObtenerNovedadLanzamientoUseCase),
    applicationProvider(CrearNovedadLanzamientoUseCase),
    applicationProvider(EditarNovedadLanzamientoUseCase),
    applicationProvider(EliminarNovedadLanzamientoUseCase),
    applicationProvider(SincronizarRolesNovedadUseCase),
    applicationProvider(CrearNovedadTarjetaUseCase),
    applicationProvider(EditarNovedadTarjetaUseCase),
    applicationProvider(EliminarNovedadTarjetaUseCase),
    applicationProvider(ObtenerNovedadPendientesUsuarioUseCase),
    applicationProvider(MarcarNovedadVistaUseCase),
    NovedadTarjetaMediaStorageService,
  ],
  exports: [NOVEDAD_REPOSITORY],
})
export class NovedadModule {}
