import { Module } from '@nestjs/common';
import { applicationProvider } from '../application.providers';
import {
  ActualizarUsuarioProyectoUseCase,
  AgregarUsuarioProyectoUseCase,
  BuscarUsuariosProyectoUseCase,
  EliminarUsuarioProyectoUseCase,
  ImportarUsuariosProyectoUseCase,
  ObtenerUsuarioProyectoPorIdUseCase,
  ObtenerUsuariosProyectoUseCase,
} from '../../application/use-cases/acc/project-users';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { AccProjectUsersController } from '../../presentation/controllers/acc-project-users.controller';

@Module({
  controllers: [AccProjectUsersController],
  providers: [
    applicationProvider(ObtenerUsuariosProyectoUseCase),
    applicationProvider(ObtenerUsuarioProyectoPorIdUseCase),
    applicationProvider(BuscarUsuariosProyectoUseCase),
    applicationProvider(AgregarUsuarioProyectoUseCase),
    applicationProvider(ImportarUsuariosProyectoUseCase),
    applicationProvider(ActualizarUsuarioProyectoUseCase),
    applicationProvider(EliminarUsuarioProyectoUseCase),
    AutodeskApiService,
    HttpClientService,
  ],
})
export class AccProjectUsersModule {}
