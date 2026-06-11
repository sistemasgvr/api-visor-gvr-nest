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
import {
  esAdminSistemas,
  extraerIdsRoles,
} from '../../shared/utils/admin-sistemas.util';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { ListarEntregablesProyectoUseCase } from '../../application/use-cases/proyecto/listar-entregables-proyecto.use-case';
import { ListarEntregablesSelectProyectoUseCase } from '../../application/use-cases/proyecto/listar-entregables-select-proyecto.use-case';
import { ObtenerEntregableProyectoUseCase } from '../../application/use-cases/proyecto/obtener-entregable-proyecto.use-case';
import { CrearEntregableProyectoUseCase } from '../../application/use-cases/proyecto/crear-entregable-proyecto.use-case';
import { ActualizarEntregableProyectoUseCase } from '../../application/use-cases/proyecto/actualizar-entregable-proyecto.use-case';
import { EliminarEntregableProyectoUseCase } from '../../application/use-cases/proyecto/eliminar-entregable-proyecto.use-case';
import { CreateEntregableProyectoDto } from '../../application/dtos/proyecto/create-entregable-proyecto.dto';
import { UpdateEntregableProyectoDto } from '../../application/dtos/proyecto/update-entregable-proyecto.dto';
import {
  EntregableItemDto,
  EntregableMutationResultDto,
  ListarEntregablesDataDto,
  EntregableSelectOptionDto,
} from '../../application/dtos/proyecto/entregable-response.dto';

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
  ) {}

  @ApiOperation({
    summary: 'Listar entregables',
    description:
      'Listado paginado de entregables. Filtros opcionales por proyecto, estado y búsqueda (nombre, descripción o nombre de proyecto).',
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
    description: 'Estado del entregable (lista 46: 561, 562, 563)',
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
  @ApiResponse({ status: 200, description: 'Listado paginado', type: ListarEntregablesDataDto })
  @Get()
  @HttpCode(HttpStatus.OK)
  async listarEntregables(
    @Req() request: Request,
    @Query('idProyecto', new ParseIntPipe({ optional: true })) idProyecto?: number,
    @Query('busqueda') busqueda?: string,
    @Query('idEstado', new ParseIntPipe({ optional: true })) idEstado?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @Query('soloVigentes') soloVigentes?: string,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = (await this.jwtService.verifyAsync(token)) as JwtPayload;
    const rolesIds = extraerIdsRoles(payload.roles);

    const data = await this.listarEntregablesProyectoUseCase.execute(
      {
        idProyecto,
        busqueda: busqueda ?? '',
        idEstado,
        limit,
        offset,
        soloVigentes:
          soloVigentes === '0' || soloVigentes === 'false' ? false : true,
      },
      payload.sub,
      esAdminSistemas(rolesIds),
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
  async listarEntregablesSelect(
    @Req() request: Request,
    @Query('idProyecto', ParseIntPipe) idProyecto: number,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = (await this.jwtService.verifyAsync(token)) as JwtPayload;
    const rolesIds = extraerIdsRoles(payload.roles);

    const data = await this.listarEntregablesSelectProyectoUseCase.execute(
      idProyecto,
      payload.sub,
      esAdminSistemas(rolesIds),
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
  async obtenerEntregable(@Param('id', ParseIntPipe) id: number) {
    const data = await this.obtenerEntregableProyectoUseCase.execute(id);
    return ApiResponseDto.success(data, 'Entregable obtenido exitosamente');
  }

  @ApiOperation({
    summary: 'Crear entregable',
    description: 'Registra un entregable en un proyecto. idEstado por defecto 561 (PROCESO).',
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
          idEstado: 561,
          fechaEstimada: '2026-06-15T00:00:00.000Z',
          fechaEntrega: null,
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: EntregableMutationResultDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearEntregable(
    @Body() dto: CreateEntregableProyectoDto,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync(token);
    const data = await this.crearEntregableProyectoUseCase.execute(
      dto,
      payload.sub,
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
          idEstado: 562,
          fechaEstimada: '2026-06-15T00:00:00.000Z',
          fechaEntrega: '2026-06-20T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 200, type: EntregableMutationResultDto })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async actualizarEntregable(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEntregableProyectoDto,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync(token);
    const data = await this.actualizarEntregableProyectoUseCase.execute(
      id,
      dto,
      payload.sub,
    );
    return ApiResponseDto.success(data, 'Entregable actualizado exitosamente');
  }

  @ApiOperation({ summary: 'Eliminar entregable (baja lógica)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: EntregableMutationResultDto })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async eliminarEntregable(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const payload = await this.jwtService.verifyAsync(token);
    const data = await this.eliminarEntregableProyectoUseCase.execute(
      id,
      payload.sub,
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
