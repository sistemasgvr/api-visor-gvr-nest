import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Query,
  UnauthorizedException,
  UseGuards,
  Inject,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { ObtenerToken2LeggedUseCase } from '../../application/use-cases/acc/obtener-token-2legged.use-case';
import { GenerarUrlAutorizacionUseCase } from '../../application/use-cases/acc/generar-url-autorizacion.use-case';
import { ObtenerMiTokenUseCase } from '../../application/use-cases/acc/obtener-mi-token.use-case';
import { RefrescarToken3LeggedUseCase } from '../../application/use-cases/acc/refrescar-token-3legged.use-case';
import { CronRefrescarTokensAccUseCase } from '../../application/use-cases/acc/cron-refrescar-tokens-acc.use-case';
import { RevocarTokenUseCase } from '../../application/use-cases/acc/revocar-token.use-case';
import { CallbackAutorizacionUseCase } from '../../application/use-cases/acc/callback-autorizacion.use-case';
import { ValidarExpiracionUseCase } from '../../application/use-cases/acc/validar-expiracion.use-case';
import { ObtenerToken2LeggedDto } from '../../application/dtos/acc/obtener-token-2legged.dto';
import { GenerarUrlAutorizacionDto } from '../../application/dtos/acc/generar-url-autorizacion.dto';
import { CallbackAutorizacionDto } from '../../application/dtos/acc/callback-autorizacion.dto';
import { ValidarExpiracionDto } from '../../application/dtos/acc/validar-expiracion.dto';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import {
  ACC_REPOSITORY,
  type IAccRepository,
} from '../../domain/repositories/acc.repository.interface';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('acc')
@ApiBearerAuth('access-token')
@Controller('acc')
export class AccController {
  constructor(
    private readonly obtenerToken2LeggedUseCase: ObtenerToken2LeggedUseCase,
    private readonly generarUrlAutorizacionUseCase: GenerarUrlAutorizacionUseCase,
    private readonly obtenerMiTokenUseCase: ObtenerMiTokenUseCase,
    private readonly refrescarToken3LeggedUseCase: RefrescarToken3LeggedUseCase,
    private readonly cronRefrescarTokensAccUseCase: CronRefrescarTokensAccUseCase,
    private readonly revocarTokenUseCase: RevocarTokenUseCase,
    private readonly callbackAutorizacionUseCase: CallbackAutorizacionUseCase,
    private readonly validarExpiracionUseCase: ValidarExpiracionUseCase,
    private readonly autodeskApiService: AutodeskApiService,
    private readonly configService: ConfigService,
    @Inject(ACC_REPOSITORY)
    private readonly accRepository: IAccRepository,
  ) {}

  // ==================== 2-LEGGED TOKEN (App-Only) ====================

  /**
   * Obtener token 2-legged (no requiere usuario final)
   * POST /acc/token
   */
  @ApiOperation({
    summary: 'Obtener token 2-legged (solo aplicación)',
    description: 'Token de aplicación sin contexto de usuario final.',
  })
  @Post('token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async obtenerToken(@Body() dto: ObtenerToken2LeggedDto) {
    const resultado = await this.obtenerToken2LeggedUseCase.execute(dto);

    return ApiResponseDto.success(
      resultado,
      'Token 2-legged obtenido exitosamente',
    );
  }

  // ==================== 3-LEGGED TOKEN (User Context) ====================

  /**
   * Generar URL de autorización
   * POST /acc/oauth/authorize
   */
  @ApiOperation({
    summary: 'Generar URL de autorización OAuth 3-legged',
  })
  @Post('oauth/authorize')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async generarUrlAutorizacion(@Body() dto: GenerarUrlAutorizacionDto) {
    const resultado = await this.generarUrlAutorizacionUseCase.execute(dto);

    return ApiResponseDto.success(
      resultado,
      'URL de autorización generada exitosamente',
    );
  }

  /**
   * Obtener mi token activo
   * GET /acc/oauth/mi-token
   */
  @ApiOperation({ summary: 'Obtener el token ACC 3-legged activo del usuario' })
  @Get('oauth/mi-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async obtenerMiToken(@Req() request: Request) {
    // User is automatically attached by JwtAuthGuard
    const user = request.user!;

    const resultado = await this.obtenerMiTokenUseCase.execute(user.sub);

    return ApiResponseDto.success(resultado, 'Token obtenido exitosamente');
  }

  /**
   * Cron: refrescar todos los tokens ACC (cada 55 min).
   * GET /acc/cron/refresh-tokens?key=CRON_SECRET
   * No requiere JWT; se autoriza con CRON_SECRET.
   */
  @ApiOperation({
    summary: 'Cron: refrescar tokens ACC caducados',
    description:
      'Protegido con query key=CRON_SECRET; no usa JWT.',
    security: [],
  })
  @Get('cron/refresh-tokens')
  @HttpCode(HttpStatus.OK)
  async cronRefrescarTokens(@Query('key') key?: string) {
    const secret = this.configService.get<string>('CRON_SECRET');
    if (secret && key !== secret) {
      throw new UnauthorizedException('Cron no autorizado');
    }
    const result = await this.cronRefrescarTokensAccUseCase.execute();
    return ApiResponseDto.success(
      result,
      `Tokens ACC: ${result.refrescados}/${result.total} refrescados`,
    );
  }

  /**
   * Refrescar mi token
   * POST /acc/oauth/refresh
   */
  @ApiOperation({ summary: 'Refrescar token ACC 3-legged del usuario' })
  @Post('oauth/refresh')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refrescarToken(@Req() request: Request) {
    // User is automatically attached by JwtAuthGuard
    const user = request.user!;

    try {
      const resultado = await this.refrescarToken3LeggedUseCase.execute(
        user.sub,
      );

      return ApiResponseDto.success(resultado, 'Token refrescado exitosamente');
    } catch (error: any) {
      // If refresh token is expired, return error with re-authentication guidance
      if (error.message && error.message.includes('Refresh token expirado')) {
        return ApiResponseDto.error(error.message, HttpStatus.UNAUTHORIZED);
      }

      // Re-throw other errors to be handled by global exception filter
      throw error;
    }
  }

  /**
   * Revocar mi token
   * DELETE /acc/oauth/revoke
   */
  @ApiOperation({ summary: 'Revocar y borrar token ACC del usuario' })
  @Delete('oauth/revoke')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revocarMiToken(@Req() request: Request) {
    // User is automatically attached by JwtAuthGuard
    const user = request.user!;

    await this.revocarTokenUseCase.execute(user.sub);

    return ApiResponseDto.success(null, 'Token revocado exitosamente');
  }

  // ==================== VALIDACIONES ====================

  /**
   * Validar expiración de token
   * POST /acc/validar-expiracion
   */
  @ApiOperation({
    summary: 'Comprobar caducidad de un token ACC',
  })
  @Post('validar-expiracion')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async validarExpiracion(@Body() dto: ValidarExpiracionDto) {
    const resultado = await this.validarExpiracionUseCase.execute(dto);

    const message = resultado.expirado
      ? 'Token expirado o próximo a expirar'
      : 'Token aún válido';

    return ApiResponseDto.success(resultado, message);
  }
  /**
   * Callback de OAuth - Intercambia el código por token y redirige al frontend
   * GET /acc/oauth/callback
   */
  @ApiOperation({
    summary: 'Callback OAuth ACC (intercambio de código)',
    description:
      'Redirige al frontend tras guardar el token 3-legged. No usa JWT.',
    security: [],
  })
  @Get('oauth/callback')
  async callbackAutorizacion(
    @Query() dto: CallbackAutorizacionDto,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    // En un entorno real, obtenemos el usuario de la sesión o token.
    // Simularemos el usuario ID 1 como en el código original PHP si no hay auth
    const user = request.user!;
    const userId = user?.sub || 1; // Default to 1 if no user context

    const resultado = await this.callbackAutorizacionUseCase.execute(
      dto,
      userId,
    );

    const frontendUrls = this.configService.get<string>('FRONTEND_URLS');
    const redirectPath = '/config-autodesk?acc_connected=1';
    if (frontendUrls) {
      const baseUrl = frontendUrls.split(',')[0].trim();
      if (baseUrl) {
        const redirectUrl = `${baseUrl.replace(/\/$/, '')}${redirectPath}`;
        return res.redirect(302, redirectUrl);
      }
    }
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDto.success(
          resultado,
          'Token 3-legged obtenido y guardado exitosamente',
        ),
      );
  }

  /**
   * Obtener perfil del usuario de ACC autenticado
   * GET /acc/perfil-usuario
   */
  @ApiOperation({
    summary: 'Perfil del usuario en Autodesk Construction Cloud',
  })
  @Get('perfil-usuario')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async obtenerPerfilUsuarioAcc(@Req() request: Request) {
    const user = request.user!;
    const userId = user?.sub;

    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Obtener el token 3-legged del usuario
    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(userId);

    if (!token) {
      return ApiResponseDto.error(
        'No se encontró token de ACC. Debe autorizar la aplicación primero.',
        HttpStatus.NOT_FOUND,
      );
    }

    // Verificar si el token está expirado
    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      return ApiResponseDto.error(
        'El token de ACC ha expirado. Debe refrescar o re-autorizar.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      // Obtener el perfil del usuario de ACC
      const perfil = await this.autodeskApiService.obtenerPerfilUsuarioAcc(
        token.tokenAcceso,
      );

      return ApiResponseDto.success(
        {
          userId: perfil.userId,
          email: perfil.emailId,
          userName: perfil.userName,
          firstName: perfil.firstName,
          lastName: perfil.lastName,
          emailVerified: perfil.emailVerified,
        },
        'Perfil del usuario de ACC obtenido exitosamente',
      );
    } catch (error: any) {
      return ApiResponseDto.error(
        `Error al obtener perfil de ACC: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
