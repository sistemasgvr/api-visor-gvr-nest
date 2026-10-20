import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import type { JwtPayload } from '../../infrastructure/auth/jwt.strategy';
import { RequireScopedPermission } from '../../infrastructure/auth/granular-permission.guard';
import { AuthorizationService } from '../../application/services/authorization.service';
import { GrantedScope } from '../http/granted-scopes.decorator';
import type { AuthorizationScope } from '../../application/ports/authorization.port';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import { ListarEntregablesProyectoUseCase } from '../../application/use-cases/proyecto/listar-entregables-proyecto.use-case';
import { ListarEntregablesSelectProyectoUseCase } from '../../application/use-cases/proyecto/listar-entregables-select-proyecto.use-case';
import { ObtenerEntregableProyectoUseCase } from '../../application/use-cases/proyecto/obtener-entregable-proyecto.use-case';
import { CrearEntregableProyectoUseCase } from '../../application/use-cases/proyecto/crear-entregable-proyecto.use-case';
import { ActualizarEntregableProyectoUseCase } from '../../application/use-cases/proyecto/actualizar-entregable-proyecto.use-case';
import { EliminarEntregableProyectoUseCase } from '../../application/use-cases/proyecto/eliminar-entregable-proyecto.use-case';
import { CreateEntregableProyectoDto } from '../dtos/proyecto/create-entregable-proyecto.dto';
import { UpdateEntregableProyectoDto } from '../dtos/proyecto/update-entregable-proyecto.dto';
import {
  EntregableItemDto,
  EntregableMutationResultDto,
  ListarEntregablesDataDto,
  EntregableSelectOptionDto,
} from '../dtos/proyecto/entregable-response.dto';
import {
  ID_ESTADO_ENTREGABLE_CULMINADO,
  ID_ESTADO_ENTREGABLE_PROCESO,
  ID_ESTADO_ENTREGABLE_RETRASO,
  ID_LISTA_ESTADO_ENTREGABLE,
} from '../../domain/constants/estado-entregable.constants';

@ApiTags('entregables')
@ApiBearerAuth('access-token')
@Controller('entregables')
@UseGuards(JwtAuthGuard)
export class EntregableController {
  constructor(
    private readonly listarEntregablesProyectoUseCase: ListarEntregablesProyectoUseCase,
    private readonly listarEntregablesSelectProyectoUseCase: ListarEntregablesSelectProyectoUseCase,
    private readonly obtenerEntregableProyectoUseCase: ObtenerEntregableProyectoUseCase,
    private readonly crearEntregableProyectoUseCase: CrearEntregableProyectoUseCase,
    private readonly actualizarEntregableProyectoUseCase: ActualizarEntregableProyectoUseCase,
    private readonly eliminarEntregableProyectoUseCase: EliminarEntregableProyectoUseCase,
    private readonly jwtService: JwtService,
    private readonly authorization: AuthorizationService,
  ) {}

  @ApiOperation({
    summary: 'Listar entregables',
    description:
      'Listado paginado de entregables. Filtros opcionales por proyecto, estado, rango de fecha estimada y búsqueda.',
  })
  @ApiQuery({
    name: 'idProyecto',
    required: false,
    type: Number,
    description: 'Filtrar por proyecto. Omitir para listar todos.',
  })
  @ApiQuery({
    name: 'busqueda',
    required: false,
    type: String,
    description: 'Texto en nombre, descripción o nombre del proyecto',
  })
  @ApiQuery({
    name: 'idEstado',
    required: false,
    type: Number,
    description: `Estado del entregable (lista ${ID_LISTA_ESTADO_ENTREGABLE}: ${ID_ESTADO_ENTREGABLE_PROCESO}, ${ID_ESTADO_ENTREGABLE_CULMINADO}, ${ID_ESTADO_ENTREGABLE_RETRASO})`,
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    type: String,
    description: 'Inicio del rango (YYYY-MM-DD) sobre fecha estimada',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    type: String,
    description: 'Fin del rango (YYYY-MM-DD) sobre fecha estimada',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Registros por página (default 10)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    example: 0,
    description: 'Desplazamiento para paginación (default 0)',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado',
    type: ListarEntregablesDataDto,
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('control_operativo.entregables.ver')
  async listarEntregables(
    @GrantedScope('control_operativo.entregables.ver')
    alcance: AuthorizationScope,
    @Req() request: Request,
    @Query('idProyecto', new ParseIntPipe({ optional: true }))
    idProyecto?: number,
    @Query('busqueda') busqueda?: string,
    @Query('idEstado', new ParseIntPipe({ optional: true })) idEstado?: number,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @Query('soloVigentes') soloVigentes?: string,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    const data = await this.listarEntregablesProyectoUseCase.execute(
      {
        idProyecto,
        busqueda: busqueda ?? '',
        idEstado,
        fechaInicio: (fechaInicio ?? '').trim() || null,
        fechaFin: (fechaFin ?? '').trim() || null,
        limit,
        offset,
        soloVigentes:
          soloVigentes === '0' || soloVigentes === 'false' ? false : true,
      },
      payload.sub,
      alcance === 'todos',
      {
        editar: await this.authorization.scopesFor(
          payload.sub,
          'control_operativo.entregables.editar',
        ),
        eliminar: await this.authorization.scopesFor(
          payload.sub,
          'control_operativo.entregables.eliminar',
        ),
      },
    );
    return ApiResponseDto.success(data, 'Entregables obtenidos exitosamente');
  }

  @ApiOperation({
    summary: 'Opciones de entregables por proyecto (select)',
    description:
      'Devuelve { value, label } para CustomSelectSearch según el proyecto seleccionado.',
  })
  @ApiQuery({
    name: 'idProyecto',
    required: true,
    type: Number,
    description: 'ID del proyecto',
  })
  @ApiResponse({ status: 200, type: [EntregableSelectOptionDto] })
  @Get('opciones-select')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission(
    'control_operativo.entregables.ver',
    'control_operativo.actividades.crear',
    'control_operativo.actividades.editar',
  )
  async listarEntregablesSelect(
    @Req() request: Request,
    @Query('idProyecto', ParseIntPipe) idProyecto: number,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    const scopes = (
      request as Request & {
        granularScopes?: Record<string, string[]>;
      }
    ).granularScopes;

    const data = await this.listarEntregablesSelectProyectoUseCase.execute(
      idProyecto,
      payload.sub,
      scopes?.['control_operativo.entregables.ver']?.includes('todos') === true,
    );
    return ApiResponseDto.success(
      data,
      'Opciones de entregables obtenidas exitosamente',
    );
  }

  @ApiOperation({ summary: 'Obtener entregable por id' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del entregable' })
  @ApiResponse({ status: 200, type: EntregableItemDto })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('control_operativo.entregables.ver')
  async obtenerEntregable(
    @Param('id', ParseIntPipe) id: number,
    @GrantedScope('control_operativo.entregables.ver')
    alcance: AuthorizationScope,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    const data = await this.obtenerEntregableProyectoUseCase.execute(
      id,
      payload.sub,
      alcance === 'todos',
    );
    return ApiResponseDto.success(data, 'Entregable obtenido exitosamente');
  }

  @ApiOperation({
    summary: 'Crear entregable',
    description: `Registra un entregable en un proyecto. idEstado por defecto ${ID_ESTADO_ENTREGABLE_PROCESO} (PROCESO).`,
  })
  @ApiBody({
    type: CreateEntregableProyectoDto,
    examples: {
      default: {
        summary: 'Payload crear entregable',
        value: {
          idProyecto: 1,
          nombre: 'Entrega fase 1',
          descripcion: 'Planos y memorias',
          idEstado: ID_ESTADO_ENTREGABLE_PROCESO,
          fechaEstimada: '2026-06-15T00:00:00.000Z',
          fechaEntrega: null,
          idTrabajadoresResponsables: [42],
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: EntregableMutationResultDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireScopedPermission('control_operativo.entregables.crear')
  async crearEntregable(
    @Body() dto: CreateEntregableProyectoDto,
    @Req() request: Request,
    @GrantedScope('control_operativo.entregables.crear')
    alcance: AuthorizationScope,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    const data = await this.crearEntregableProyectoUseCase.execute(
      dto,
      payload.sub,
      alcance === 'todos',
    );
    return ApiResponseDto.created(data, 'Entregable creado exitosamente');
  }

  @ApiOperation({ summary: 'Actualizar entregable' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    type: UpdateEntregableProyectoDto,
    examples: {
      default: {
        summary: 'Payload actualizar entregable',
        value: {
          nombre: 'Entrega fase 1 (rev.)',
          descripcion: 'Descripción actualizada',
          idEstado: ID_ESTADO_ENTREGABLE_PROCESO,
          fechaEstimada: '2026-06-15T00:00:00.000Z',
          fechaEntrega: '2026-06-20T00:00:00.000Z',
          idTrabajadoresResponsables: [42],
        },
      },
    },
  })
  @ApiResponse({ status: 200, type: EntregableMutationResultDto })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('control_operativo.entregables.editar')
  async actualizarEntregable(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEntregableProyectoDto,
    @Req() request: Request,
    @GrantedScope('control_operativo.entregables.editar')
    alcance: AuthorizationScope,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    const data = await this.actualizarEntregableProyectoUseCase.execute(
      id,
      dto,
      payload.sub,
      alcance === 'todos',
    );
    return ApiResponseDto.success(data, 'Entregable actualizado exitosamente');
  }

  @ApiOperation({ summary: 'Eliminar entregable (baja lógica)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: EntregableMutationResultDto })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('control_operativo.entregables.eliminar')
  async eliminarEntregable(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
    @GrantedScope('control_operativo.entregables.eliminar')
    alcance: AuthorizationScope,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    const data = await this.eliminarEntregableProyectoUseCase.execute(
      id,
      payload.sub,
      alcance === 'todos',
    );
    return ApiResponseDto.success(data, 'Entregable eliminado exitosamente');
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
