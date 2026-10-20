import { Module } from '@nestjs/common';
import { ActualizarDocumentoProyectoUseCase } from '../../application/use-cases/proyecto/actualizar-documento-proyecto.use-case';
import { ActualizarEntregableProyectoUseCase } from '../../application/use-cases/proyecto/actualizar-entregable-proyecto.use-case';
import { ActualizarNivelAccesoProyectoUseCase } from '../../application/use-cases/proyecto/actualizar-nivel-acceso-proyecto.use-case';
import { AsignarAccesoProyectoUseCase } from '../../application/use-cases/proyecto/asignar-acceso-proyecto.use-case';
import { CrearDocumentoProyectoUseCase } from '../../application/use-cases/proyecto/crear-documento-proyecto.use-case';
import { CrearEntregableProyectoUseCase } from '../../application/use-cases/proyecto/crear-entregable-proyecto.use-case';
import { CrearProyectoUseCase } from '../../application/use-cases/proyecto/crear-proyecto.use-case';
import { EditarProyectoUseCase } from '../../application/use-cases/proyecto/editar-proyecto.use-case';
import { EliminarDocumentoProyectoUseCase } from '../../application/use-cases/proyecto/eliminar-documento-proyecto.use-case';
import { EliminarEntregableProyectoUseCase } from '../../application/use-cases/proyecto/eliminar-entregable-proyecto.use-case';
import { EliminarProyectoUseCase } from '../../application/use-cases/proyecto/eliminar-proyecto.use-case';
import { GuardarCoordinadoresProyectoUseCase } from '../../application/use-cases/proyecto/guardar-coordinadores-proyecto.use-case';
import { ListarCoordinadoresProyectoUseCase } from '../../application/use-cases/proyecto/listar-coordinadores-proyecto.use-case';
import { ListarDocumentosProyectoUseCase } from '../../application/use-cases/proyecto/listar-documentos-proyecto.use-case';
import { ListarEntregablesProyectoUseCase } from '../../application/use-cases/proyecto/listar-entregables-proyecto.use-case';
import { ListarEntregablesSelectProyectoUseCase } from '../../application/use-cases/proyecto/listar-entregables-select-proyecto.use-case';
import { ListarEstadisticasProyectosPorEstadoUseCase } from '../../application/use-cases/proyecto/listar-estadisticas-proyectos-por-estado.use-case';
import { ListarProyectosUseCase } from '../../application/use-cases/proyecto/listar-proyectos.use-case';
import { ListarUsuariosDisponiblesProyectoUseCase } from '../../application/use-cases/proyecto/listar-usuarios-disponibles-proyecto.use-case';
import { ListarUsuariosProyectoUseCase } from '../../application/use-cases/proyecto/listar-usuarios-proyecto.use-case';
import { ObtenerEntregableProyectoUseCase } from '../../application/use-cases/proyecto/obtener-entregable-proyecto.use-case';
import { ObtenerProyectoUseCase } from '../../application/use-cases/proyecto/obtener-proyecto.use-case';
import { RemoverAccesoProyectoUseCase } from '../../application/use-cases/proyecto/remover-acceso-proyecto.use-case';
import { PROYECTO_REPOSITORY } from '../../domain/repositories/proyecto.repository.interface';
import { ProyectoRepository } from '../../infrastructure/repositories/proyecto.repository';
import { EntregableController } from '../../presentation/controllers/entregable.controller';
import { ProyectoController } from '../../presentation/controllers/proyecto.controller';
import { applicationProvider } from '../application.providers';
import { BroadcastModule } from './broadcast.module';
import { AuthenticationModule } from './platform/authentication.module';
import { DatabaseModule } from './platform/database.module';
import { StorageModule } from './platform/storage.module';

@Module({
  imports: [
    DatabaseModule,
    BroadcastModule,
    StorageModule,
    AuthenticationModule,
  ],
  controllers: [ProyectoController, EntregableController],
  providers: [
    {
      provide: PROYECTO_REPOSITORY,
      useClass: ProyectoRepository,
    },
    applicationProvider(ListarProyectosUseCase),
    applicationProvider(ObtenerProyectoUseCase),
    applicationProvider(CrearProyectoUseCase),
    applicationProvider(EditarProyectoUseCase),
    applicationProvider(EliminarProyectoUseCase),
    applicationProvider(ListarUsuariosProyectoUseCase),
    applicationProvider(AsignarAccesoProyectoUseCase),
    applicationProvider(ActualizarNivelAccesoProyectoUseCase),
    applicationProvider(RemoverAccesoProyectoUseCase),
    applicationProvider(ListarUsuariosDisponiblesProyectoUseCase),
    applicationProvider(ListarDocumentosProyectoUseCase),
    applicationProvider(CrearDocumentoProyectoUseCase),
    applicationProvider(ActualizarDocumentoProyectoUseCase),
    applicationProvider(EliminarDocumentoProyectoUseCase),
    applicationProvider(ListarEntregablesProyectoUseCase),
    applicationProvider(ListarEntregablesSelectProyectoUseCase),
    applicationProvider(ObtenerEntregableProyectoUseCase),
    applicationProvider(CrearEntregableProyectoUseCase),
    applicationProvider(ActualizarEntregableProyectoUseCase),
    applicationProvider(EliminarEntregableProyectoUseCase),
    applicationProvider(ListarCoordinadoresProyectoUseCase),
    applicationProvider(GuardarCoordinadoresProyectoUseCase),
    applicationProvider(ListarEstadisticasProyectosPorEstadoUseCase),
  ],
  exports: [PROYECTO_REPOSITORY, ListarCoordinadoresProyectoUseCase],
})
export class ProyectoModule {}
