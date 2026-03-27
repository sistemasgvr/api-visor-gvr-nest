import { Module } from '@nestjs/common';
import { ControlOperativoController } from '../controllers/control-operativo.controller';
import { ListarJornadasTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-jornadas-trabajador.use-case';
import { ListarTrabajadoresParaFiltroUseCase } from '../../application/use-cases/control-operativo/listar-trabajadores-para-filtro.use-case';
import { CrearJornadaUseCase } from '../../application/use-cases/control-operativo/crear-jornada.use-case';
import { ListarActividadesUseCase } from '../../application/use-cases/control-operativo/listar-actividades.use-case';
import { CronCierreJornadasUseCase } from '../../application/use-cases/control-operativo/cron-cierre-jornadas.use-case';
import { ActualizarEstadoJornadaUseCase } from '../../application/use-cases/control-operativo/actualizar-estado-jornada.use-case';
import { ListarProyectosAccesoTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-proyectos-acceso-trabajador.use-case';
import { ListarTrabajadoresSinJornadaHoyUseCase } from '../../application/use-cases/control-operativo/listar-trabajadores-sin-jornada-hoy.use-case';
import { ListarTrabajadoresSinActividadesHoyUseCase } from '../../application/use-cases/control-operativo/listar-trabajadores-sin-actividades-hoy.use-case';
import { CrearActividadUseCase } from '../../application/use-cases/control-operativo/crear-actividad.use-case';
import { ObtenerActividadUseCase } from '../../application/use-cases/control-operativo/obtener-actividad.use-case';
import { ListarObservacionesActividadUseCase } from '../../application/use-cases/control-operativo/listar-observaciones-actividad.use-case';
import { ActualizarActividadUseCase } from '../../application/use-cases/control-operativo/actualizar-actividad.use-case';
import { EliminarActividadUseCase } from '../../application/use-cases/control-operativo/eliminar-actividad.use-case';
import { ListarActividadesValidacionUseCase } from '../../application/use-cases/control-operativo/listar-actividades-validacion.use-case';
import { ListarValorizacionUseCase } from '../../application/use-cases/control-operativo/listar-valorizacion.use-case';
import { ListarDesempenoUseCase } from '../../application/use-cases/control-operativo/listar-desempeno.use-case';
import { ListarTrabajadoresPorProyectoUseCase } from '../../application/use-cases/control-operativo/listar-trabajadores-por-proyecto.use-case';
import { ValidarActividadUseCase } from '../../application/use-cases/control-operativo/validar-actividad.use-case';
import { ListarReporteGeneralUseCase } from '../../application/use-cases/control-operativo/listar-reporte-general.use-case';
import { ControlOperativoRepository } from '../../infrastructure/repositories/control-operativo.repository';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { BroadcastModule } from './broadcast.module';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProyectoModule } from './proyecto.module';

@Module({
    imports: [
        DatabaseModule,
        BroadcastModule,
        ProyectoModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'default-secret-key-change-in-production',
                signOptions: {
                    expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1d') as any,
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [ControlOperativoController],
    providers: [
        {
            provide: CONTROL_OPERATIVO_REPOSITORY,
            useClass: ControlOperativoRepository,
        },
        {
            provide: AUTH_REPOSITORY,
            useClass: AuthRepository,
        },
        ListarJornadasTrabajadorUseCase,
        ListarTrabajadoresParaFiltroUseCase,
        CrearJornadaUseCase,
        ListarActividadesUseCase,
        CronCierreJornadasUseCase,
        ActualizarEstadoJornadaUseCase,
        ListarProyectosAccesoTrabajadorUseCase,
        ListarTrabajadoresSinJornadaHoyUseCase,
        ListarTrabajadoresSinActividadesHoyUseCase,
        CrearActividadUseCase,
        ObtenerActividadUseCase,
        ListarObservacionesActividadUseCase,
        ActualizarActividadUseCase,
        EliminarActividadUseCase,
        ListarActividadesValidacionUseCase,
        ListarValorizacionUseCase,
        ListarDesempenoUseCase,
        ListarTrabajadoresPorProyectoUseCase,
        ValidarActividadUseCase,
        ListarReporteGeneralUseCase,
        JwtStrategy,
    ],
    exports: [CONTROL_OPERATIVO_REPOSITORY],
})
export class ControlOperativoModule {}
