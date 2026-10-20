import { Module } from '@nestjs/common';
import {
  ActualizarNivelPermisoUsuarioUseCase,
  ActualizarRecursoUseCase,
  AsignarPermisoUseCase,
  AsignarPermisoUsuarioUseCase,
  CrearRecursoUseCase,
  EliminarRecursoUseCase,
  ListarNivelesPermisoUseCase,
  ListarPermisosRolUseCase,
  ListarPermisosUsuarioUseCase,
  ListarRecursosUseCase,
  ListarRolesRecursoUseCase,
  ListarUsuariosDisponiblesRecursoUseCase,
  ListarUsuariosRecursoUseCase,
  ObtenerRecursoPorIdUseCase,
  RemoverPermisoUseCase,
  RemoverPermisoUsuarioUseCase,
  SincronizarPermisosRolUseCase,
  SincronizarPermisosUsuarioUseCase,
} from '../../application/use-cases/acc/resources';
import { ACC_RESOURCES_REPOSITORY } from '../../domain/repositories/acc-resources.repository.interface';
import { DatabaseFunctionService } from '../../infrastructure/database/database-function.service';
import { AccResourcesRepository } from '../../infrastructure/repositories/acc-resources.repository';
import { AccResourcesController } from '../../presentation/controllers/acc-resources.controller';
import { applicationProvider } from '../application.providers';

@Module({
  controllers: [AccResourcesController],
  providers: [
    // Use Cases
    applicationProvider(ListarRecursosUseCase),
    applicationProvider(ObtenerRecursoPorIdUseCase),
    applicationProvider(CrearRecursoUseCase),
    applicationProvider(ActualizarRecursoUseCase),
    applicationProvider(EliminarRecursoUseCase),
    applicationProvider(ListarPermisosRolUseCase),
    applicationProvider(ListarRolesRecursoUseCase),
    applicationProvider(AsignarPermisoUseCase),
    applicationProvider(RemoverPermisoUseCase),
    applicationProvider(SincronizarPermisosRolUseCase),
    applicationProvider(ListarPermisosUsuarioUseCase),
    applicationProvider(ListarUsuariosRecursoUseCase),
    applicationProvider(ListarUsuariosDisponiblesRecursoUseCase),
    applicationProvider(AsignarPermisoUsuarioUseCase),
    applicationProvider(ActualizarNivelPermisoUsuarioUseCase),
    applicationProvider(RemoverPermisoUsuarioUseCase),
    applicationProvider(SincronizarPermisosUsuarioUseCase),
    applicationProvider(ListarNivelesPermisoUseCase),

    // Repository
    {
      provide: ACC_RESOURCES_REPOSITORY,
      useClass: AccResourcesRepository,
    },

    // Services
    DatabaseFunctionService,
  ],
})
export class AccResourcesModule {}
