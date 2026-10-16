import { Module } from '@nestjs/common';
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
    ObtenerUsuariosProyectoUseCase,
    ObtenerUsuarioProyectoPorIdUseCase,
    BuscarUsuariosProyectoUseCase,
    AgregarUsuarioProyectoUseCase,
    ImportarUsuariosProyectoUseCase,
    ActualizarUsuarioProyectoUseCase,
    EliminarUsuarioProyectoUseCase,
    AutodeskApiService,
    HttpClientService,
  ],
})
export class AccProjectUsersModule {}
