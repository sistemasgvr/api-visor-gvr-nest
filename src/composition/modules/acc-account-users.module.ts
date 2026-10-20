import { Module } from '@nestjs/common';
import {
  ActualizarUsuarioUseCase,
  BuscarUsuariosUseCase,
  CrearUsuarioUseCase,
  ImportarUsuariosUseCase,
  ObtenerProductosUsuarioUseCase,
  ObtenerProyectosUsuarioUseCase,
  ObtenerRolesUsuarioUseCase,
  ObtenerUsuarioPorIdUseCase,
  ObtenerUsuariosUseCase,
} from '../../application/use-cases/acc/account-users';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { AccAccountUsersController } from '../../presentation/controllers/acc-account-users.controller';
import { applicationProvider } from '../application.providers';

@Module({
  controllers: [AccAccountUsersController],
  providers: [
    applicationProvider(CrearUsuarioUseCase),
    applicationProvider(ImportarUsuariosUseCase),
    applicationProvider(ObtenerUsuariosUseCase),
    applicationProvider(ObtenerUsuarioPorIdUseCase),
    applicationProvider(BuscarUsuariosUseCase),
    applicationProvider(ObtenerProyectosUsuarioUseCase),
    applicationProvider(ObtenerProductosUsuarioUseCase),
    applicationProvider(ObtenerRolesUsuarioUseCase),
    applicationProvider(ActualizarUsuarioUseCase),
    AutodeskApiService,
    HttpClientService,
  ],
})
export class AccAccountUsersModule {}
