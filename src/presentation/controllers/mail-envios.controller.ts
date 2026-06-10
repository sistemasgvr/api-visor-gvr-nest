import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { ListarCoberturaEnviosMailUseCase } from '../../application/use-cases/mail-envio/listar-cobertura-envios-mail.use-case';
import { ListarLogsEnvioMailUseCase } from '../../application/use-cases/mail-envio/listar-logs-envio-mail.use-case';
import { ReenviarMailEnvioUseCase } from '../../application/use-cases/mail-envio/reenviar-mail-envio.use-case';
import { ReenviarPendientesMailEnvioUseCase } from '../../application/use-cases/mail-envio/reenviar-pendientes-mail-envio.use-case';
import {
  ListMailEnvioCoberturaQueryDto,
  ListMailEnvioLogsQueryDto,
} from '../../application/dtos/mail-envio/list-mail-envio-query.dto';
import {
  ReenviarMailEnvioDto,
  ReenviarPendientesMailEnvioDto,
} from '../../application/dtos/mail-envio/reenviar-mail-envio.dto';

@ApiTags('mail-envios')
@ApiBearerAuth('access-token')
@Controller('mail/envios')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class MailEnviosController {
  constructor(
    private readonly listarCoberturaUseCase: ListarCoberturaEnviosMailUseCase,
    private readonly listarLogsUseCase: ListarLogsEnvioMailUseCase,
    private readonly reenviarUseCase: ReenviarMailEnvioUseCase,
    private readonly reenviarPendientesUseCase: ReenviarPendientesMailEnvioUseCase,
  ) {}

  @ApiOperation({ summary: 'Cobertura de envíos por plantilla y trabajador' })
  @Get('cobertura')
  @HttpCode(HttpStatus.OK)
  async listarCobertura(@Query() query: ListMailEnvioCoberturaQueryDto) {
    const data = await this.listarCoberturaUseCase.execute(query);
    return ApiResponseDto.success(data);
  }

  @ApiOperation({ summary: 'Registro de envíos (auditoría)' })
  @Get('logs')
  @HttpCode(HttpStatus.OK)
  async listarLogs(@Query() query: ListMailEnvioLogsQueryDto) {
    const data = await this.listarLogsUseCase.execute(query);
    return ApiResponseDto.success(data);
  }

  @ApiOperation({ summary: 'Reenviar correo a un trabajador' })
  @Post('reenviar')
  @HttpCode(HttpStatus.OK)
  async reenviar(@Body() dto: ReenviarMailEnvioDto) {
    const data = await this.reenviarUseCase.execute(dto);
    return ApiResponseDto.success(data, data.message);
  }

  @ApiOperation({ summary: 'Reenviar correos pendientes o fallidos' })
  @Post('reenviar-pendientes')
  @HttpCode(HttpStatus.OK)
  async reenviarPendientes(@Body() dto: ReenviarPendientesMailEnvioDto) {
    const data = await this.reenviarPendientesUseCase.execute(dto);
    return ApiResponseDto.success(data, data.message);
  }
}
