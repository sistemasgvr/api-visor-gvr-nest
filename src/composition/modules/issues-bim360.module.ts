import { Module } from '@nestjs/common';
import { IssuesBim360Controller } from '../../presentation/controllers/issues-bim360.controller';
import { applicationProvider } from '../application.providers';

// Use Cases
import ObtenerTokenValidoHelper from '../../application/use-cases/acc/issues/obtener-token-valido.helper';
import { ActualizarAdjuntoBim360UseCase } from '../../application/use-cases/issues-bim360/actualizar-adjunto.use-case';
import { ActualizarIncidenciaBim360UseCase } from '../../application/use-cases/issues-bim360/actualizar-incidencia.use-case';
import { CrearAdjuntoBim360UseCase } from '../../application/use-cases/issues-bim360/crear-adjunto.use-case';
import { CrearComentarioBim360UseCase } from '../../application/use-cases/issues-bim360/crear-comentario.use-case';
import { CrearIncidenciaBim360UseCase } from '../../application/use-cases/issues-bim360/crear-incidencia.use-case';
import { ObtenerAdjuntosBim360UseCase } from '../../application/use-cases/issues-bim360/obtener-adjuntos.use-case';
import { ObtenerCategoriasRaizBim360UseCase } from '../../application/use-cases/issues-bim360/obtener-categorias-raiz.use-case';
import { ObtenerComentariosBim360UseCase } from '../../application/use-cases/issues-bim360/obtener-comentarios.use-case';
import { ObtenerDefinicionesAtributosBim360UseCase } from '../../application/use-cases/issues-bim360/obtener-definiciones-atributos.use-case';
import { ObtenerIncidenciaPorIdBim360UseCase } from '../../application/use-cases/issues-bim360/obtener-incidencia-por-id.use-case';
import { ObtenerIncidenciasPorDocumentoBim360UseCase } from '../../application/use-cases/issues-bim360/obtener-incidencias-por-documento.use-case';
import { ObtenerIncidenciasBim360UseCase } from '../../application/use-cases/issues-bim360/obtener-incidencias.use-case';
import { ObtenerMapeosAtributosBim360UseCase } from '../../application/use-cases/issues-bim360/obtener-mapeos-atributos.use-case';
import { ObtenerPerfilUsuarioBim360UseCase } from '../../application/use-cases/issues-bim360/obtener-perfil-usuario.use-case';
import { ObtenerTiposIncidenciasBim360UseCase } from '../../application/use-cases/issues-bim360/obtener-tipos-incidencias.use-case';

// Services
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';

// Repositories
import { ACC_RECURSOS_REPOSITORY } from '../../domain/repositories/acc-recursos.repository.interface';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { AUDITORIA_REPOSITORY } from '../../domain/repositories/auditoria.repository.interface';
import { DatabaseFunctionService } from '../../infrastructure/database/database-function.service';
import { AccRecursosRepository } from '../../infrastructure/repositories/acc-recursos.repository';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { AuditoriaRepository } from '../../infrastructure/repositories/auditoria.repository';

@Module({
  controllers: [IssuesBim360Controller],
  providers: [
    // Helper
    applicationProvider(ObtenerTokenValidoHelper),

    // Use Cases
    applicationProvider(ObtenerPerfilUsuarioBim360UseCase),
    applicationProvider(ObtenerTiposIncidenciasBim360UseCase),
    applicationProvider(ObtenerDefinicionesAtributosBim360UseCase),
    applicationProvider(ObtenerMapeosAtributosBim360UseCase),
    applicationProvider(ObtenerCategoriasRaizBim360UseCase),
    applicationProvider(ObtenerIncidenciasPorDocumentoBim360UseCase),
    applicationProvider(ObtenerIncidenciasBim360UseCase),
    applicationProvider(CrearIncidenciaBim360UseCase),
    applicationProvider(ObtenerIncidenciaPorIdBim360UseCase),
    applicationProvider(ActualizarIncidenciaBim360UseCase),
    applicationProvider(ObtenerComentariosBim360UseCase),
    applicationProvider(CrearComentarioBim360UseCase),
    applicationProvider(ObtenerAdjuntosBim360UseCase),
    applicationProvider(CrearAdjuntoBim360UseCase),
    applicationProvider(ActualizarAdjuntoBim360UseCase),

    // Services
    AutodeskApiService,
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
    DatabaseFunctionService,
  ],
})
export class IssuesBim360Module {}
