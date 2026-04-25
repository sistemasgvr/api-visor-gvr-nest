import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProyectoController } from '../controllers/proyecto.controller';
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
import { ListarCoordinadoresProyectoUseCase } from '../../application/use-cases/proyecto/listar-coordinadores-proyecto.use-case';
import { GuardarCoordinadoresProyectoUseCase } from '../../application/use-cases/proyecto/guardar-coordinadores-proyecto.use-case';
import { ListarEstadisticasProyectosPorEstadoUseCase } from '../../application/use-cases/proyecto/listar-estadisticas-proyectos-por-estado.use-case';
import { ProyectoRepository } from '../../infrastructure/repositories/proyecto.repository';
import { PROYECTO_REPOSITORY } from '../../domain/repositories/proyecto.repository.interface';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy';

@Module({
  imports: [
    DatabaseModule,
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
  controllers: [ProyectoController],
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
    ListarCoordinadoresProyectoUseCase,
    GuardarCoordinadoresProyectoUseCase,
    ListarEstadisticasProyectosPorEstadoUseCase,
    JwtStrategy,
  ],
  exports: [PROYECTO_REPOSITORY],
})
export class ProyectoModule {}
