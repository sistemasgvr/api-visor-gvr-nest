import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import {
  ListarAuditoriasUseCase,
  ObtenerAuditoriaPorIdUseCase,
  ObtenerHistorialEntidadUseCase,
  ObtenerHistorialUsuarioUseCase,
  ObtenerEstadisticasUseCase,
} from '../../application/use-cases/auditoria';
import {
  ListarAuditoriasDto,
  ObtenerHistorialUsuarioDto,
  ObtenerEstadisticasDto,
} from '../dtos/auditoria';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireGranularPermission } from '../../infrastructure/auth/granular-permission.guard';

@ApiTags('auditoria')
@ApiBearerAuth('access-token')
@Controller('auditoria')
@UseGuards(JwtAuthGuard)
export class AuditoriaController {
  constructor(
    private readonly listarAuditoriasUseCase: ListarAuditoriasUseCase,
    private readonly obtenerAuditoriaPorIdUseCase: ObtenerAuditoriaPorIdUseCase,
    private readonly obtenerHistorialEntidadUseCase: ObtenerHistorialEntidadUseCase,
    private readonly obtenerHistorialUsuarioUseCase: ObtenerHistorialUsuarioUseCase,
    private readonly obtenerEstadisticasUseCase: ObtenerEstadisticasUseCase,
  ) {}

  /**
   * GET - Estadísticas de auditoría
   * GET /auditoria/estadisticas
   * IMPORTANTE: Esta ruta debe ir antes de las rutas con parámetros dinámicos
   */
  @ApiOperation({
    summary: 'Estadísticas agregadas de auditoría',
    description:
      'Resúmenes por tipo de evento, usuario o período (según query).',
  })
  @Get('estadisticas')
  @HttpCode(HttpStatus.OK)
  @RequireGranularPermission('seguridad.auditoria.ver_estadisticas')
  async obtenerEstadisticas(@Query() dto: ObtenerEstadisticasDto) {
    const resultado = await this.obtenerEstadisticasUseCase.execute(dto);
    return ApiResponseDto.success(
      resultado,
      'Estadísticas obtenidas exitosamente',
    );
  }

  /**
   * GET - Historial de una entidad específica
   * GET /auditoria/entidad/:entidad/:id
   * IMPORTANTE: Esta ruta debe ir antes de las rutas con parámetros dinámicos
   */
  @ApiOperation({
    summary: 'Historial de cambios de una entidad',
    description:
      'Parámetro entidad: nombre de tabla/tipo lógico; id: clave primaria.',
  })
  @Get('entidad/:entidad/:id')
  @HttpCode(HttpStatus.OK)
  @RequireGranularPermission('seguridad.auditoria.ver_historial_entidad')
  async obtenerHistorialEntidad(
    @Param('entidad') entidad: string,
    @Param('id') id: string,
  ) {
    if (!entidad || !id) {
      throw new BadRequestException('Entidad e ID son requeridos');
    }

    const resultado = await this.obtenerHistorialEntidadUseCase.execute(
      entidad,
      id,
    );
    return ApiResponseDto.success(resultado, 'Historial obtenido exitosamente');
  }

  /**
   * GET - Historial de acciones de un usuario
   * GET /auditoria/usuario/:id
   * IMPORTANTE: Esta ruta debe ir antes de las rutas con parámetros dinámicos
   */
  @ApiOperation({
    summary: 'Historial de acciones de un usuario del sistema',
    description: 'Paginado; filtros en query según ObtenerHistorialUsuarioDto.',
  })
  @Get('usuario/:id')
  @HttpCode(HttpStatus.OK)
  @RequireGranularPermission('seguridad.auditoria.ver_historial_usuario')
  async obtenerHistorialUsuario(
    @Param('id') id: string,
    @Query() dto: ObtenerHistorialUsuarioDto,
  ) {
    const idNumero = parseInt(id, 10);
    if (isNaN(idNumero)) {
      throw new BadRequestException('El ID debe ser un número válido');
    }

    const resultado = await this.obtenerHistorialUsuarioUseCase.execute(
      idNumero,
      dto,
    );
    return ApiResponseDto.paginated(
      resultado.data,
      resultado.pagination,
      'Historial de usuario obtenido exitosamente',
    );
  }

  /**
   * GET - Listar auditorías con filtros
   * GET /auditoria
   */
  @ApiOperation({
    summary: 'Listado paginado de registros de auditoría',
    description: 'Filtros por fecha, usuario, entidad, acción, etc.',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  @RequireGranularPermission('seguridad.auditoria.ver')
  async listarAuditorias(@Query() dto: ListarAuditoriasDto) {
    const resultado = await this.listarAuditoriasUseCase.execute(dto);
    return ApiResponseDto.paginated(
      resultado.data,
      resultado.pagination,
      'Auditorías obtenidas exitosamente',
    );
  }

  /**
   * GET - Obtener auditoría por ID
   * GET /auditoria/:id
   */
  @ApiOperation({ summary: 'Detalle de un registro de auditoría por id' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequireGranularPermission('seguridad.auditoria.ver')
  async obtenerAuditoriaPorId(@Param('id') id: string) {
    const idNumero = parseInt(id, 10);
    if (isNaN(idNumero)) {
      throw new BadRequestException('El ID debe ser un número válido');
    }

    const resultado = await this.obtenerAuditoriaPorIdUseCase.execute(idNumero);
    return ApiResponseDto.success(resultado, 'Auditoría obtenida exitosamente');
  }
}
