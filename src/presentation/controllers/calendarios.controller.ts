import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ListarCalendariosUseCase } from '../../application/use-cases/planificacion/calendarios/listar-calendarios.use-case';
import { ObtenerCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/obtener-calendario.use-case';
import { CrearCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/crear-calendario.use-case';
import { ActualizarCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/actualizar-calendario.use-case';
import { DuplicarCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/duplicar-calendario.use-case';
import { CrearVersionCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/crear-version-calendario.use-case';
import { GuardarSemanaCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/guardar-semana-calendario.use-case';
import { GuardarExcepcionCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/guardar-excepcion-calendario.use-case';
import { EliminarExcepcionCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/eliminar-excepcion-calendario.use-case';
import { PublicarVersionCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/publicar-version-calendario.use-case';
import { CambiarEstadoCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/cambiar-estado-calendario.use-case';
import { ObtenerDisponibilidadCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/obtener-disponibilidad-calendario.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import { CrearCalendarioDto } from '../dtos/planificacion/calendarios/crear-calendario.dto';
import { ActualizarCalendarioDto } from '../dtos/planificacion/calendarios/actualizar-calendario.dto';
import { CrearVersionCalendarioDto } from '../dtos/planificacion/calendarios/crear-version-calendario.dto';
import { DuplicarCalendarioDto } from '../dtos/planificacion/calendarios/duplicar-calendario.dto';
import { ListarCalendariosDto } from '../dtos/planificacion/calendarios/listar-calendarios.dto';
import { CambiarEstadoCalendarioDto } from '../dtos/planificacion/calendarios/cambiar-estado-calendario.dto';
import {
  CalendarioIdParamsDto,
  ExcepcionCalendarioParamsDto,
  ObtenerCalendarioQueryDto,
} from '../dtos/planificacion/calendarios/calendario-params.dto';
import { GuardarSemanaCalendarioDto } from '../dtos/planificacion/calendarios/guardar-semana-calendario.dto';
import { GuardarExcepcionCalendarioDto } from '../dtos/planificacion/calendarios/guardar-excepcion-calendario.dto';
import { RevisionCalendarioDto } from '../dtos/planificacion/calendarios/revision-calendario.dto';
import { DisponibilidadCalendarioDto } from '../dtos/planificacion/calendarios/disponibilidad-calendario.dto';

@ApiTags('planificacion-calendarios')
@ApiBearerAuth('access-token')
@Controller('planificacion/calendarios')
@UseGuards(JwtAuthGuard)
export class CalendariosController {
  constructor(
    private readonly listarUseCase: ListarCalendariosUseCase,
    private readonly obtenerUseCase: ObtenerCalendarioUseCase,
    private readonly crearUseCase: CrearCalendarioUseCase,
    private readonly actualizarUseCase: ActualizarCalendarioUseCase,
    private readonly duplicarUseCase: DuplicarCalendarioUseCase,
    private readonly crearVersionUseCase: CrearVersionCalendarioUseCase,
    private readonly guardarSemanaUseCase: GuardarSemanaCalendarioUseCase,
    private readonly guardarExcepcionUseCase: GuardarExcepcionCalendarioUseCase,
    private readonly eliminarExcepcionUseCase: EliminarExcepcionCalendarioUseCase,
    private readonly publicarUseCase: PublicarVersionCalendarioUseCase,
    private readonly cambiarEstadoUseCase: CambiarEstadoCalendarioUseCase,
    private readonly disponibilidadUseCase: ObtenerDisponibilidadCalendarioUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar calendarios con búsqueda, estado y paginación',
  })
  async listar(@Req() request: Request, @Query() query: ListarCalendariosDto) {
    return ApiResponseDto.success(
      await this.listarUseCase.execute(this.idUsuario(request), query),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Crear calendario y primer borrador' })
  async crear(@Req() request: Request, @Body() data: CrearCalendarioDto) {
    return ApiResponseDto.created(
      await this.crearUseCase.execute(this.idUsuario(request), data),
      'Calendario creado',
    );
  }

  @Post('duplicar')
  @ApiOperation({ summary: 'Duplicar una versión en otro calendario' })
  async duplicar(@Req() request: Request, @Body() data: DuplicarCalendarioDto) {
    return ApiResponseDto.created(
      await this.duplicarUseCase.execute(
        this.idUsuario(request),
        data.idversionorigen,
        data.nombre,
      ),
      'Calendario duplicado',
    );
  }

  @Post('versiones')
  @ApiOperation({ summary: 'Crear borrador desde una versión publicada' })
  async crearVersion(
    @Req() request: Request,
    @Body() data: CrearVersionCalendarioDto,
  ) {
    return ApiResponseDto.created(
      await this.crearVersionUseCase.execute(
        this.idUsuario(request),
        data.idversionorigen,
      ),
      'Borrador creado',
    );
  }

  @Get('versiones/:id/disponibilidad')
  @ApiOperation({
    summary: 'Previsualizar capacidad de una versión sin registrar jornadas',
  })
  async disponibilidad(
    @Req() request: Request,
    @Param() params: CalendarioIdParamsDto,
    @Query() query: DisponibilidadCalendarioDto,
  ) {
    return ApiResponseDto.success(
      await this.disponibilidadUseCase.execute(
        this.idUsuario(request),
        params.id,
        query.desde,
        query.hasta,
      ),
    );
  }

  @Put('versiones/:id/semana')
  @ApiOperation({
    summary: 'Guardar los siete días y la zona horaria del borrador',
  })
  async guardarSemana(
    @Req() request: Request,
    @Param() params: CalendarioIdParamsDto,
    @Body() data: GuardarSemanaCalendarioDto,
  ) {
    return ApiResponseDto.updated(
      await this.guardarSemanaUseCase.execute(
        this.idUsuario(request),
        params.id,
        data,
      ),
      'Jornada semanal guardada',
    );
  }

  @Post('versiones/:id/excepciones')
  @ApiOperation({ summary: 'Crear feriado o día especial en el borrador' })
  async crearExcepcion(
    @Req() request: Request,
    @Param() params: CalendarioIdParamsDto,
    @Body() data: GuardarExcepcionCalendarioDto,
  ) {
    return ApiResponseDto.created(
      await this.guardarExcepcionUseCase.execute(
        this.idUsuario(request),
        params.id,
        data,
      ),
      'Excepción creada',
    );
  }

  @Put('versiones/:id/excepciones/:idexcepcion')
  @ApiOperation({
    summary: 'Editar, activar o desactivar un feriado o día especial',
  })
  async actualizarExcepcion(
    @Req() request: Request,
    @Param() params: ExcepcionCalendarioParamsDto,
    @Body() data: GuardarExcepcionCalendarioDto,
  ) {
    return ApiResponseDto.updated(
      await this.guardarExcepcionUseCase.execute(
        this.idUsuario(request),
        params.id,
        data,
        params.idexcepcion,
      ),
      'Excepción actualizada',
    );
  }

  @Delete('versiones/:id/excepciones/:idexcepcion')
  @ApiOperation({
    summary: 'Eliminar una excepción del borrador; requiere revision en query',
  })
  async eliminarExcepcion(
    @Req() request: Request,
    @Param() params: ExcepcionCalendarioParamsDto,
    @Query() query: RevisionCalendarioDto,
  ) {
    return ApiResponseDto.deleted(
      await this.eliminarExcepcionUseCase.execute(
        this.idUsuario(request),
        params.id,
        query.revision,
        params.idexcepcion,
      ),
      'Excepción eliminada',
    );
  }

  @Post('versiones/:id/publicar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Conservar una versión publicada sin activar otras funcionalidades',
  })
  async publicar(
    @Req() request: Request,
    @Param() params: CalendarioIdParamsDto,
    @Body() data: RevisionCalendarioDto,
  ) {
    return ApiResponseDto.updated(
      await this.publicarUseCase.execute(
        this.idUsuario(request),
        params.id,
        data.revision,
      ),
      'Versión publicada',
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar calendario e histórico mediante idversion opcional',
  })
  async obtener(
    @Req() request: Request,
    @Param() params: CalendarioIdParamsDto,
    @Query() query: ObtenerCalendarioQueryDto,
  ) {
    return ApiResponseDto.success(
      await this.obtenerUseCase.execute(
        this.idUsuario(request),
        params.id,
        query.idversion,
      ),
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar nombre y descripción; requiere revisión de cabecera',
  })
  async actualizar(
    @Req() request: Request,
    @Param() params: CalendarioIdParamsDto,
    @Body() data: ActualizarCalendarioDto,
  ) {
    return ApiResponseDto.updated(
      await this.actualizarUseCase.execute(
        this.idUsuario(request),
        params.id,
        data,
      ),
      'Calendario actualizado',
    );
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Desactivar o reactivar sin eliminar el histórico' })
  async cambiarEstado(
    @Req() request: Request,
    @Param() params: CalendarioIdParamsDto,
    @Body() data: CambiarEstadoCalendarioDto,
  ) {
    return ApiResponseDto.updated(
      await this.cambiarEstadoUseCase.execute(
        this.idUsuario(request),
        params.id,
        data.revision,
        data.estado,
      ),
      'Estado actualizado',
    );
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
