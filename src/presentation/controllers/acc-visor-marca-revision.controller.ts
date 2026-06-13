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
  ActualizarVisorMarcaRevisionDto,
  CrearVisorMarcaRevisionDto,
  DuplicarVisorMarcaRevisionDto,
  SincronizarMarkupIdApsDto,
} from '../../application/dtos/acc/visor-marca-revision/visor-marca-revision.dto';
import { CrearVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/crear-visor-marca-revision.use-case';
import { ActualizarVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/actualizar-visor-marca-revision.use-case';
import { DuplicarVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/duplicar-visor-marca-revision.use-case';
import { PublicarVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/publicar-visor-marca-revision.use-case';
import { AnularPublicacionVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/anular-publicacion-visor-marca-revision.use-case';
import { SuprimirVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/suprimir-visor-marca-revision.use-case';
import { ListarVisorMarcasRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/listar-visor-marcas-revision.use-case';
import { ContarVisorMarcasRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/contar-visor-marcas-revision.use-case';
import { ObtenerVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/obtener-visor-marca-revision.use-case';
import { SincronizarMarkupIdApsVisorMarcaRevisionUseCase } from '../../application/use-cases/acc/visor-marca-revision/sincronizar-markup-id-aps-visor-marca-revision.use-case';
import { parseQueryBoolean } from '../../application/use-cases/acc/visor-marca-revision/visor-marca-revision.util';

@ApiTags('acc')
@ApiBearerAuth('access-token')
@Controller('acc/projects/:projectId/visor-marcas-revision')
@UseGuards(JwtAuthGuard)
export class AccVisorMarcaRevisionController {
  constructor(
    private readonly crearUseCase: CrearVisorMarcaRevisionUseCase,
    private readonly actualizarUseCase: ActualizarVisorMarcaRevisionUseCase,
    private readonly duplicarUseCase: DuplicarVisorMarcaRevisionUseCase,
    private readonly publicarUseCase: PublicarVisorMarcaRevisionUseCase,
    private readonly anularPublicacionUseCase: AnularPublicacionVisorMarcaRevisionUseCase,
    private readonly suprimirUseCase: SuprimirVisorMarcaRevisionUseCase,
    private readonly listarUseCase: ListarVisorMarcasRevisionUseCase,
    private readonly contarUseCase: ContarVisorMarcasRevisionUseCase,
    private readonly obtenerUseCase: ObtenerVisorMarcaRevisionUseCase,
    private readonly sincronizarMarkupIdApsUseCase: SincronizarMarkupIdApsVisorMarcaRevisionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear marca de revisión (privada por defecto)' })
  async crear(
    @Param('projectId') projectId: string,
    @Body() dto: CrearVisorMarcaRevisionDto,
    @Req() req: Request,
  ) {
    const data = await this.crearUseCase.execute(projectId, dto, req.user!.id);
    return ApiResponseDto.success(data, 'Marca de revisión creada exitosamente');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar marcas visibles (dock del visor)' })
  @ApiQuery({ name: 'documentUrn', required: true })
  @ApiQuery({ name: 'viewableGuid', required: false })
  @ApiQuery({ name: 'paginaNumero', required: false, type: Number })
  @ApiQuery({ name: 'versionId', required: false })
  @ApiQuery({ name: 'idRevisionArchivo', required: false, type: Number })
  @ApiQuery({ name: 'soloPublicadas', required: false, type: Boolean })
  @ApiQuery({ name: 'soloPropias', required: false, type: Boolean })
  async listar(
    @Param('projectId') projectId: string,
    @Query('documentUrn') documentUrn: string,
    @Req() req: Request,
    @Query('viewableGuid') viewableGuid?: string,
    @Query('paginaNumero') paginaNumero?: string,
    @Query('versionId') versionId?: string,
    @Query('idRevisionArchivo') idRevisionArchivo?: string,
    @Query('soloPublicadas') soloPublicadas?: string,
    @Query('soloPropias') soloPropias?: string,
  ) {
    const data = await this.listarUseCase.execute(projectId, req.user!.id, {
      documentUrn,
      viewableGuid,
      paginaNumero: paginaNumero ? Number(paginaNumero) : undefined,
      versionId,
      idRevisionArchivo: idRevisionArchivo ? Number(idRevisionArchivo) : undefined,
      soloPublicadas: parseQueryBoolean(soloPublicadas),
      soloPropias: parseQueryBoolean(soloPropias),
    });
    return ApiResponseDto.success(data, 'Marcas de revisión obtenidas exitosamente');
  }

  @Get('contador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Contar marcas visibles (badges del dock)' })
  @ApiQuery({ name: 'documentUrn', required: true })
  @ApiQuery({ name: 'viewableGuid', required: false })
  @ApiQuery({ name: 'paginaNumero', required: false, type: Number })
  @ApiQuery({ name: 'versionId', required: false })
  async contar(
    @Param('projectId') projectId: string,
    @Query('documentUrn') documentUrn: string,
    @Req() req: Request,
    @Query('viewableGuid') viewableGuid?: string,
    @Query('paginaNumero') paginaNumero?: string,
    @Query('versionId') versionId?: string,
  ) {
    const data = await this.contarUseCase.execute(projectId, req.user!.id, {
      documentUrn,
      viewableGuid,
      paginaNumero: paginaNumero ? Number(paginaNumero) : undefined,
      versionId,
    });
    return ApiResponseDto.success(data, 'Conteo obtenido exitosamente');
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener detalle de marca (respeta visibilidad)' })
  @ApiParam({ name: 'id', type: Number })
  async obtener(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const data = await this.obtenerUseCase.execute(id, req.user!.id);
    return ApiResponseDto.success(data, 'Marca obtenida exitosamente');
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Editar marca (solo creador)' })
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarVisorMarcaRevisionDto,
    @Req() req: Request,
  ) {
    const data = await this.actualizarUseCase.execute(id, dto, req.user!.id);
    return ApiResponseDto.success(data, 'Marca actualizada exitosamente');
  }

  @Post(':id/duplicar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Duplicar marca (copia privada del usuario)' })
  async duplicar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DuplicarVisorMarcaRevisionDto,
    @Req() req: Request,
  ) {
    const data = await this.duplicarUseCase.execute(id, dto, req.user!.id);
    return ApiResponseDto.success(data, 'Marca duplicada exitosamente');
  }

  @Post(':id/publicar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publicar marca (visible para todos)' })
  async publicar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const data = await this.publicarUseCase.execute(id, req.user!.id);
    return ApiResponseDto.success(data, 'Marca publicada exitosamente');
  }

  @Post(':id/anular-publicacion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Anular publicación (solo visible para el creador)' })
  async anularPublicacion(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const data = await this.anularPublicacionUseCase.execute(id, req.user!.id);
    return ApiResponseDto.success(data, 'Publicación anulada exitosamente');
  }

  @Patch(':id/sincronizar-markup-id-aps')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar markupIdAps tras cargar en MarkupsCore' })
  async sincronizarMarkupIdAps(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SincronizarMarkupIdApsDto,
    @Req() req: Request,
  ) {
    const data = await this.sincronizarMarkupIdApsUseCase.execute(
      id,
      dto,
      req.user!.id,
    );
    return ApiResponseDto.success(data, 'markupIdAps sincronizado exitosamente');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suprimir marca (soft delete, solo creador)' })
  async suprimir(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    await this.suprimirUseCase.execute(id, req.user!.id);
    return ApiResponseDto.success(null, 'Marca suprimida exitosamente');
  }
}
