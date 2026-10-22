import { AuthorizationModule } from './platform/authorization.module';
import { Module } from '@nestjs/common';
import { PLANIFICACION_REPOSITORY } from '../../domain/repositories/planificacion.repository.interface';
import { PlanificacionRepository } from '../../infrastructure/repositories/planificacion.repository';
import { PlanificacionAccessService } from '../../application/services/planificacion-access.service';
import { PlanificacionController } from '../../presentation/controllers/planificacion.controller';
import { PlanificacionColaboradorController } from '../../presentation/controllers/planificacion-colaborador.controller';
import { DatabaseModule } from './platform/database.module';
import { AuthenticationModule } from './platform/authentication.module';
import { applicationProvider } from '../application.providers';
import { ObtenerPlanUseCase } from '../../application/use-cases/planificacion/proyectos/obtener-plan.use-case';
import { CrearPlanUseCase } from '../../application/use-cases/planificacion/proyectos/crear-plan.use-case';
import { ObtenerCronogramaUseCase } from '../../application/use-cases/planificacion/proyectos/obtener-cronograma.use-case';
import { ActualizarReglasUseCase } from '../../application/use-cases/planificacion/proyectos/actualizar-reglas.use-case';
import { CrearActividadPlanUseCase } from '../../application/use-cases/planificacion/proyectos/crear-actividad.use-case';
import { ObtenerActividadPlanUseCase } from '../../application/use-cases/planificacion/proyectos/obtener-actividad.use-case';
import { EditarActividadUseCase } from '../../application/use-cases/planificacion/proyectos/editar-actividad.use-case';
import { EliminarActividadPlanUseCase } from '../../application/use-cases/planificacion/proyectos/eliminar-actividad.use-case';
import { GuardarAsignacionesUseCase } from '../../application/use-cases/planificacion/proyectos/guardar-asignaciones.use-case';
import { GuardarDependenciasUseCase } from '../../application/use-cases/planificacion/proyectos/guardar-dependencias.use-case';
import { ReordenarUseCase } from '../../application/use-cases/planificacion/proyectos/reordenar.use-case';
import { PrevisualizarUseCase } from '../../application/use-cases/planificacion/proyectos/previsualizar.use-case';
import { PublicarUseCase } from '../../application/use-cases/planificacion/proyectos/publicar.use-case';
import { LineaBaseUseCase } from '../../application/use-cases/planificacion/proyectos/linea-base.use-case';
import { ReprogramarUseCase } from '../../application/use-cases/planificacion/proyectos/reprogramar.use-case';
import { EstadoActividadUseCase } from '../../application/use-cases/planificacion/proyectos/estado-actividad.use-case';
import { EstadoPlanUseCase } from '../../application/use-cases/planificacion/proyectos/estado-plan.use-case';
import { HistorialUseCase } from '../../application/use-cases/planificacion/proyectos/historial.use-case';
import { AmpliacionesUseCase } from '../../application/use-cases/planificacion/proyectos/ampliaciones.use-case';
import { ResolverAmpliacionUseCase } from '../../application/use-cases/planificacion/proyectos/resolver-ampliacion.use-case';
import { MisAsignacionesUseCase } from '../../application/use-cases/planificacion/proyectos/mis-asignaciones.use-case';
import { EstadoParteUseCase } from '../../application/use-cases/planificacion/proyectos/estado-parte.use-case';
import { SolicitarAmpliacionUseCase } from '../../application/use-cases/planificacion/proyectos/solicitar-ampliacion.use-case';
import { MisAmpliacionesUseCase } from '../../application/use-cases/planificacion/proyectos/mis-ampliaciones.use-case';
@Module({
  imports: [DatabaseModule, AuthenticationModule, AuthorizationModule],
  controllers: [PlanificacionController, PlanificacionColaboradorController],
  providers: [
    { provide: PLANIFICACION_REPOSITORY, useClass: PlanificacionRepository },
    applicationProvider(PlanificacionAccessService),
    applicationProvider(ObtenerPlanUseCase),
    applicationProvider(CrearPlanUseCase),
    applicationProvider(ObtenerCronogramaUseCase),
    applicationProvider(ActualizarReglasUseCase),
    applicationProvider(CrearActividadPlanUseCase),
    applicationProvider(ObtenerActividadPlanUseCase),
    applicationProvider(EditarActividadUseCase),
    applicationProvider(EliminarActividadPlanUseCase),
    applicationProvider(GuardarAsignacionesUseCase),
    applicationProvider(GuardarDependenciasUseCase),
    applicationProvider(ReordenarUseCase),
    applicationProvider(PrevisualizarUseCase),
    applicationProvider(PublicarUseCase),
    applicationProvider(LineaBaseUseCase),
    applicationProvider(ReprogramarUseCase),
    applicationProvider(EstadoActividadUseCase),
    applicationProvider(EstadoPlanUseCase),
    applicationProvider(HistorialUseCase),
    applicationProvider(AmpliacionesUseCase),
    applicationProvider(ResolverAmpliacionUseCase),
    applicationProvider(MisAsignacionesUseCase),
    applicationProvider(EstadoParteUseCase),
    applicationProvider(SolicitarAmpliacionUseCase),
    applicationProvider(MisAmpliacionesUseCase),
  ],
  exports: [PlanificacionAccessService, PLANIFICACION_REPOSITORY],
})
export class PlanificacionModule {}
