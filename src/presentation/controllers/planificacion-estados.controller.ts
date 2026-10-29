import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RequireScopedPermission } from '../../infrastructure/auth/granular-permission.guard';
import { ActorId, GrantedScope } from '../http/granted-scopes.decorator';
import type { AuthorizationScope } from '../../application/ports/authorization.port';
import { ListarEstadosPlanesUseCase } from '../../application/use-cases/planificacion/proyectos/listar-estados-planes.use-case';
import { EstadosPlanesQueryDto } from '../dtos/planificacion/proyectos/estados-planes-query.dto';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
@ApiTags('planificacion-proyectos')
@ApiBearerAuth('access-token')
@Controller('proyectos/planificacion')
@UseGuards(JwtAuthGuard)
export class PlanificacionEstadosController {
  constructor(private readonly listarEstados: ListarEstadosPlanesUseCase) {}
  @Get('resumen')
  @ApiOperation({ summary: 'Avance, horas, fechas y semáforo de los planes de una página' })
  @RequireScopedPermission('proyectos.planificacion.ver')
  async resumen(
    @ActorId() actor: number,
    @GrantedScope('proyectos.planificacion.ver') alcance: AuthorizationScope,
    @Query() query: EstadosPlanesQueryDto,
  ) {
    return ApiResponseDto.success(
      await this.listarEstados.execute(actor, query.ids, alcance, true),
    );
  }
  @Get('estados')
  @ApiOperation({
    summary: 'Estado de planificación de los proyectos de una página',
  })
  @RequireScopedPermission('proyectos.planificacion.ver')
  async estados(
    @ActorId() actor: number,
    @GrantedScope('proyectos.planificacion.ver') alcance: AuthorizationScope,
    @Query() query: EstadosPlanesQueryDto,
  ) {
    return ApiResponseDto.success(
      await this.listarEstados.execute(actor, query.ids, alcance),
    );
  }
}
