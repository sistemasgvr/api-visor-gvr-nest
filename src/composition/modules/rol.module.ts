import { Module } from '@nestjs/common';
import { AsignarPermisoRolUseCase } from '../../application/use-cases/rol/asignar-permiso-rol.use-case';
import { AsignarPermisosRolUseCase } from '../../application/use-cases/rol/asignar-permisos-rol.use-case';
import { CrearRolUseCase } from '../../application/use-cases/rol/crear-rol.use-case';
import { EditarRolUseCase } from '../../application/use-cases/rol/editar-rol.use-case';
import { EliminarRolUseCase } from '../../application/use-cases/rol/eliminar-rol.use-case';
import { GestionarRolesUsuarioUseCase } from '../../application/use-cases/rol/gestionar-roles-usuario.use-case';
import { ListarPermisosDisponiblesUseCase } from '../../application/use-cases/rol/listar-permisos-disponibles.use-case';
import { ListarPermisosRolUseCase } from '../../application/use-cases/rol/listar-permisos-rol.use-case';
import { ListarRolesForListUseCase } from '../../application/use-cases/rol/listar-roles-for-list.use-case';
import { ListarRolesUseCase } from '../../application/use-cases/rol/listar-roles.use-case';
import { ObtenerDetalleRolUseCase } from '../../application/use-cases/rol/obtener-detalle-rol.use-case';
import { ObtenerRolUseCase } from '../../application/use-cases/rol/obtener-rol.use-case';
import { RemoverPermisoRolUseCase } from '../../application/use-cases/rol/remover-permiso-rol.use-case';
import { SincronizarPermisosRolUseCase } from '../../application/use-cases/rol/sincronizar-permisos-rol.use-case';
import { ROL_REPOSITORY } from '../../domain/repositories/rol.repository.interface';
import { RolRepository } from '../../infrastructure/repositories/rol.repository';
import { RolController } from '../../presentation/controllers/rol.controller';
import { applicationProvider } from '../application.providers';
import { BroadcastModule } from './broadcast.module';
import { AuthenticationModule } from './platform/authentication.module';
import { DatabaseModule } from './platform/database.module';

@Module({
  imports: [DatabaseModule, BroadcastModule, AuthenticationModule],
  controllers: [RolController],
  providers: [
    {
      provide: ROL_REPOSITORY,
      useClass: RolRepository,
    },
    applicationProvider(ListarRolesUseCase),
    applicationProvider(ListarRolesForListUseCase),
    applicationProvider(ObtenerRolUseCase),
    applicationProvider(CrearRolUseCase),
    applicationProvider(EditarRolUseCase),
    applicationProvider(EliminarRolUseCase),
    applicationProvider(ListarPermisosRolUseCase),
    applicationProvider(ListarPermisosDisponiblesUseCase),
    applicationProvider(AsignarPermisoRolUseCase),
    applicationProvider(AsignarPermisosRolUseCase),
    applicationProvider(RemoverPermisoRolUseCase),
    applicationProvider(SincronizarPermisosRolUseCase),
    applicationProvider(ObtenerDetalleRolUseCase),
    applicationProvider(GestionarRolesUsuarioUseCase),
  ],
  exports: [ROL_REPOSITORY],
})
export class RolModule {}
