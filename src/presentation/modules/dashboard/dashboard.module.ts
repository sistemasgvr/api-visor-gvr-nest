import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/infrastructure/auth/jwt.strategy';

import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { DashboardController } from 'src/presentation/controllers/dashboard/dashboard.controller';
import { DASHBOARD_REPOSITORY } from 'src/domain/repositories/dashboard/dashboard.repository.interface';
import { DashboardRepository } from 'src/infrastructure/repositories/dashboard/dashboard.repository';

//Dashboard principal
import { ObtenerCantidadProyectosVigentesUseCase } from 'src/application/use-cases/dashboard/obtener-cantidad-proyectos-vigentes.use-case';
import { ObtenerCantidadTrabajadoresActivosUseCase } from 'src/application/use-cases/dashboard/obtener-cantidad-trabajadores-activos.use-case';
import { ObtenerCantidadActividadesPendientesUseCase } from 'src/application/use-cases/dashboard/obtener-cantidad-actividades-pendientes.use-case';
import { ObtenerCantidadActividadesObservadasUseCase } from 'src/application/use-cases/dashboard/obtener-cantidad-actividades-observadas.use-case';
import { ObtenerCantidadActividadesRechazadasUseCase } from 'src/application/use-cases/dashboard/obtener-cantidad-actividades-rechazadas.use-case';
import { ObtenerCantidadTrabajadoresPorProyectoUseCase } from 'src/application/use-cases/dashboard/obtener-cantidad-trabajadores-por-proyecto.use-case';
import { ObtenerCantidadJornadasCompletasSemanaUseCase } from 'src/application/use-cases/dashboard/obtener-cantidad-jornadas-completas-semana.use-case';
import { ObtenerTopTrabajadoresHorasMesUseCase } from 'src/application/use-cases/dashboard/obtener-top-trabajadores-horas-mes.use-case';
import { ObtenerCantidadTrabajadoresConectadoSemanaUseCase } from 'src/application/use-cases/dashboard/obtener-cantidad-trabajadores-conectado-semana.use-case';
import { ObtenerHorasEsperadasVsRegistradasMesUseCase } from 'src/application/use-cases/dashboard/obtener-horas-esperadas-vs-registradas-mes.use-case';
import { ObtenerProyectosConProgresoUseCase } from 'src/application/use-cases/dashboard/obtener-proyectos-con-progreso.use-case';

@Module({
    imports: [
        DatabaseModule,
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
    controllers: [DashboardController],
    providers: [
        {
            provide: DASHBOARD_REPOSITORY,
            useClass: DashboardRepository,
        },
        ObtenerCantidadProyectosVigentesUseCase,
        ObtenerCantidadTrabajadoresActivosUseCase,
        ObtenerCantidadActividadesPendientesUseCase,
        ObtenerCantidadActividadesObservadasUseCase,
        ObtenerCantidadActividadesRechazadasUseCase,
        ObtenerCantidadTrabajadoresPorProyectoUseCase,
        ObtenerCantidadJornadasCompletasSemanaUseCase,
        ObtenerTopTrabajadoresHorasMesUseCase,
        ObtenerCantidadTrabajadoresConectadoSemanaUseCase,
        ObtenerHorasEsperadasVsRegistradasMesUseCase,
        ObtenerProyectosConProgresoUseCase,

        JwtStrategy,
    ],
})
export class DashboardModule { }