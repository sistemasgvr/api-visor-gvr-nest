import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { DatabaseFunctionService } from '../../infrastructure/database/database-function.service';

@ApiTags('ubicacion')
@ApiBearerAuth('access-token')
@Controller('ubicacion')
@UseGuards(JwtAuthGuard)
export class UbicacionController {
  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
  ) {}

  @ApiOperation({ summary: 'Listar países' })
  @Get('paises')
  @HttpCode(HttpStatus.OK)
  async listarPaises() {
    const data = await this.databaseFunctionService.callFunction<any>(
      'gen_ListarPaises',
      [],
    );
    return ApiResponseDto.success(data || [], 'Países obtenidos exitosamente');
  }

  @ApiOperation({
    summary: 'Listar departamentos',
    description: 'Opcionalmente filtrados por idPais.',
  })
  @Get('departamentos')
  @HttpCode(HttpStatus.OK)
  async listarDepartamentos(
    @Query('idPais', new ParseIntPipe({ optional: true })) idPais?: number,
  ) {
    const data = await this.databaseFunctionService.callFunction<any>(
      'gen_ListarDepartamentos',
      [idPais ?? null],
    );
    return ApiResponseDto.success(
      data || [],
      'Departamentos obtenidos exitosamente',
    );
  }

  @ApiOperation({
    summary: 'Listar provincias',
    description: 'Opcionalmente filtradas por idDepartamento.',
  })
  @Get('provincias')
  @HttpCode(HttpStatus.OK)
  async listarProvincias(
    @Query('idDepartamento', new ParseIntPipe({ optional: true }))
    idDepartamento?: number,
  ) {
    const data = await this.databaseFunctionService.callFunction<any>(
      'gen_ListarProvincias',
      [idDepartamento ?? null],
    );
    return ApiResponseDto.success(
      data || [],
      'Provincias obtenidas exitosamente',
    );
  }

  @ApiOperation({
    summary: 'Listar distritos',
    description: 'Opcionalmente filtrados por idProvincia.',
  })
  @Get('distritos')
  @HttpCode(HttpStatus.OK)
  async listarDistritos(
    @Query('idProvincia', new ParseIntPipe({ optional: true }))
    idProvincia?: number,
  ) {
    const data = await this.databaseFunctionService.callFunction<any>(
      'gen_ListarDistritos',
      [idProvincia ?? null],
    );
    return ApiResponseDto.success(
      data || [],
      'Distritos obtenidos exitosamente',
    );
  }
}
