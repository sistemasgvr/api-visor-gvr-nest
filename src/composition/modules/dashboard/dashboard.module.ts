import { Module } from '@nestjs/common';
import { applicationProvider } from '../../application.providers';
import { AuthenticationModule } from '../platform/authentication.module';

import { DASHBOARD_REPOSITORY } from '../../../domain/repositories/dashboard/dashboard.repository.interface';
import { DashboardRepository } from '../../../infrastructure/repositories/dashboard/dashboard.repository';
import { DashboardController } from '../../../presentation/controllers/dashboard/dashboard.controller';
import { DatabaseModule } from '../platform/database.module';

//Dashboard principal
import { ObtenerCantidadActividadesObservadasUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-actividades-observadas.use-case';
import { ObtenerCantidadActividadesPendientesUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-actividades-pendientes.use-case';
import { ObtenerCantidadActividadesRechazadasUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-actividades-rechazadas.use-case';
import { ObtenerCantidadJornadasCompletasSemanaUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-jornadas-completas-semana.use-case';
import { ObtenerCantidadProyectosVigentesUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-proyectos-vigentes.use-case';
import { ObtenerCantidadTrabajadoresActivosUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-trabajadores-activos.use-case';
import { ObtenerCantidadTrabajadoresConectadoSemanaUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-trabajadores-conectado-semana.use-case';
import { ObtenerCantidadTrabajadoresPorProyectoUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-trabajadores-por-proyecto.use-case';
import { ObtenerHorasEsperadasVsRegistradasMesUseCase } from '../../../application/use-cases/dashboard/obtener-horas-esperadas-vs-registradas-mes.use-case';
import { ObtenerProyectosConProgresoUseCase } from '../../../application/use-cases/dashboard/obtener-proyectos-con-progreso.use-case';
import { ObtenerTopTrabajadoresHorasMesUseCase } from '../../../application/use-cases/dashboard/obtener-top-trabajadores-horas-mes.use-case';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  controllers: [DashboardController],
  providers: [
    {
      provide: DASHBOARD_REPOSITORY,
      useClass: DashboardRepository,
    },
    applicationProvider(ObtenerCantidadProyectosVigentesUseCase),
    applicationProvider(ObtenerCantidadTrabajadoresActivosUseCase),
    applicationProvider(ObtenerCantidadActividadesPendientesUseCase),
    applicationProvider(ObtenerCantidadActividadesObservadasUseCase),
    applicationProvider(ObtenerCantidadActividadesRechazadasUseCase),
    applicationProvider(ObtenerCantidadTrabajadoresPorProyectoUseCase),
    applicationProvider(ObtenerCantidadJornadasCompletasSemanaUseCase),
    applicationProvider(ObtenerTopTrabajadoresHorasMesUseCase),
    applicationProvider(ObtenerCantidadTrabajadoresConectadoSemanaUseCase),
    applicationProvider(ObtenerHorasEsperadasVsRegistradasMesUseCase),
    applicationProvider(ObtenerProyectosConProgresoUseCase),
  ],
})
export class DashboardModule {}
