import { Module } from '@nestjs/common';
import { CrearOpcionListaUseCase } from '../../application/use-cases/general/crear-opcion-lista.use-case';
import { ListarMenuOpcionesUseCase } from '../../application/use-cases/general/listar-menu-opciones.use-case';
import { ListarMenuRecursivoUseCase } from '../../application/use-cases/general/listar-menu-recursivo.use-case';
import { ObtenerCatalogosTrabajadorUseCase } from '../../application/use-cases/general/obtener-catalogos-trabajador.use-case';
import { ObtenerMenuOpcionUseCase } from '../../application/use-cases/general/obtener-menu-opcion.use-case';
import { ObtenerOpcionesListaUseCase } from '../../application/use-cases/general/obtener-opciones-lista.use-case';
import { ListarDepartamentosUseCase } from '../../application/use-cases/ubicacion/listar-departamentos.use-case';
import { ListarDistritosUseCase } from '../../application/use-cases/ubicacion/listar-distritos.use-case';
import { ListarPaisesUseCase } from '../../application/use-cases/ubicacion/listar-paises.use-case';
import { ListarProvinciasUseCase } from '../../application/use-cases/ubicacion/listar-provincias.use-case';
import { MENU_REPOSITORY } from '../../domain/repositories/menu.repository.interface';
import { UBICACION_REPOSITORY } from '../../domain/repositories/ubicacion.repository.interface';
import { MenuRepository } from '../../infrastructure/repositories/menu.repository';
import { UbicacionRepository } from '../../infrastructure/repositories/ubicacion.repository';
import { GeneralController } from '../../presentation/controllers/general.controller';
import { UbicacionController } from '../../presentation/controllers/ubicacion.controller';
import { applicationProvider } from '../application.providers';
import { AuthenticationModule } from './platform/authentication.module';
import { DatabaseModule } from './platform/database.module';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  controllers: [GeneralController, UbicacionController],
  providers: [
    { provide: UBICACION_REPOSITORY, useClass: UbicacionRepository },
    applicationProvider(ListarPaisesUseCase),
    applicationProvider(ListarDepartamentosUseCase),
    applicationProvider(ListarProvinciasUseCase),
    applicationProvider(ListarDistritosUseCase),
    // Repositories
    {
      provide: MENU_REPOSITORY,
      useClass: MenuRepository,
    },
    // Use cases
    applicationProvider(ListarMenuOpcionesUseCase),
    applicationProvider(ObtenerMenuOpcionUseCase),
    applicationProvider(ObtenerOpcionesListaUseCase),
    applicationProvider(CrearOpcionListaUseCase),
    applicationProvider(ObtenerCatalogosTrabajadorUseCase),
    applicationProvider(ListarMenuRecursivoUseCase),
    // JWT Strategy
  ],
  exports: [MENU_REPOSITORY],
})
export class GeneralModule {}
