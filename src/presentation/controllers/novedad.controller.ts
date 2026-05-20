import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  UnauthorizedException,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { ListarNovedadLanzamientosUseCase } from '../../application/use-cases/novedad/listar-novedad-lanzamientos.use-case';
import { ObtenerNovedadLanzamientoUseCase } from '../../application/use-cases/novedad/obtener-novedad-lanzamiento.use-case';
import { CrearNovedadLanzamientoUseCase } from '../../application/use-cases/novedad/crear-novedad-lanzamiento.use-case';
import { EditarNovedadLanzamientoUseCase } from '../../application/use-cases/novedad/editar-novedad-lanzamiento.use-case';
import { EliminarNovedadLanzamientoUseCase } from '../../application/use-cases/novedad/eliminar-novedad-lanzamiento.use-case';
import { SincronizarRolesNovedadUseCase } from '../../application/use-cases/novedad/sincronizar-roles-novedad.use-case';
import { CrearNovedadTarjetaUseCase } from '../../application/use-cases/novedad/crear-novedad-tarjeta.use-case';
import { EditarNovedadTarjetaUseCase } from '../../application/use-cases/novedad/editar-novedad-tarjeta.use-case';
import { EliminarNovedadTarjetaUseCase } from '../../application/use-cases/novedad/eliminar-novedad-tarjeta.use-case';
import { ObtenerNovedadPendientesUsuarioUseCase } from '../../application/use-cases/novedad/obtener-novedad-pendientes-usuario.use-case';
import { MarcarNovedadVistaUseCase } from '../../application/use-cases/novedad/marcar-novedad-vista.use-case';
import { ListarNovedadLanzamientosQueryDto } from '../../application/dtos/novedad/listar-novedad-lanzamientos-query.dto';
import { CreateNovedadLanzamientoDto } from '../../application/dtos/novedad/create-novedad-lanzamiento.dto';
import { UpdateNovedadLanzamientoDto } from '../../application/dtos/novedad/update-novedad-lanzamiento.dto';
import { SincronizarRolesNovedadDto } from '../../application/dtos/novedad/sincronizar-roles-novedad.dto';
import { CreateNovedadTarjetaDto } from '../../application/dtos/novedad/create-novedad-tarjeta.dto';
import { UpdateNovedadTarjetaDto } from '../../application/dtos/novedad/update-novedad-tarjeta.dto';
import { MarcarNovedadVistaDto } from '../../application/dtos/novedad/marcar-novedad-vista.dto';

@ApiTags('novedades')
@ApiBearerAuth('access-token')
@Controller('novedades')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class NovedadController {
  constructor(
    private readonly listarLanzamientosUseCase: ListarNovedadLanzamientosUseCase,
    private readonly obtenerLanzamientoUseCase: ObtenerNovedadLanzamientoUseCase,
    private readonly crearLanzamientoUseCase: CrearNovedadLanzamientoUseCase,
    private readonly editarLanzamientoUseCase: EditarNovedadLanzamientoUseCase,
    private readonly eliminarLanzamientoUseCase: EliminarNovedadLanzamientoUseCase,
    private readonly sincronizarRolesUseCase: SincronizarRolesNovedadUseCase,
    private readonly crearTarjetaUseCase: CrearNovedadTarjetaUseCase,
    private readonly editarTarjetaUseCase: EditarNovedadTarjetaUseCase,
    private readonly eliminarTarjetaUseCase: EliminarNovedadTarjetaUseCase,
    private readonly obtenerPendientesUseCase: ObtenerNovedadPendientesUsuarioUseCase,
    private readonly marcarVistaUseCase: MarcarNovedadVistaUseCase,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({
    summary: 'Novedades pendientes del usuario autenticado',
    description: 'Para el modal «¿Qué hay de nuevo?» tras el login.',
  })
  @Get('mi/pendientes')
  @HttpCode(HttpStatus.OK)
  async obtenerPendientes(@Req() request: Request) {
    const userId = await this.getUserIdFromRequest(request);
    const data = await this.obtenerPendientesUseCase.execute(userId);
    return ApiResponseDto.success(data, 'Novedades pendientes obtenidas');
  }

  @ApiOperation({ summary: 'Marcar lanzamiento como visto' })
  @Post('mi/marcar-vista')
  @HttpCode(HttpStatus.OK)
  async marcarVista(
    @Body() dto: MarcarNovedadVistaDto,
    @Req() request: Request,
  ) {
    const userId = await this.getUserIdFromRequest(request);
    const data = await this.marcarVistaUseCase.execute(
      userId,
      dto.idNovedadLanzamiento,
      userId,
    );
    return ApiResponseDto.success(data, data.message);
  }

  @ApiOperation({ summary: 'Listar lanzamientos de novedades (admin)' })
  @Get('lanzamientos')
  @HttpCode(HttpStatus.OK)
  async listarLanzamientos(@Query() query: ListarNovedadLanzamientosQueryDto) {
    const data = await this.listarLanzamientosUseCase.execute({
      busqueda: query.busqueda,
      soloActivos: query.soloActivos,
      limit: query.limit,
      offset: query.offset,
    });
    return ApiResponseDto.success(data, 'Lanzamientos obtenidos exitosamente');
  }

  @ApiOperation({ summary: 'Detalle de lanzamiento con tarjetas y roles' })
  @Get('lanzamientos/:id')
  @HttpCode(HttpStatus.OK)
  async obtenerLanzamiento(@Param('id', ParseIntPipe) id: number) {
    const data = await this.obtenerLanzamientoUseCase.execute(id);
    return ApiResponseDto.success(data, 'Lanzamiento obtenido exitosamente');
  }

  @ApiOperation({ summary: 'Crear lanzamiento de novedades' })
  @Post('lanzamientos')
  @HttpCode(HttpStatus.CREATED)
  async crearLanzamiento(
    @Body() dto: CreateNovedadLanzamientoDto,
    @Req() request: Request,
  ) {
    const userId = await this.getUserIdFromRequest(request);
    const data = await this.crearLanzamientoUseCase.execute(dto, userId);
    return ApiResponseDto.created(data, data.message);
  }

  @ApiOperation({ summary: 'Actualizar lanzamiento de novedades' })
  @Put('lanzamientos/:id')
  @HttpCode(HttpStatus.OK)
  async editarLanzamiento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNovedadLanzamientoDto,
    @Req() request: Request,
  ) {
    const userId = await this.getUserIdFromRequest(request);
    const data = await this.editarLanzamientoUseCase.execute(id, dto, userId);
    return ApiResponseDto.success(data, data.message);
  }

  @ApiOperation({ summary: 'Eliminar lanzamiento (soft delete)' })
  @Delete('lanzamientos/:id')
  @HttpCode(HttpStatus.OK)
  async eliminarLanzamiento(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    const userId = await this.getUserIdFromRequest(request);
    const data = await this.eliminarLanzamientoUseCase.execute(id, userId);
    return ApiResponseDto.success(data, data.message);
  }

  @ApiOperation({
    summary: 'Sincronizar roles de un lanzamiento',
    description: 'Array vacío = visible para todos los roles.',
  })
  @Put('lanzamientos/:id/roles')
  @HttpCode(HttpStatus.OK)
  async sincronizarRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SincronizarRolesNovedadDto,
    @Req() request: Request,
  ) {
    const userId = await this.getUserIdFromRequest(request);
    const data = await this.sincronizarRolesUseCase.execute(id, dto, userId);
    return ApiResponseDto.success(data, data.message);
  }

  @ApiOperation({
    summary: 'Crear tarjeta del carrusel',
    description:
      'Multipart: campo `file` (imagen o video en storage). Para video externo sin archivo, envíe `urlMultimedia`. Las imágenes deben subirse como archivo.',
  })
  @Post('lanzamientos/:id/tarjetas')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      required: ['titulo'],
      properties: {
        file: { type: 'string', format: 'binary' },
        titulo: { type: 'string' },
        descripcion: { type: 'string' },
        orden: { type: 'integer' },
        tipoMultimedia: { type: 'string', enum: ['imagen', 'video'] },
        urlMultimedia: {
          type: 'string',
          description: 'Solo video embebido sin archivo',
        },
      },
    },
  })
  async crearTarjeta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateNovedadTarjetaDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: Request,
  ) {
    const userId = await this.getUserIdFromRequest(request);
    const data = await this.crearTarjetaUseCase.execute(id, dto, userId, file);
    return ApiResponseDto.created(data, data.message);
  }

  @ApiOperation({
    summary: 'Actualizar tarjeta del carrusel',
    description:
      'Multipart opcional: `file` reemplaza el multimedia (se registra en genArchivo y MinIO).',
  })
  @Put('tarjetas/:id')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async editarTarjeta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNovedadTarjetaDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: Request,
  ) {
    const userId = await this.getUserIdFromRequest(request);
    const data = await this.editarTarjetaUseCase.execute(id, dto, userId, file);
    return ApiResponseDto.success(data, data?.message ?? 'Tarjeta actualizada');
  }

  @ApiOperation({ summary: 'Eliminar tarjeta (soft delete)' })
  @Delete('tarjetas/:id')
  @HttpCode(HttpStatus.OK)
  async eliminarTarjeta(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    const userId = await this.getUserIdFromRequest(request);
    const data = await this.eliminarTarjetaUseCase.execute(id, userId);
    return ApiResponseDto.success(data, data.message);
  }

  private async getUserIdFromRequest(request: Request): Promise<number> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    const payload = await this.jwtService.verifyAsync<{ sub: number }>(token);
    return payload.sub;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
