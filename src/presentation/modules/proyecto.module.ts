import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProyectoController } from '../controllers/proyecto.controller';
import { EntregableController } from '../controllers/entregable.controller';
import { ListarProyectosUseCase } from '../../application/use-cases/proyecto/listar-proyectos.use-case';
import { ObtenerProyectoUseCase } from '../../application/use-cases/proyecto/obtener-proyecto.use-case';
import { CrearProyectoUseCase } from '../../application/use-cases/proyecto/crear-proyecto.use-case';
import { EditarProyectoUseCase } from '../../application/use-cases/proyecto/editar-proyecto.use-case';
import { EliminarProyectoUseCase } from '../../application/use-cases/proyecto/eliminar-proyecto.use-case';
import { ListarUsuariosProyectoUseCase } from '../../application/use-cases/proyecto/listar-usuarios-proyecto.use-case';
import { AsignarAccesoProyectoUseCase } from '../../application/use-cases/proyecto/asignar-acceso-proyecto.use-case';
import { ActualizarNivelAccesoProyectoUseCase } from '../../application/use-cases/proyecto/actualizar-nivel-acceso-proyecto.use-case';
import { RemoverAccesoProyectoUseCase } from '../../application/use-cases/proyecto/remover-acceso-proyecto.use-case';
import { ListarUsuariosDisponiblesProyectoUseCase } from '../../application/use-cases/proyecto/listar-usuarios-disponibles-proyecto.use-case';
import { ListarDocumentosProyectoUseCase } from '../../application/use-cases/proyecto/listar-documentos-proyecto.use-case';
import { CrearDocumentoProyectoUseCase } from '../../application/use-cases/proyecto/crear-documento-proyecto.use-case';
import { ActualizarDocumentoProyectoUseCase } from '../../application/use-cases/proyecto/actualizar-documento-proyecto.use-case';
import { EliminarDocumentoProyectoUseCase } from '../../application/use-cases/proyecto/eliminar-documento-proyecto.use-case';
import { ListarEntregablesProyectoUseCase } from '../../application/use-cases/proyecto/listar-entregables-proyecto.use-case';
import { ListarEntregablesSelectProyectoUseCase } from '../../application/use-cases/proyecto/listar-entregables-select-proyecto.use-case';
import { ObtenerEntregableProyectoUseCase } from '../../application/use-cases/proyecto/obtener-entregable-proyecto.use-case';
import { CrearEntregableProyectoUseCase } from '../../application/use-cases/proyecto/crear-entregable-proyecto.use-case';
import { ActualizarEntregableProyectoUseCase } from '../../application/use-cases/proyecto/actualizar-entregable-proyecto.use-case';
import { EliminarEntregableProyectoUseCase } from '../../application/use-cases/proyecto/eliminar-entregable-proyecto.use-case';
import { ListarCoordinadoresProyectoUseCase } from '../../application/use-cases/proyecto/listar-coordinadores-proyecto.use-case';
import { GuardarCoordinadoresProyectoUseCase } from '../../application/use-cases/proyecto/guardar-coordinadores-proyecto.use-case';
import { ListarEstadisticasProyectosPorEstadoUseCase } from '../../application/use-cases/proyecto/listar-estadisticas-proyectos-por-estado.use-case';
import { ProyectoRepository } from '../../infrastructure/repositories/proyecto.repository';
import { PROYECTO_REPOSITORY } from '../../domain/repositories/proyecto.repository.interface';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy';
import { BroadcastModule } from './broadcast.module';
import { StorageModule } from '../../infrastructure/storage/storage.module';

@Module({
  imports: [
    DatabaseModule,
    BroadcastModule,
    StorageModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'default-secret-key-change-in-production',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ||
            '1d') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ProyectoController, EntregableController],
  providers: [
    {
      provide: PROYECTO_REPOSITORY,
      useClass: ProyectoRepository,
    },
    ListarProyectosUseCase,
    ObtenerProyectoUseCase,
    CrearProyectoUseCase,
    EditarProyectoUseCase,
    EliminarProyectoUseCase,
    ListarUsuariosProyectoUseCase,
    AsignarAccesoProyectoUseCase,
    ActualizarNivelAccesoProyectoUseCase,
    RemoverAccesoProyectoUseCase,
    ListarUsuariosDisponiblesProyectoUseCase,
    ListarDocumentosProyectoUseCase,
    CrearDocumentoProyectoUseCase,
    ActualizarDocumentoProyectoUseCase,
    EliminarDocumentoProyectoUseCase,
    ListarEntregablesProyectoUseCase,
    ListarEntregablesSelectProyectoUseCase,
    ObtenerEntregableProyectoUseCase,
    CrearEntregableProyectoUseCase,
    ActualizarEntregableProyectoUseCase,
    EliminarEntregableProyectoUseCase,
    ListarCoordinadoresProyectoUseCase,
    GuardarCoordinadoresProyectoUseCase,
    ListarEstadisticasProyectosPorEstadoUseCase,
    JwtStrategy,
  ],
  exports: [PROYECTO_REPOSITORY],
})
export class ProyectoModule {}
