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
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { ListarMailPlantillasUseCase } from '../../application/use-cases/mail-plantilla/listar-mail-plantillas.use-case';
import { ObtenerMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/obtener-mail-plantilla.use-case';
import { CrearMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/crear-mail-plantilla.use-case';
import { ActualizarMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/actualizar-mail-plantilla.use-case';
import { EliminarMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/eliminar-mail-plantilla.use-case';
import { ListarHistorialMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/listar-historial-mail-plantilla.use-case';
import { ObtenerHistorialMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/obtener-historial-mail-plantilla.use-case';
import { PreviewMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/preview-mail-plantilla.use-case';
import { TestSendMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/test-send-mail-plantilla.use-case';
import { SembrarMailPlantillasSistemaUseCase } from '../../application/use-cases/mail-plantilla/sembrar-mail-plantillas-sistema.use-case';
import { ListMailPlantillaQueryDto } from '../../application/dtos/mail-plantilla/list-mail-plantilla-query.dto';
import { CreateMailPlantillaDto } from '../../application/dtos/mail-plantilla/create-mail-plantilla.dto';
import { UpdateMailPlantillaDto } from '../../application/dtos/mail-plantilla/update-mail-plantilla.dto';
import {
  PreviewMailPlantillaDto,
  TestSendMailPlantillaDto,
} from '../../application/dtos/mail-plantilla/preview-mail-plantilla.dto';

@ApiTags('mail-plantillas')
@ApiBearerAuth('access-token')
@Controller('mail/plantillas')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class MailPlantillaController {
  constructor(
    private readonly listarUseCase: ListarMailPlantillasUseCase,
    private readonly obtenerUseCase: ObtenerMailPlantillaUseCase,
    private readonly crearUseCase: CrearMailPlantillaUseCase,
    private readonly actualizarUseCase: ActualizarMailPlantillaUseCase,
    private readonly eliminarUseCase: EliminarMailPlantillaUseCase,
    private readonly listarHistorialUseCase: ListarHistorialMailPlantillaUseCase,
    private readonly obtenerHistorialUseCase: ObtenerHistorialMailPlantillaUseCase,
    private readonly previewUseCase: PreviewMailPlantillaUseCase,
    private readonly testSendUseCase: TestSendMailPlantillaUseCase,
    private readonly sembrarUseCase: SembrarMailPlantillasSistemaUseCase,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: 'Listar plantillas de correo' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async listar(@Query() query: ListMailPlantillaQueryDto) {
    const data = await this.listarUseCase.execute(query);
    return ApiResponseDto.success(data);
  }

  @ApiOperation({ summary: 'Sembrar plantillas de sistema (.hbs → BD)' })
  @Post('sembrar-sistema')
  @HttpCode(HttpStatus.OK)
  async sembrarSistema(@Req() request: Request) {
    const userId = await this.getUserIdFromRequest(request);
    const data = await this.sembrarUseCase.execute(userId);
    return ApiResponseDto.success(data, data.message);
  }

  @ApiOperation({ summary: 'Vista previa HTML de plantilla' })
  @Post('preview')
  @HttpCode(HttpStatus.OK)
  async preview(@Body() dto: PreviewMailPlantillaDto) {
    const data = await this.previewUseCase.execute(dto);
    return ApiResponseDto.success(data);
  }

  @ApiOperation({ summary: 'Enviar correo de prueba' })
  @Post('test-send')
  @HttpCode(HttpStatus.OK)
  async testSend(@Body() dto: TestSendMailPlantillaDto) {
    const data = await this.testSendUseCase.execute(dto);
    return ApiResponseDto.success(data, data.message);
  }

  @ApiOperation({ summary: 'Detalle de una versión histórica' })
  @Get('historial/:idHistorial')
  @HttpCode(HttpStatus.OK)
  async obtenerHistorial(
    @Param('idHistorial', ParseIntPipe) idHistorial: number,
  ) {
    const data = await this.obtenerHistorialUseCase.execute(idHistorial);
    return ApiResponseDto.success(data);
  }

  @ApiOperation({ summary: 'Historial de versiones de una plantilla' })
  @Get(':id/historial')
  @HttpCode(HttpStatus.OK)
  async listarHistorial(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const data = await this.listarHistorialUseCase.execute(
      id,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    );
    return ApiResponseDto.success(data);
  }

  @ApiOperation({ summary: 'Obtener plantilla por ID' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async obtener(@Param('id', ParseIntPipe) id: number) {
    const data = await this.obtenerUseCase.execute(id);
    return ApiResponseDto.success(data);
  }

  @ApiOperation({ summary: 'Crear plantilla de correo' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CreateMailPlantillaDto, @Req() request: Request) {
    const userId = await this.getUserIdFromRequest(request);
    const data = await this.crearUseCase.execute(dto, userId);
    return ApiResponseDto.success(data, data.message);
  }

  @ApiOperation({ summary: 'Actualizar plantilla de correo' })
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMailPlantillaDto,
    @Req() request: Request,
  ) {
    const userId = await this.getUserIdFromRequest(request);
    const data = await this.actualizarUseCase.execute(id, dto, userId);
    return ApiResponseDto.success(data, data.message);
  }

  @ApiOperation({ summary: 'Eliminar plantilla (soft delete)' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    const userId = await this.getUserIdFromRequest(request);
    const data = await this.eliminarUseCase.execute(id, userId);
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
