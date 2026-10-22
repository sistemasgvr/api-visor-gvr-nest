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
import { RequireScopedPermission } from '../../infrastructure/auth/granular-permission.guard';
import { ActorId } from '../http/granted-scopes.decorator';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import * as Dto from '../dtos/planificacion/proyectos/planificacion.dto';
import { MisAsignacionesUseCase } from '../../application/use-cases/planificacion/proyectos/mis-asignaciones.use-case';
import { EstadoParteUseCase } from '../../application/use-cases/planificacion/proyectos/estado-parte.use-case';
import { SolicitarAmpliacionUseCase } from '../../application/use-cases/planificacion/proyectos/solicitar-ampliacion.use-case';
import { MisAmpliacionesUseCase } from '../../application/use-cases/planificacion/proyectos/mis-ampliaciones.use-case';
@ApiTags('planificacion-proyectos')
@ApiBearerAuth('access-token')
@Controller('planificacion')
@UseGuards(JwtAuthGuard)
export class PlanificacionColaboradorController {
  constructor(
    private readonly misAsignacionesUseCase: MisAsignacionesUseCase,
    private readonly estadoParteUseCase: EstadoParteUseCase,
    private readonly solicitarAmpliacionUseCase: SolicitarAmpliacionUseCase,
    private readonly misAmpliacionesUseCase: MisAmpliacionesUseCase,
  ) {}
  @Get('mis-asignaciones')
  @HttpCode(200)
  @RequireScopedPermission('control_operativo.actividades.ver')
  async misAsignaciones(
    @ActorId() actor: number,
    @Query() data: Dto.MisAsignacionesDto,
  ) {
    return ApiResponseDto.success(
      await this.misAsignacionesUseCase.execute(actor, data),
    );
  }
  @Patch('mis-asignaciones/:idAsignacion/estado')
  @HttpCode(200)
  @RequireScopedPermission('control_operativo.actividades.editar')
  async estadoParte(
    @ActorId() actor: number,
    @Param() params: Dto.AsignacionParamsDto,
    @Body() data: Dto.EstadoParteDto,
  ) {
    return ApiResponseDto.success(
      await this.estadoParteUseCase.execute(actor, params.idAsignacion, data),
    );
  }
  @Post('mis-asignaciones/:idAsignacion/ampliaciones')
  @HttpCode(201)
  @RequireScopedPermission('control_operativo.actividades.editar')
  async solicitarAmpliacion(
    @ActorId() actor: number,
    @Param() params: Dto.AsignacionParamsDto,
    @Body() data: Dto.SolicitarAmpliacionDto,
  ) {
    return ApiResponseDto.created(
      await this.solicitarAmpliacionUseCase.execute(
        actor,
        params.idAsignacion,
        data,
      ),
    );
  }
  @Get('mis-ampliaciones')
  @HttpCode(200)
  @RequireScopedPermission('control_operativo.actividades.ver')
  async misAmpliaciones(
    @ActorId() actor: number,
    @Query() data: Dto.MisAmpliacionesDto,
  ) {
    return ApiResponseDto.success(
      await this.misAmpliacionesUseCase.execute(actor, data),
    );
  }
}
