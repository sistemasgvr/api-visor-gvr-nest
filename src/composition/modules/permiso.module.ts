import { Module } from '@nestjs/common';
import { CrearPermisoUseCase } from '../../application/use-cases/permiso/crear-permiso.use-case';
import { EditarPermisoUseCase } from '../../application/use-cases/permiso/editar-permiso.use-case';
import { EliminarPermisoUseCase } from '../../application/use-cases/permiso/eliminar-permiso.use-case';
import { ListarPermisosUseCase } from '../../application/use-cases/permiso/listar-permisos.use-case';
import { ObtenerPermisoUseCase } from '../../application/use-cases/permiso/obtener-permiso.use-case';
import { PERMISO_REPOSITORY } from '../../domain/repositories/permiso.repository.interface';
import { PermisoRepository } from '../../infrastructure/repositories/permiso.repository';
import { PermisoController } from '../../presentation/controllers/permiso.controller';
import { applicationProvider } from '../application.providers';
import { AuthenticationModule } from './platform/authentication.module';
import { DatabaseModule } from './platform/database.module';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  controllers: [PermisoController],
  providers: [
    {
      provide: PERMISO_REPOSITORY,
      useClass: PermisoRepository,
    },
    applicationProvider(ListarPermisosUseCase),
    applicationProvider(ObtenerPermisoUseCase),
    applicationProvider(CrearPermisoUseCase),
    applicationProvider(EditarPermisoUseCase),
    applicationProvider(EliminarPermisoUseCase),
  ],
  exports: [PERMISO_REPOSITORY],
})
export class PermisoModule {}
