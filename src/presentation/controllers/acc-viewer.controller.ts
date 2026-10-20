import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../dtos/common/api-response.dto';

// Use cases
import { GenerarTokenViewerUseCase } from '../../application/use-cases/acc/viewer/generar-token-viewer.use-case';
import { ObtenerTokenPublicoUseCase } from '../../application/use-cases/acc/viewer/obtener-token-publico.use-case';
import { ObtenerManifiestoUseCase } from '../../application/use-cases/acc/viewer/obtener-manifiesto.use-case';
import { ObtenerMetadatosUseCase } from '../../application/use-cases/acc/viewer/obtener-metadatos.use-case';

// DTOs
import { GenerarTokenViewerDto } from '../dtos/acc/viewer/generar-token-viewer.dto';
import { ObtenerTokenPublicoDto } from '../dtos/acc/viewer/obtener-token-publico.dto';
import { AuthenticatedAccess } from '../../infrastructure/auth/granular-permission.guard';

@ApiTags('acc')
@ApiBearerAuth('access-token')
@Controller('acc/viewer')
// Los tokens de aplicación dan lectura de modelos: sólo para sesiones válidas.
@UseGuards(JwtAuthGuard)
export class AccViewerController {
  constructor(
    private readonly generarTokenViewerUseCase: GenerarTokenViewerUseCase,
    private readonly obtenerTokenPublicoUseCase: ObtenerTokenPublicoUseCase,
    private readonly obtenerManifiestoUseCase: ObtenerManifiestoUseCase,
    private readonly obtenerMetadatosUseCase: ObtenerMetadatosUseCase,
  ) {}

  /**
   * POST - Generar token para el viewer (2-legged con scope viewables:read)
   * POST /acc/viewer/token
   */
  @ApiOperation({
    summary: 'Generar token para el viewer Autodesk (2-legged)',
    description:
      'Obtiene un token de aplicación con ámbito viewables:read para cargar modelos.',
  })
  @Post('token')
  @HttpCode(HttpStatus.OK)
  @AuthenticatedAccess(
    'Visor: token de solo lectura para sesiones válidas; el documento se autoriza al abrirlo en Docs',
  )
  async generarTokenViewer(@Body() dto: GenerarTokenViewerDto) {
    const resultado = await this.generarTokenViewerUseCase.execute(dto);

    return ApiResponseDto.success(resultado, 'Token generado exitosamente');
  }

  /**
   * POST - Token público (con validaciones adicionales de seguridad)
   * POST /acc/viewer/token/public
   */
  @ApiOperation({
    summary: 'Token público para el viewer',
    description: 'Genera token con validaciones adicionales de seguridad.',
  })
  @Post('token/public')
  @HttpCode(HttpStatus.OK)
  @AuthenticatedAccess(
    'Visor: token de solo lectura para sesiones válidas; el documento se autoriza al abrirlo en Docs',
  )
  async obtenerTokenPublico(@Body() dto: ObtenerTokenPublicoDto) {
    const resultado = await this.obtenerTokenPublicoUseCase.execute(dto);

    return ApiResponseDto.success(
      resultado,
      'Token público generado exitosamente',
    );
  }

  /**
   * GET - Obtener manifiesto de un archivo traducido
   * GET /acc/viewer/manifest/:urn
   */
  @ApiOperation({
    summary: 'Obtener manifiesto de traducción',
    description: 'Devuelve el manifiesto de un URN ya traducido en APS.',
  })
  @Get('manifest/:urn')
  @HttpCode(HttpStatus.OK)
  @AuthenticatedAccess(
    'Visor: token de solo lectura para sesiones válidas; el documento se autoriza al abrirlo en Docs',
  )
  async obtenerManifiesto(@Param('urn') urn: string) {
    const resultado = await this.obtenerManifiestoUseCase.execute(urn);

    return ApiResponseDto.success(
      resultado.data,
      'Manifiesto obtenido exitosamente',
    );
  }

  /**
   * GET - Obtener metadatos de un modelo
   * GET /acc/viewer/metadata/:urn
   */
  @ApiOperation({
    summary: 'Obtener metadatos del modelo',
  })
  @Get('metadata/:urn')
  @HttpCode(HttpStatus.OK)
  @AuthenticatedAccess(
    'Visor: token de solo lectura para sesiones válidas; el documento se autoriza al abrirlo en Docs',
  )
  async obtenerMetadatos(@Param('urn') urn: string) {
    const resultado = await this.obtenerMetadatosUseCase.execute(urn);

    return ApiResponseDto.success(
      resultado.data,
      'Metadatos obtenidos exitosamente',
    );
  }
}
