import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RequireResourcePermission } from '../../infrastructure/auth/granular-permission.guard';
import { GVR_PROJECT_RESOURCE } from '../../infrastructure/auth/catalog-policies';
import { ActorId } from '../http/granted-scopes.decorator';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import * as Dto from '../dtos/planificacion/proyectos/planificacion.dto';
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
@ApiTags('planificacion-proyectos')
@ApiBearerAuth('access-token')
@Controller('proyectos/:id/planificacion')
@UseGuards(JwtAuthGuard)
export class PlanificacionController {
  constructor(
    private readonly obtenerPlanUseCase: ObtenerPlanUseCase,
    private readonly crearPlanUseCase: CrearPlanUseCase,
    private readonly obtenerCronogramaUseCase: ObtenerCronogramaUseCase,
    private readonly actualizarReglasUseCase: ActualizarReglasUseCase,
    private readonly crearActividadUseCase: CrearActividadPlanUseCase,
    private readonly obtenerActividadUseCase: ObtenerActividadPlanUseCase,
    private readonly editarActividadUseCase: EditarActividadUseCase,
    private readonly eliminarActividadUseCase: EliminarActividadPlanUseCase,
    private readonly guardarAsignacionesUseCase: GuardarAsignacionesUseCase,
    private readonly guardarDependenciasUseCase: GuardarDependenciasUseCase,
    private readonly reordenarUseCase: ReordenarUseCase,
    private readonly previsualizarUseCase: PrevisualizarUseCase,
    private readonly publicarUseCase: PublicarUseCase,
    private readonly lineaBaseUseCase: LineaBaseUseCase,
    private readonly reprogramarUseCase: ReprogramarUseCase,
    private readonly estadoActividadUseCase: EstadoActividadUseCase,
    private readonly estadoPlanUseCase: EstadoPlanUseCase,
    private readonly historialUseCase: HistorialUseCase,
    private readonly ampliacionesUseCase: AmpliacionesUseCase,
    private readonly resolverAmpliacionUseCase: ResolverAmpliacionUseCase,
  ) {}
  @Get('')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.ver',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async obtenerPlan(
    @ActorId() actor: number,
    @Param() params: Dto.ProyectoPlanParamsDto,
  ) {
    return ApiResponseDto.success(
      await this.obtenerPlanUseCase.execute(actor, params),
    );
  }
  @Post('')
  @HttpCode(201)
  @RequireResourcePermission(
    'proyectos.planificacion.editar',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async crearPlan(
    @ActorId() actor: number,
    @Param() params: Dto.ProyectoPlanParamsDto,
    @Body() data: Dto.CrearPlanDto,
  ) {
    return ApiResponseDto.created(
      await this.crearPlanUseCase.execute(actor, params, data),
    );
  }
  @Get(':idPlan/cronograma')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.ver',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async obtenerCronograma(
    @ActorId() actor: number,
    @Param() params: Dto.PlanParamsDto,
  ) {
    return ApiResponseDto.success(
      await this.obtenerCronogramaUseCase.execute(actor, params),
    );
  }
  @Put(':idPlan/reglas')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.configurar',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async actualizarReglas(
    @ActorId() actor: number,
    @Param() params: Dto.PlanParamsDto,
    @Body() data: Dto.ReglasPlanDto,
  ) {
    return ApiResponseDto.success(
      await this.actualizarReglasUseCase.execute(actor, params, data),
    );
  }
  @Post(':idPlan/actividades')
  @HttpCode(201)
  @RequireResourcePermission(
    'proyectos.planificacion.editar',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async crearActividad(
    @ActorId() actor: number,
    @Param() params: Dto.PlanParamsDto,
    @Body() data: Dto.CrearActividadPlanDto,
  ) {
    return ApiResponseDto.created(
      await this.crearActividadUseCase.execute(actor, params, data),
    );
  }
  @Get(':idPlan/actividades/:idActividad')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.ver',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async obtenerActividad(
    @ActorId() actor: number,
    @Param() params: Dto.ActividadPlanParamsDto,
  ) {
    return ApiResponseDto.success(
      await this.obtenerActividadUseCase.execute(actor, params),
    );
  }
  @Put(':idPlan/actividades/:idActividad')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.editar',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async editarActividad(
    @ActorId() actor: number,
    @Param() params: Dto.ActividadPlanParamsDto,
    @Body() data: Dto.EditarActividadPlanDto,
  ) {
    return ApiResponseDto.success(
      await this.editarActividadUseCase.execute(actor, params, data),
    );
  }
  @Delete(':idPlan/actividades/:idActividad')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.editar',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async eliminarActividad(
    @ActorId() actor: number,
    @Param() params: Dto.ActividadPlanParamsDto,
    @Query() data: Dto.RevisionActividadDto,
  ) {
    return ApiResponseDto.success(
      await this.eliminarActividadUseCase.execute(actor, params, data),
    );
  }
  @Put(':idPlan/actividades/:idActividad/asignaciones')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.editar',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async guardarAsignaciones(
    @ActorId() actor: number,
    @Param() params: Dto.ActividadPlanParamsDto,
    @Body() data: Dto.AsignacionesPlanDto,
  ) {
    return ApiResponseDto.success(
      await this.guardarAsignacionesUseCase.execute(actor, params, data),
    );
  }
  @Put(':idPlan/actividades/:idActividad/dependencias')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.editar',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async guardarDependencias(
    @ActorId() actor: number,
    @Param() params: Dto.ActividadPlanParamsDto,
    @Body() data: Dto.DependenciasPlanDto,
  ) {
    return ApiResponseDto.success(
      await this.guardarDependenciasUseCase.execute(actor, params, data),
    );
  }
  @Put(':idPlan/orden')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.editar',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async reordenar(
    @ActorId() actor: number,
    @Param() params: Dto.PlanParamsDto,
    @Body() data: Dto.OrdenPlanDto,
  ) {
    return ApiResponseDto.success(
      await this.reordenarUseCase.execute(actor, params, data),
    );
  }
  @Post(':idPlan/previsualizar')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.editar',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async previsualizar(
    @ActorId() actor: number,
    @Param() params: Dto.PlanParamsDto,
    @Body() data: Dto.PrevisualizarPlanDto,
  ) {
    return ApiResponseDto.success(
      await this.previsualizarUseCase.execute(actor, params, data),
    );
  }
  @Post(':idPlan/publicar')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.publicar',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async publicar(
    @ActorId() actor: number,
    @Param() params: Dto.PlanParamsDto,
    @Body() data: Dto.MotivoPlanDto,
  ) {
    return ApiResponseDto.success(
      await this.publicarUseCase.execute(actor, params, data),
    );
  }
  @Post(':idPlan/lineas-base')
  @HttpCode(201)
  @RequireResourcePermission(
    'proyectos.planificacion.publicar',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async lineaBase(
    @ActorId() actor: number,
    @Param() params: Dto.PlanParamsDto,
    @Body() data: Dto.LineaBaseDto,
  ) {
    return ApiResponseDto.created(
      await this.lineaBaseUseCase.execute(actor, params, data),
    );
  }
  @Post(':idPlan/actividades/:idActividad/reprogramar')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.reprogramar',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async reprogramar(
    @ActorId() actor: number,
    @Param() params: Dto.ActividadPlanParamsDto,
    @Body() data: Dto.ReprogramarPlanDto,
  ) {
    return ApiResponseDto.success(
      await this.reprogramarUseCase.execute(actor, params, data),
    );
  }
  @Patch(':idPlan/actividades/:idActividad/estado')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.dar_conformidad',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async estadoActividad(
    @ActorId() actor: number,
    @Param() params: Dto.ActividadPlanParamsDto,
    @Body() data: Dto.EstadoActividadPlanDto,
  ) {
    return ApiResponseDto.success(
      await this.estadoActividadUseCase.execute(actor, params, data),
    );
  }
  @Patch(':idPlan/estado')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.configurar',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async estadoPlan(
    @ActorId() actor: number,
    @Param() params: Dto.PlanParamsDto,
    @Body() data: Dto.EstadoPlanDto,
  ) {
    return ApiResponseDto.success(
      await this.estadoPlanUseCase.execute(actor, params, data),
    );
  }
  @Get(':idPlan/historial')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.ver',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async historial(
    @ActorId() actor: number,
    @Param() params: Dto.PlanParamsDto,
    @Query() data: Dto.HistorialPlanDto,
  ) {
    return ApiResponseDto.success(
      await this.historialUseCase.execute(actor, params, data),
    );
  }
  @Get(':idPlan/ampliaciones')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.ver',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async ampliaciones(
    @ActorId() actor: number,
    @Param() params: Dto.PlanParamsDto,
    @Query() data: Dto.PaginacionPlanDto,
  ) {
    return ApiResponseDto.success(
      await this.ampliacionesUseCase.execute(actor, params, data),
    );
  }
  @Patch(':idPlan/ampliaciones/:idAmpliacion')
  @HttpCode(200)
  @RequireResourcePermission(
    'proyectos.planificacion.ver',
    GVR_PROJECT_RESOURCE,
    'id',
  )
  async resolverAmpliacion(
    @ActorId() actor: number,
    @Param() params: Dto.AmpliacionPlanParamsDto,
    @Body() data: Dto.ResolverAmpliacionDto,
  ) {
    return ApiResponseDto.success(
      await this.resolverAmpliacionUseCase.execute(actor, params, data),
    );
  }
}
