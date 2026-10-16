import { Module } from '@nestjs/common';
import { DataManagementItemsController } from '../../presentation/controllers/data-management-items.controller';
import { applicationProvider } from '../application.providers';
import { DatabaseModule } from './platform/database.module';

// Use cases - Grupo 1
import { DescargarItemUseCase } from '../../application/use-cases/data-management/items/descargar-item.use-case';
import { ObtenerItemPadreUseCase } from '../../application/use-cases/data-management/items/obtener-item-padre.use-case';
import { ObtenerItemPorIdUseCase } from '../../application/use-cases/data-management/items/obtener-item-por-id.use-case';
import { ObtenerReferenciasItemUseCase } from '../../application/use-cases/data-management/items/obtener-referencias-item.use-case';
import { ObtenerRelacionesLinksItemUseCase } from '../../application/use-cases/data-management/items/obtener-relaciones-links-item.use-case';
import { ObtenerStorageUrlItemUseCase } from '../../application/use-cases/data-management/items/obtener-storage-url-item.use-case';

// Use cases - Grupo 2
import { ActualizarItemUseCase } from '../../application/use-cases/data-management/items/actualizar-item.use-case';
import { CompletarSubidaChunkedUseCase } from '../../application/use-cases/data-management/items/completar-subida-chunked.use-case';
import { CopiarItemUseCase } from '../../application/use-cases/data-management/items/copiar-item.use-case';
import { CrearItemUseCase } from '../../application/use-cases/data-management/items/crear-item.use-case';
import { CrearReferenciaItemUseCase } from '../../application/use-cases/data-management/items/crear-referencia-item.use-case';
import { DesplazarItemUseCase } from '../../application/use-cases/data-management/items/desplazar-item.use-case';
import { EliminarItemUseCase } from '../../application/use-cases/data-management/items/eliminar-item.use-case';
import { IniciarSubidaChunkedUseCase } from '../../application/use-cases/data-management/items/iniciar-subida-chunked.use-case';
import { ObtenerActividadesArchivoUseCase } from '../../application/use-cases/data-management/items/obtener-actividades-archivo.use-case';
import { ObtenerRelacionesRefsItemUseCase } from '../../application/use-cases/data-management/items/obtener-relaciones-refs-item.use-case';
import { ObtenerTipVersionUseCase } from '../../application/use-cases/data-management/items/obtener-tip-version.use-case';
import { ObtenerUrlsSubidaChunkedUseCase } from '../../application/use-cases/data-management/items/obtener-urls-subida-chunked.use-case';
import { ObtenerVersionesUseCase } from '../../application/use-cases/data-management/items/obtener-versiones.use-case';
import { RestaurarItemUseCase } from '../../application/use-cases/data-management/items/restaurar-item.use-case';
import { SubirArchivoUseCase } from '../../application/use-cases/data-management/items/subir-archivo.use-case';

// Infrastructure
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { AUDITORIA_REPOSITORY } from '../../domain/repositories/auditoria.repository.interface';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { AuditoriaRepository } from '../../infrastructure/repositories/auditoria.repository';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DataManagementItemsController],
  providers: [
    // Use cases - Grupo 1
    applicationProvider(ObtenerItemPorIdUseCase),
    applicationProvider(DescargarItemUseCase),
    applicationProvider(ObtenerStorageUrlItemUseCase),
    applicationProvider(ObtenerItemPadreUseCase),
    applicationProvider(ObtenerReferenciasItemUseCase),
    applicationProvider(ObtenerRelacionesLinksItemUseCase),
    // Use cases - Grupo 2
    applicationProvider(ObtenerRelacionesRefsItemUseCase),
    applicationProvider(ObtenerTipVersionUseCase),
    applicationProvider(ObtenerVersionesUseCase),
    applicationProvider(ObtenerActividadesArchivoUseCase),
    // Upload
    applicationProvider(SubirArchivoUseCase),
    applicationProvider(IniciarSubidaChunkedUseCase),
    applicationProvider(ObtenerUrlsSubidaChunkedUseCase),
    applicationProvider(CompletarSubidaChunkedUseCase),
    // Create/Update/Delete
    applicationProvider(CrearItemUseCase),
    applicationProvider(CrearReferenciaItemUseCase),
    applicationProvider(ActualizarItemUseCase),
    applicationProvider(EliminarItemUseCase),
    applicationProvider(RestaurarItemUseCase),
    applicationProvider(DesplazarItemUseCase),
    applicationProvider(CopiarItemUseCase),
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
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
  ],
})
export class DataManagementItemsModule {}
