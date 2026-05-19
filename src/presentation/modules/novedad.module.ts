import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NovedadController } from '../controllers/novedad.controller';
import { NovedadRepository } from '../../infrastructure/repositories/novedad.repository';
import { NOVEDAD_REPOSITORY } from '../../domain/repositories/novedad.repository.interface';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy';
import { ListarNovedadLanzamientosUseCase } from '../../application/use-cases/novedad/listar-novedad-lanzamientos.use-case';
import { ObtenerNovedadLanzamientoUseCase } from '../../application/use-cases/novedad/obtener-novedad-lanzamiento.use-case';
import { CrearNovedadLanzamientoUseCase } from '../../application/use-cases/novedad/crear-novedad-lanzamiento.use-case';
import { EditarNovedadLanzamientoUseCase } from '../../application/use-cases/novedad/editar-novedad-lanzamiento.use-case';
import { EliminarNovedadLanzamientoUseCase } from '../../application/use-cases/novedad/eliminar-novedad-lanzamiento.use-case';
import { SincronizarRolesNovedadUseCase } from '../../application/use-cases/novedad/sincronizar-roles-novedad.use-case';
import { CrearNovedadTarjetaUseCase } from '../../application/use-cases/novedad/crear-novedad-tarjeta.use-case';
import { EditarNovedadTarjetaUseCase } from '../../application/use-cases/novedad/editar-novedad-tarjeta.use-case';
import { EliminarNovedadTarjetaUseCase } from '../../application/use-cases/novedad/eliminar-novedad-tarjeta.use-case';
import { ObtenerNovedadPendientesUsuarioUseCase } from '../../application/use-cases/novedad/obtener-novedad-pendientes-usuario.use-case';
import { MarcarNovedadVistaUseCase } from '../../application/use-cases/novedad/marcar-novedad-vista.use-case';

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
  controllers: [NovedadController],
  providers: [
    {
      provide: NOVEDAD_REPOSITORY,
      useClass: NovedadRepository,
    },
    ListarNovedadLanzamientosUseCase,
    ObtenerNovedadLanzamientoUseCase,
    CrearNovedadLanzamientoUseCase,
    EditarNovedadLanzamientoUseCase,
    EliminarNovedadLanzamientoUseCase,
    SincronizarRolesNovedadUseCase,
    CrearNovedadTarjetaUseCase,
    EditarNovedadTarjetaUseCase,
    EliminarNovedadTarjetaUseCase,
    ObtenerNovedadPendientesUsuarioUseCase,
    MarcarNovedadVistaUseCase,
    JwtStrategy,
  ],
  exports: [NOVEDAD_REPOSITORY],
})
export class NovedadModule {}
