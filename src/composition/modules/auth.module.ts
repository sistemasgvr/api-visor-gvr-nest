import { Module } from '@nestjs/common';
import { CambiarContrasenaPerfilUseCase } from '../../application/use-cases/auth/cambiar-contrasena-perfil.use-case';
import { CerrarTodasSesionesUseCase } from '../../application/use-cases/auth/cerrar-todas-sesiones.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { ObtenerEstadisticasUsuariosUseCase } from '../../application/use-cases/auth/obtener-estadisticas-usuarios.use-case';
import { ObtenerPerfilUseCase } from '../../application/use-cases/auth/obtener-perfil.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { SubirFotoPerfilUseCase } from '../../application/use-cases/auth/subir-foto-perfil.use-case';
import { ValidarSesionUseCase } from '../../application/use-cases/auth/validar-sesion.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import { SESION_REPOSITORY } from '../../domain/repositories/sesion.repository.interface';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { SesionRepository } from '../../infrastructure/repositories/sesion.repository';
import { ProfilePhotoStorageService } from '../../infrastructure/services/profile-photo-storage.service';
import { AuthController } from '../../presentation/controllers/auth.controller';
import { applicationProvider } from '../application.providers';
import { AuthenticationModule } from './platform/authentication.module';
import { DatabaseModule } from './platform/database.module';
import { StorageModule } from './platform/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule, AuthenticationModule],
  controllers: [AuthController],
  providers: [
    // Repositories
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
    {
      provide: SESION_REPOSITORY,
      useClass: SesionRepository,
    },
    // Infrastructure services
    ProfilePhotoStorageService,
    // Use cases
    applicationProvider(RegisterUseCase),
    applicationProvider(LoginUseCase),
    applicationProvider(RefreshTokenUseCase),
    applicationProvider(LogoutUseCase),
    applicationProvider(ObtenerPerfilUseCase),
    applicationProvider(SubirFotoPerfilUseCase),
    applicationProvider(CambiarContrasenaPerfilUseCase),
    applicationProvider(ValidarSesionUseCase),
    applicationProvider(CerrarTodasSesionesUseCase),
    applicationProvider(ObtenerEstadisticasUsuariosUseCase),
    // JWT Strategy
  ],
  exports: [AUTH_REPOSITORY, SESION_REPOSITORY, AuthenticationModule],
})
export class AuthModule {}
