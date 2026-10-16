import { Module } from '@nestjs/common';
import { AccIssuesController } from '../../presentation/controllers/acc-issues.controller';
import { applicationProvider } from '../application.providers';

// Use Cases
import { ActualizarIncidenciaUseCase } from '../../application/use-cases/acc/issues/actualizar-incidencia.use-case';
import { AsignarIncidenciaUseCase } from '../../application/use-cases/acc/issues/asignar-incidencia.use-case';
import { CrearAdjuntoUseCase } from '../../application/use-cases/acc/issues/crear-adjunto.use-case';
import { CrearComentarioUseCase } from '../../application/use-cases/acc/issues/crear-comentario.use-case';
import { CrearIncidenciaUseCase } from '../../application/use-cases/acc/issues/crear-incidencia.use-case';
import { EliminarAdjuntoUseCase } from '../../application/use-cases/acc/issues/eliminar-adjunto.use-case';
import { ExportarIncidenciasUseCase } from '../../application/use-cases/acc/issues/exportar-incidencias.use-case';
import { ObtenerActividadIncidenciaUseCase } from '../../application/use-cases/acc/issues/obtener-actividad-incidencia.use-case';
import { ObtenerAdjuntosUseCase } from '../../application/use-cases/acc/issues/obtener-adjuntos.use-case';
import { ObtenerCategoriasRaizUseCase } from '../../application/use-cases/acc/issues/obtener-categorias-raiz.use-case';
import { ObtenerComentariosUseCase } from '../../application/use-cases/acc/issues/obtener-comentarios.use-case';
import { ObtenerDefinicionesAtributosUseCase } from '../../application/use-cases/acc/issues/obtener-definiciones-atributos.use-case';
import { ObtenerIncidenciaPorIdUseCase } from '../../application/use-cases/acc/issues/obtener-incidencia-por-id.use-case';
import { ObtenerIncidenciasPorDocumentoUseCase } from '../../application/use-cases/acc/issues/obtener-incidencias-por-documento.use-case';
import { ObtenerIncidenciasUseCase } from '../../application/use-cases/acc/issues/obtener-incidencias.use-case';
import { ObtenerMapeosAtributosUseCase } from '../../application/use-cases/acc/issues/obtener-mapeos-atributos.use-case';
import { ObtenerPerfilUsuarioUseCase } from '../../application/use-cases/acc/issues/obtener-perfil-usuario.use-case';
import { ObtenerTiposIncidenciasUseCase } from '../../application/use-cases/acc/issues/obtener-tipos-incidencias.use-case';
import ObtenerTokenValidoHelper from '../../application/use-cases/acc/issues/obtener-token-valido.helper';
import { ObtenerUrlMiniaturaUseCase } from '../../application/use-cases/acc/issues/obtener-url-miniatura.use-case';
import { ObtenerUsuariosDisponiblesUseCase } from '../../application/use-cases/acc/issues/obtener-usuarios-disponibles.use-case';

// Services
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { ExportacionIncidenciasService } from '../../infrastructure/services/exportacion-incidencias.service';

// Repositories
import { ACC_RECURSOS_REPOSITORY } from '../../domain/repositories/acc-recursos.repository.interface';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { AUDITORIA_REPOSITORY } from '../../domain/repositories/auditoria.repository.interface';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import { USUARIOS_REPOSITORY } from '../../domain/repositories/usuarios.repository.interface';
import { DatabaseFunctionService } from '../../infrastructure/database/database-function.service';
import { AccRecursosRepository } from '../../infrastructure/repositories/acc-recursos.repository';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { AuditoriaRepository } from '../../infrastructure/repositories/auditoria.repository';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { UsuariosRepository } from '../../infrastructure/repositories/usuarios.repository';
import { BroadcastModule } from './broadcast.module';

@Module({
  imports: [BroadcastModule],
  controllers: [AccIssuesController],
  providers: [
    // Helper
    applicationProvider(ObtenerTokenValidoHelper),

    // Use Cases
    applicationProvider(ObtenerPerfilUsuarioUseCase),
    applicationProvider(ObtenerTiposIncidenciasUseCase),
    applicationProvider(ObtenerDefinicionesAtributosUseCase),
    applicationProvider(ObtenerMapeosAtributosUseCase),
    applicationProvider(ObtenerCategoriasRaizUseCase),
    applicationProvider(ObtenerIncidenciasPorDocumentoUseCase),
    applicationProvider(ObtenerUrlMiniaturaUseCase),
    applicationProvider(ObtenerIncidenciasUseCase),
    applicationProvider(CrearIncidenciaUseCase),
    applicationProvider(ObtenerIncidenciaPorIdUseCase),
    applicationProvider(ActualizarIncidenciaUseCase),
    applicationProvider(ObtenerComentariosUseCase),
    applicationProvider(CrearComentarioUseCase),
    applicationProvider(CrearAdjuntoUseCase),
    applicationProvider(ObtenerAdjuntosUseCase),
    applicationProvider(EliminarAdjuntoUseCase),
    applicationProvider(AsignarIncidenciaUseCase),
    applicationProvider(ObtenerUsuariosDisponiblesUseCase),
    applicationProvider(ExportarIncidenciasUseCase),
    applicationProvider(ObtenerActividadIncidenciaUseCase),

    // Services
    AutodeskApiService,
    ExportacionIncidenciasService,
    HttpClientService,

    // Repositories
    {
      provide: ACC_REPOSITORY,
      useClass: AccRepository,
    },
    {
      provide: AUDITORIA_REPOSITORY,
      useClass: AuditoriaRepository,
    },
    {
      provide: ACC_RECURSOS_REPOSITORY,
      useClass: AccRecursosRepository,
    },
    {
      provide: USUARIOS_REPOSITORY,
      useClass: UsuariosRepository,
    },
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
    DatabaseFunctionService,
  ],
})
export class AccIssuesModule {}
