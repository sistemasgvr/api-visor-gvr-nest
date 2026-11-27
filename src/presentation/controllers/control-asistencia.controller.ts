import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ExportarAsistenciaPdfUseCase } from '../../application/use-cases/control-asistencia/exportar-asistencia-pdf.use-case';
import type { ArchivoReporte } from '../../application/ports/reporte-asistencia-pdf.port';
import { ObtenerEstadoAsistenciaUseCase } from '../../application/use-cases/control-asistencia/obtener-estado-asistencia.use-case';
import { MarcarAsistenciaUseCase } from '../../application/use-cases/control-asistencia/marcar-asistencia.use-case';
import { ListarAsistenciaMesUseCase } from '../../application/use-cases/control-asistencia/listar-asistencia-mes.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import {
  AuthenticatedAccess,
  RequireWorkerPermission,
} from '../../infrastructure/auth/granular-permission.guard';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import { MarcarAsistenciaDto } from '../dtos/control-asistencia/marcar-asistencia.dto';
import {
  AsistenciaMesQueryDto,
  AsistenciaTrabajadorParamsDto,
} from '../dtos/control-asistencia/asistencia-mes.dto';

/**
 * Control de asistencia. Marcar y consultar la propia asistencia no requiere permiso granular:
 * lo decide `tratrabajador.registraasistencia` en SQL. Ver a otra persona exige
 * `control_operativo.asistencia.ver` con su alcance (propios, asignados o todos).
 */
@ApiTags('control-asistencia')
@ApiBearerAuth('access-token')
@Controller('control-operativo/asistencia')
@UseGuards(JwtAuthGuard)
export class ControlAsistenciaController {
  constructor(
    private readonly obtenerEstadoUseCase: ObtenerEstadoAsistenciaUseCase,
    private readonly marcarUseCase: MarcarAsistenciaUseCase,
    private readonly listarMesUseCase: ListarAsistenciaMesUseCase,
    private readonly exportarPdfUseCase: ExportarAsistenciaPdfUseCase,
  ) {}

  @Get('estado')
  @ApiOperation({
    summary: 'Estado de asistencia propio: día que se registra, horario y siguiente marca',
  })
  @AuthenticatedAccess(
    'Asistencia de la propia sesión; SQL comprueba que el colaborador registre asistencia',
  )
  async obtenerEstado(@Req() request: Request) {
    return ApiResponseDto.success(
      await this.obtenerEstadoUseCase.execute(this.idUsuario(request)),
    );
  }

  @Post('marcas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar una marca propia con la hora del servidor',
  })
  @AuthenticatedAccess(
    'Marca de la propia sesión; SQL comprueba que el colaborador registre asistencia',
  )
  async marcar(@Req() request: Request, @Body() data: MarcarAsistenciaDto) {
    return ApiResponseDto.success(
      await this.marcarUseCase.execute(
        this.idUsuario(request),
        data.tipo,
        data.motivo,
      ),
      'Marca registrada',
    );
  }

  @Get('mes')
  @ApiOperation({ summary: 'Asistencia mensual propia con totales' })
  @AuthenticatedAccess('Reporte de asistencia de la propia sesión')
  async listarMesPropio(
    @Req() request: Request,
    @Query() query: AsistenciaMesQueryDto,
  ) {
    return ApiResponseDto.success(
      await this.listarMesUseCase.execute(
        this.idUsuario(request),
        null,
        query.anio,
        query.mes,
      ),
    );
  }

  @Get('trabajadores/:idTrabajador/mes')
  @ApiOperation({ summary: 'Asistencia mensual de un colaborador con totales' })
  @RequireWorkerPermission('control_operativo.asistencia.ver')
  async listarMesTrabajador(
    @Req() request: Request,
    @Param() params: AsistenciaTrabajadorParamsDto,
    @Query() query: AsistenciaMesQueryDto,
  ) {
    return ApiResponseDto.success(
      await this.listarMesUseCase.execute(
        this.idUsuario(request),
        params.idTrabajador,
        query.anio,
        query.mes,
      ),
    );
  }

  @Get('mes/pdf')
  @ApiOperation({
    summary: 'Registro mensual propio en PDF (D.S. 004-2006-TR)',
  })
  @ApiProduces('application/pdf')
  @AuthenticatedAccess('Reporte de asistencia de la propia sesión')
  async exportarPdfPropio(
    @Req() request: Request,
    @Query() query: AsistenciaMesQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.archivoPdf(
      response,
      await this.exportarPdfUseCase.execute(
        this.idUsuario(request),
        null,
        query.anio,
        query.mes,
      ),
    );
  }

  @Get('trabajadores/:idTrabajador/mes/pdf')
  @ApiOperation({
    summary: 'Registro mensual de un colaborador en PDF (D.S. 004-2006-TR)',
  })
  @ApiProduces('application/pdf')
  @RequireWorkerPermission('control_operativo.asistencia.ver')
  async exportarPdfTrabajador(
    @Req() request: Request,
    @Param() params: AsistenciaTrabajadorParamsDto,
    @Query() query: AsistenciaMesQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.archivoPdf(
      response,
      await this.exportarPdfUseCase.execute(
        this.idUsuario(request),
        params.idTrabajador,
        query.anio,
        query.mes,
      ),
    );
  }

  private archivoPdf(response: Response, archivo: ArchivoReporte) {
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${archivo.nombreArchivo}"`,
    );
    response.setHeader('Cache-Control', 'no-store');
    return new StreamableFile(archivo.contenido);
  }

  private idUsuario(request: Request): number {
    const id = request.user?.sub ?? request.user?.id;
    if (
      typeof id !== 'number' ||
      !Number.isInteger(id) ||
      id < 1 ||
      id > 2147483647
    ) {
      throw new UnauthorizedException('Usuario autenticado no válido');
    }
    return id;
  }
}
