import { Module } from '@nestjs/common';
import { CrearEmpresaUseCase } from '../../application/use-cases/empresa/crear-empresa.use-case';
import { EditarEmpresaUseCase } from '../../application/use-cases/empresa/editar-empresa.use-case';
import { EliminarEmpresaUseCase } from '../../application/use-cases/empresa/eliminar-empresa.use-case';
import { ListarEmpresasUseCase } from '../../application/use-cases/empresa/listar-empresas.use-case';
import { ObtenerEmpresaUseCase } from '../../application/use-cases/empresa/obtener-empresa.use-case';
import { EMPRESA_REPOSITORY } from '../../domain/repositories/empresa.repository.interface';
import { EmpresaRepository } from '../../infrastructure/repositories/empresa.repository';
import { EmpresaController } from '../../presentation/controllers/empresa.controller';
import { applicationProvider } from '../application.providers';
import { AuthenticationModule } from './platform/authentication.module';
import { DatabaseModule } from './platform/database.module';
import { StorageModule } from './platform/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule, AuthenticationModule],
  controllers: [EmpresaController],
  providers: [
    // Repositories
    {
      provide: EMPRESA_REPOSITORY,
      useClass: EmpresaRepository,
    },
    // Use cases
    applicationProvider(ListarEmpresasUseCase),
    applicationProvider(ObtenerEmpresaUseCase),
    applicationProvider(CrearEmpresaUseCase),
    applicationProvider(EditarEmpresaUseCase),
    applicationProvider(EliminarEmpresaUseCase),
    // JWT Strategy
  ],
  exports: [EMPRESA_REPOSITORY],
})
export class EmpresaModule {}
