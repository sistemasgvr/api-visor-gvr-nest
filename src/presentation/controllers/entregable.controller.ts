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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { ListarEntregablesProyectoUseCase } from '../../application/use-cases/proyecto/listar-entregables-proyecto.use-case';
import { ObtenerEntregableProyectoUseCase } from '../../application/use-cases/proyecto/obtener-entregable-proyecto.use-case';
import { CrearEntregableProyectoUseCase } from '../../application/use-cases/proyecto/crear-entregable-proyecto.use-case';
import { ActualizarEntregableProyectoUseCase } from '../../application/use-cases/proyecto/actualizar-entregable-proyecto.use-case';
import { EliminarEntregableProyectoUseCase } from '../../application/use-cases/proyecto/eliminar-entregable-proyecto.use-case';
import { CreateEntregableProyectoDto } from '../../application/dtos/proyecto/create-entregable-proyecto.dto';
import { UpdateEntregableProyectoDto } from '../../application/dtos/proyecto/update-entregable-proyecto.dto';

@ApiTags('entregables')
@ApiBearerAuth('access-token')
@Controller('entregables')
@UseGuards(JwtAuthGuard)
export class EntregableController {
  constructor(
    private readonly listarEntregablesProyectoUseCase: ListarEntregablesProyectoUseCase,
    private readonly obtenerEntregableProyectoUseCase: ObtenerEntregableProyectoUseCase,
    private readonly crearEntregableProyectoUseCase: CrearEntregableProyectoUseCase,
    private readonly actualizarEntregableProyectoUseCase: ActualizarEntregableProyectoUseCase,
    private readonly eliminarEntregableProyectoUseCase: EliminarEntregableProyectoUseCase,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({
    summary: 'Listar entregables',
    description:
      'Listado global de entregables con filtros opcionales por proyecto, estado y búsqueda.',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async listarEntregables(
    @Query('idProyecto', new ParseIntPipe({ optional: true })) idProyecto?: number,
    @Query('busqueda') busqueda?: string,
    @Query('idEstado', new ParseIntPipe({ optional: true })) idEstado?: number,
  ) {
    const data = await this.listarEntregablesProyectoUseCase.execute({
      idProyecto,
      busqueda: busqueda ?? '',
      idEstado,
    });
    return ApiResponseDto.success(data, 'Entregables obtenidos exitosamente');
  }

  @ApiOperation({ summary: 'Obtener entregable por id' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async obtenerEntregable(@Param('id', ParseIntPipe) id: number) {
    const data = await this.obtenerEntregableProyectoUseCase.execute(id);
    return ApiResponseDto.success(data, 'Entregable obtenido exitosamente');
  }

  @ApiOperation({ summary: 'Crear entregable' })
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

  @ApiOperation({ summary: 'Eliminar entregable' })
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
