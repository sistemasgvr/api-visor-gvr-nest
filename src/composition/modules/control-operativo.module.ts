import { Module } from '@nestjs/common';
import { ActualizarActividadUseCase } from '../../application/use-cases/control-operativo/actualizar-actividad.use-case';
import { ActualizarEstadoJornadaUseCase } from '../../application/use-cases/control-operativo/actualizar-estado-jornada.use-case';
import { AgregarEvidenciasActividadUseCase } from '../../application/use-cases/control-operativo/agregar-evidencias-actividad.use-case';
import { CrearActividadUseCase } from '../../application/use-cases/control-operativo/crear-actividad.use-case';
import { CrearJornadaUseCase } from '../../application/use-cases/control-operativo/crear-jornada.use-case';
import { CronAlertaActividadesSinValidarUseCase } from '../../application/use-cases/control-operativo/cron-alerta-actividades-sin-validar.use-case';
import { CronCierreJornadasUseCase } from '../../application/use-cases/control-operativo/cron-cierre-jornadas.use-case';
import { EliminarActividadUseCase } from '../../application/use-cases/control-operativo/eliminar-actividad.use-case';
import { EliminarEvidenciaActividadUseCase } from '../../application/use-cases/control-operativo/eliminar-evidencia-actividad.use-case';
import { ExportarActividadesJornadasWordMasivoUseCase } from '../../application/use-cases/control-operativo/exportar-actividades-jornadas-word-masivo.use-case';
import { ExportarActividadesJornadasWordUseCase } from '../../application/use-cases/control-operativo/exportar-actividades-jornadas-word.use-case';
import { ListarActividadesObservadasSubsanarUseCase } from '../../application/use-cases/control-operativo/listar-actividades-observadas-subsanar.use-case';
import { ListarActividadesValidacionUseCase } from '../../application/use-cases/control-operativo/listar-actividades-validacion.use-case';
import { ListarActividadesUseCase } from '../../application/use-cases/control-operativo/listar-actividades.use-case';
import { ListarDesempenoUseCase } from '../../application/use-cases/control-operativo/listar-desempeno.use-case';
import { ListarJornadasTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-jornadas-trabajador.use-case';
import { ListarLideresEquipoReporteGeneralUseCase } from '../../application/use-cases/control-operativo/listar-lideres-equipo-reporte-general.use-case';
import { ListarObservacionesActividadUseCase } from '../../application/use-cases/control-operativo/listar-observaciones-actividad.use-case';
import { ListarProyectosAccesoTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-proyectos-acceso-trabajador.use-case';
import { ListarProyectosParaValidacionUseCase } from '../../application/use-cases/control-operativo/listar-proyectos-para-validacion.use-case';
import { ListarReporteGeneralUseCase } from '../../application/use-cases/control-operativo/listar-reporte-general.use-case';
import { ListarReporteHorasMesProyectoTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-reporte-horas-mes-proyecto-trabajador.use-case';
import { ListarReporteHorasRangoDetalleProyectoUseCase } from '../../application/use-cases/control-operativo/listar-reporte-horas-rango-detalle-proyecto.use-case';
import { ListarTrabajadoresParaFiltroUseCase } from '../../application/use-cases/control-operativo/listar-trabajadores-para-filtro.use-case';
import { ListarTrabajadoresPorProyectoUseCase } from '../../application/use-cases/control-operativo/listar-trabajadores-por-proyecto.use-case';
import { ListarTrabajadoresSinActividadesHoyUseCase } from '../../application/use-cases/control-operativo/listar-trabajadores-sin-actividades-hoy.use-case';
import { ListarTrabajadoresSinJornadaHoyUseCase } from '../../application/use-cases/control-operativo/listar-trabajadores-sin-jornada-hoy.use-case';
import { ListarValorizacionUseCase } from '../../application/use-cases/control-operativo/listar-valorizacion.use-case';
import { ObtenerActividadUseCase } from '../../application/use-cases/control-operativo/obtener-actividad.use-case';
import { ValidarActividadUseCase } from '../../application/use-cases/control-operativo/validar-actividad.use-case';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../domain/repositories/control-operativo.repository.interface';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { ControlOperativoRepository } from '../../infrastructure/repositories/control-operativo.repository';
import { ControlOperativoController } from '../../presentation/controllers/control-operativo.controller';
import { applicationProvider } from '../application.providers';
import { BroadcastModule } from './broadcast.module';
import { AuthenticationModule } from './platform/authentication.module';
import { DatabaseModule } from './platform/database.module';
import { StorageModule } from './platform/storage.module';
import { ProyectoModule } from './proyecto.module';

@Module({
  imports: [
    DatabaseModule,
    BroadcastModule,
    ProyectoModule,
    StorageModule,
    AuthenticationModule,
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
    applicationProvider(ListarJornadasTrabajadorUseCase),
    applicationProvider(ListarTrabajadoresParaFiltroUseCase),
    applicationProvider(CrearJornadaUseCase),
    applicationProvider(ListarActividadesUseCase),
    applicationProvider(CronCierreJornadasUseCase),
    applicationProvider(ActualizarEstadoJornadaUseCase),
    applicationProvider(ListarProyectosAccesoTrabajadorUseCase),
    applicationProvider(ListarProyectosParaValidacionUseCase),
    applicationProvider(ListarTrabajadoresSinJornadaHoyUseCase),
    applicationProvider(ListarTrabajadoresSinActividadesHoyUseCase),
    applicationProvider(CrearActividadUseCase),
    applicationProvider(AgregarEvidenciasActividadUseCase),
    applicationProvider(EliminarEvidenciaActividadUseCase),
    applicationProvider(ObtenerActividadUseCase),
    applicationProvider(ListarObservacionesActividadUseCase),
    applicationProvider(ActualizarActividadUseCase),
    applicationProvider(EliminarActividadUseCase),
    applicationProvider(ListarActividadesValidacionUseCase),
    applicationProvider(ListarActividadesObservadasSubsanarUseCase),
    applicationProvider(ListarValorizacionUseCase),
    applicationProvider(ListarDesempenoUseCase),
    applicationProvider(ListarTrabajadoresPorProyectoUseCase),
    applicationProvider(ValidarActividadUseCase),
    applicationProvider(ListarReporteGeneralUseCase),
    applicationProvider(ListarLideresEquipoReporteGeneralUseCase),
    applicationProvider(ListarReporteHorasMesProyectoTrabajadorUseCase),
    applicationProvider(ListarReporteHorasRangoDetalleProyectoUseCase),
    applicationProvider(CronAlertaActividadesSinValidarUseCase),
    applicationProvider(ExportarActividadesJornadasWordUseCase),
    applicationProvider(ExportarActividadesJornadasWordMasivoUseCase),
  ],
  exports: [CONTROL_OPERATIVO_REPOSITORY],
})
export class ControlOperativoModule {}
