import { Module } from '@nestjs/common';
import { ActivarTrabajadorUseCase } from '../../application/use-cases/trabajador/activar-trabajador.use-case';
import { ActualizarContratoTrabajadorUseCase } from '../../application/use-cases/trabajador/actualizar-contrato-trabajador.use-case';
import { CrearContratoTrabajadorUseCase } from '../../application/use-cases/trabajador/crear-contrato-trabajador.use-case';
import { CrearTrabajadorUseCase } from '../../application/use-cases/trabajador/crear-trabajador.use-case';
import { EditarTrabajadorUseCase } from '../../application/use-cases/trabajador/editar-trabajador.use-case';
import { EliminarContratoTrabajadorUseCase } from '../../application/use-cases/trabajador/eliminar-contrato-trabajador.use-case';
import { EliminarTrabajadorUseCase } from '../../application/use-cases/trabajador/eliminar-trabajador.use-case';
import { ListarAdministrativosUseCase } from '../../application/use-cases/trabajador/listar-administrativos.use-case';
import { ListarTrabajadoresUseCase } from '../../application/use-cases/trabajador/listar-trabajadores.use-case';
import { ObtenerFirmaTrabajadorUseCase } from '../../application/use-cases/trabajador/obtener-firma-trabajador.use-case';
import { ObtenerFotoPerfilTrabajadorUseCase } from '../../application/use-cases/trabajador/obtener-foto-perfil-trabajador.use-case';
import { ObtenerTrabajadorUseCase } from '../../application/use-cases/trabajador/obtener-trabajador.use-case';
import { ResetearContrasenaUseCase } from '../../application/use-cases/trabajador/resetear-contrasena.use-case';
import { SubirFirmaTrabajadorUseCase } from '../../application/use-cases/trabajador/subir-firma-trabajador.use-case';
import { TRABAJADOR_REPOSITORY } from '../../domain/repositories/trabajador.repository.interface';
import { TrabajadorRepository } from '../../infrastructure/repositories/trabajador.repository';
import { WorkerSignatureStorageService } from '../../infrastructure/services/worker-signature-storage.service';
import { TrabajadorController } from '../../presentation/controllers/trabajador.controller';
import { applicationProvider } from '../application.providers';
import { AuthenticationModule } from './platform/authentication.module';
import { DatabaseModule } from './platform/database.module';
import { StorageModule } from './platform/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule, AuthenticationModule],
  controllers: [TrabajadorController],
  providers: [
    // Repositories
    {
      provide: TRABAJADOR_REPOSITORY,
      useClass: TrabajadorRepository,
    },
    // Use cases
    applicationProvider(ListarTrabajadoresUseCase),
    applicationProvider(ListarAdministrativosUseCase),
    applicationProvider(ObtenerTrabajadorUseCase),
    applicationProvider(ObtenerFotoPerfilTrabajadorUseCase),
    applicationProvider(SubirFirmaTrabajadorUseCase),
    applicationProvider(ObtenerFirmaTrabajadorUseCase),
    WorkerSignatureStorageService,
    applicationProvider(CrearTrabajadorUseCase),
    applicationProvider(EditarTrabajadorUseCase),
    applicationProvider(ActualizarContratoTrabajadorUseCase),
    applicationProvider(CrearContratoTrabajadorUseCase),
    applicationProvider(EliminarContratoTrabajadorUseCase),
    applicationProvider(EliminarTrabajadorUseCase),
    applicationProvider(ActivarTrabajadorUseCase),
    applicationProvider(ResetearContrasenaUseCase),
    // JWT Strategy
  ],
  exports: [TRABAJADOR_REPOSITORY],
})
export class TrabajadorModule {}
