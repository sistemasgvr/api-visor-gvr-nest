import { Module } from '@nestjs/common';
import { ActualizarCredencialesUseCase } from '../../application/use-cases/auth/actualizar-credenciales.use-case';
import { ObtenerPerfilUsuarioUseCase } from '../../application/use-cases/auth/obtener-perfil-usuario.use-case';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { UserController } from '../../presentation/controllers/user.controller';
import { applicationProvider } from '../application.providers';
import { AuthenticationModule } from './platform/authentication.module';
import { DatabaseModule } from './platform/database.module';
import { StorageModule } from './platform/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule, AuthenticationModule],
  controllers: [UserController],
  providers: [
    // Repositories
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
    // Use cases
    applicationProvider(ActualizarCredencialesUseCase),
    applicationProvider(ObtenerPerfilUsuarioUseCase),
    // JWT Strategy
  ],
  exports: [AUTH_REPOSITORY],
})
export class UserModule {}
