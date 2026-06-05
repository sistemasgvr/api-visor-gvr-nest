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
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import {
  ActualizarVisorElementoFotoDto,
  AgregarArchivosVisorElementoFotoDto,
  CrearVisorElementoFotoDto,
} from '../../application/dtos/acc/visor-elemento-foto/visor-elemento-foto.dto';
import { CrearVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/crear-visor-elemento-foto.use-case';
import { ActualizarVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/actualizar-visor-elemento-foto.use-case';
import { AgregarArchivosVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/agregar-archivos-visor-elemento-foto.use-case';
import { ListarVisorElementoFotosPorDocumentoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/listar-visor-elemento-fotos-por-documento.use-case';
import { ObtenerVisorElementoFotoPorElementoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/obtener-visor-elemento-foto-por-elemento.use-case';
import { ObtenerVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/obtener-visor-elemento-foto.use-case';
import { EliminarArchivoVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/eliminar-archivo-visor-elemento-foto.use-case';
import { EliminarVisorElementoFotoUseCase } from '../../application/use-cases/acc/visor-elemento-foto/eliminar-visor-elemento-foto.use-case';

@ApiTags('acc')
@ApiBearerAuth('access-token')
@Controller('acc/projects/:projectId/visor-elemento-fotos')
@UseGuards(JwtAuthGuard)
export class AccVisorElementoFotoController {
  constructor(
    private readonly crearUseCase: CrearVisorElementoFotoUseCase,
    private readonly actualizarUseCase: ActualizarVisorElementoFotoUseCase,
    private readonly agregarArchivosUseCase: AgregarArchivosVisorElementoFotoUseCase,
    private readonly listarUseCase: ListarVisorElementoFotosPorDocumentoUseCase,
    private readonly obtenerPorElementoUseCase: ObtenerVisorElementoFotoPorElementoUseCase,
    private readonly obtenerUseCase: ObtenerVisorElementoFotoUseCase,
    private readonly eliminarArchivoUseCase: EliminarArchivoVisorElementoFotoUseCase,
    private readonly eliminarUseCase: EliminarVisorElementoFotoUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear anclaje de fotos de avance de obra en un elemento' })
  async crear(
    @Param('projectId') projectId: string,
    @Body() dto: CrearVisorElementoFotoDto,
    @Req() req: Request,
  ) {
    const data = await this.crearUseCase.execute(
      projectId,
      dto,
      req.user!.id,
    );
    return ApiResponseDto.success(
      data,
      'Fotos de avance registradas exitosamente',
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar anclajes de fotos por documento (pushpins del visor)' })
  @ApiQuery({ name: 'documentUrn', required: true })
  @ApiQuery({ name: 'viewableGuid', required: false })
  async listar(
    @Param('projectId') projectId: string,
    @Query('documentUrn') documentUrn: string,
    @Query('viewableGuid') viewableGuid?: string,
  ) {
    const data = await this.listarUseCase.execute(
      projectId,
      documentUrn,
      viewableGuid,
    );
    return ApiResponseDto.success(data, 'Anclajes obtenidos exitosamente');
  }

  @Get('por-elemento')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener anclaje único por elemento en documento/vista' })
  @ApiQuery({ name: 'documentUrn', required: true })
  @ApiQuery({ name: 'objectId', required: true, type: Number })
  @ApiQuery({ name: 'viewableGuid', required: false })
  async obtenerPorElemento(
    @Param('projectId') projectId: string,
    @Query('documentUrn') documentUrn: string,
    @Query('objectId', ParseIntPipe) objectId: number,
    @Query('viewableGuid') viewableGuid?: string,
  ) {
    const data = await this.obtenerPorElementoUseCase.execute(
      projectId,
      documentUrn,
      viewableGuid,
      objectId,
    );
    return ApiResponseDto.success(
      data,
      data ? 'Anclaje obtenido exitosamente' : 'Sin fotos para este elemento',
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener detalle de anclaje con galería' })
  @ApiParam({ name: 'id', type: Number })
  async obtener(@Param('id', ParseIntPipe) id: number) {
    const data = await this.obtenerUseCase.execute(id);
    return ApiResponseDto.success(data, 'Anclaje obtenido exitosamente');
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar metadatos del anclaje' })
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarVisorElementoFotoDto,
    @Req() req: Request,
  ) {
    const data = await this.actualizarUseCase.execute(id, dto, req.user!.id);
    return ApiResponseDto.success(data, 'Anclaje actualizado exitosamente');
  }

  @Post(':id/archivos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Agregar imágenes a anclaje existente (máx. 10 total)' })
  async agregarArchivos(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AgregarArchivosVisorElementoFotoDto,
    @Req() req: Request,
  ) {
    const data = await this.agregarArchivosUseCase.execute(
      id,
      dto,
      req.user!.id,
    );
    return ApiResponseDto.success(data, 'Imágenes agregadas exitosamente');
  }

  @Delete(':id/archivos/:idArchivoJunction')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una imagen del anclaje' })
  async eliminarArchivo(
    @Param('id', ParseIntPipe) id: number,
    @Param('idArchivoJunction', ParseIntPipe) idArchivoJunction: number,
    @Req() req: Request,
  ) {
    await this.eliminarArchivoUseCase.execute(
      id,
      idArchivoJunction,
      req.user!.id,
    );
    return ApiResponseDto.success(null, 'Imagen eliminada exitosamente');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar anclaje completo y sus imágenes' })
  async eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    await this.eliminarUseCase.execute(id, req.user!.id);
    return ApiResponseDto.success(null, 'Anclaje eliminado exitosamente');
  }
}
