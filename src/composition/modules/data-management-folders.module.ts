import { Module } from '@nestjs/common';
import { DataManagementFoldersController } from '../../presentation/controllers/data-management-folders.controller';
import { applicationProvider } from '../application.providers';
import { DatabaseModule } from './platform/database.module';

// Use cases - Group 1
import { BuscarEnContenidoCarpetaUseCase } from '../../application/use-cases/data-management/folders/buscar-en-contenido-carpeta.use-case';
import { ObtenerCarpetaPadreUseCase } from '../../application/use-cases/data-management/folders/obtener-carpeta-padre.use-case';
import { ObtenerCarpetaPorIdUseCase } from '../../application/use-cases/data-management/folders/obtener-carpeta-por-id.use-case';
import { ObtenerContenidoCarpetaUseCase } from '../../application/use-cases/data-management/folders/obtener-contenido-carpeta.use-case';
import { ObtenerReferenciasUseCase } from '../../application/use-cases/data-management/folders/obtener-referencias.use-case';

// Use cases - Group 2
import { BuscarEnCarpetaUseCase } from '../../application/use-cases/data-management/folders/buscar-en-carpeta.use-case';
import { ObtenerRelacionesLinksUseCase } from '../../application/use-cases/data-management/folders/obtener-relaciones-links.use-case';
import { ObtenerRelacionesRefsUseCase } from '../../application/use-cases/data-management/folders/obtener-relaciones-refs.use-case';

// Use cases - Group 3
import { ActualizarCarpetaUseCase } from '../../application/use-cases/data-management/folders/actualizar-carpeta.use-case';
import { CrearCarpetaUseCase } from '../../application/use-cases/data-management/folders/crear-carpeta.use-case';
import { CrearReferenciaCarpetaUseCase } from '../../application/use-cases/data-management/folders/crear-referencia-carpeta.use-case';
import { CrearSubcarpetaUseCase } from '../../application/use-cases/data-management/folders/crear-subcarpeta.use-case';
import { EliminarCarpetaUseCase } from '../../application/use-cases/data-management/folders/eliminar-carpeta.use-case';
import { ExportarPermisosCarpetaPdfUseCase } from '../../application/use-cases/data-management/folders/exportar-permisos-carpeta-pdf.use-case';
import { ExportarRegistroArchivosPdfUseCase } from '../../application/use-cases/data-management/folders/exportar-registro-archivos-pdf.use-case';
import { ObtenerElementosEliminadosUseCase } from '../../application/use-cases/data-management/folders/obtener-elementos-eliminados.use-case';
import { RestaurarCarpetaUseCase } from '../../application/use-cases/data-management/folders/restaurar-carpeta.use-case';
import { SincronizarCarpetasProyectoUseCase } from '../../application/use-cases/data-management/folders/sincronizar-carpetas-proyecto.use-case';

// Infrastructure
import { ACC_RESOURCES_REPOSITORY } from '../../domain/repositories/acc-resources.repository.interface';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { AUDITORIA_REPOSITORY } from '../../domain/repositories/auditoria.repository.interface';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AccResourcesRepository } from '../../infrastructure/repositories/acc-resources.repository';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { AuditoriaRepository } from '../../infrastructure/repositories/auditoria.repository';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { ExportacionPermisosCarpetaPdfService } from '../../infrastructure/services/exportacion-permisos-carpeta-pdf.service';
import { ExportacionRegistroArchivosPdfService } from '../../infrastructure/services/exportacion-registro-archivos-pdf.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DataManagementFoldersController],
  providers: [
    // Group 1
    applicationProvider(ObtenerCarpetaPorIdUseCase),
    applicationProvider(ObtenerContenidoCarpetaUseCase),
    applicationProvider(BuscarEnContenidoCarpetaUseCase),
    applicationProvider(ObtenerCarpetaPadreUseCase),
    applicationProvider(ObtenerReferenciasUseCase),
    // Group 2
    applicationProvider(ObtenerRelacionesLinksUseCase),
    applicationProvider(ObtenerRelacionesRefsUseCase),
    applicationProvider(BuscarEnCarpetaUseCase),
    // Group 3
    applicationProvider(CrearCarpetaUseCase),
    applicationProvider(CrearSubcarpetaUseCase),
    applicationProvider(CrearReferenciaCarpetaUseCase),
    applicationProvider(ActualizarCarpetaUseCase),
    applicationProvider(EliminarCarpetaUseCase),
    applicationProvider(ObtenerElementosEliminadosUseCase),
    applicationProvider(RestaurarCarpetaUseCase),
    applicationProvider(SincronizarCarpetasProyectoUseCase),
    applicationProvider(ExportarRegistroArchivosPdfUseCase),
    applicationProvider(ExportarPermisosCarpetaPdfUseCase),
    ExportacionRegistroArchivosPdfService,
    ExportacionPermisosCarpetaPdfService,
    // Infrastructure
    AutodeskApiService,
    HttpClientService,
    {
      provide: ACC_REPOSITORY,
      useClass: AccRepository,
    },
    {
      provide: AUDITORIA_REPOSITORY,
      useClass: AuditoriaRepository,
    },
    {
      provide: ACC_RESOURCES_REPOSITORY,
      useClass: AccResourcesRepository,
    },
  ],
})
export class DataManagementFoldersModule {}
