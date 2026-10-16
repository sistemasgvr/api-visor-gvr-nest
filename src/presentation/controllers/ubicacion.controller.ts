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
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ListarPaisesUseCase } from '../../application/use-cases/ubicacion/listar-paises.use-case';
import { ListarDepartamentosUseCase } from '../../application/use-cases/ubicacion/listar-departamentos.use-case';
import { ListarProvinciasUseCase } from '../../application/use-cases/ubicacion/listar-provincias.use-case';
import { ListarDistritosUseCase } from '../../application/use-cases/ubicacion/listar-distritos.use-case';

@ApiTags('ubicacion')
@ApiBearerAuth('access-token')
@Controller('ubicacion')
@UseGuards(JwtAuthGuard)
export class UbicacionController {
  constructor(
    private readonly listarPaisesUseCase: ListarPaisesUseCase,
    private readonly listarDepartamentosUseCase: ListarDepartamentosUseCase,
    private readonly listarProvinciasUseCase: ListarProvinciasUseCase,
    private readonly listarDistritosUseCase: ListarDistritosUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar países' })
  @Get('paises')
  @HttpCode(HttpStatus.OK)
  async listarPaises() {
    const data = await this.listarPaisesUseCase.execute();
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
    const data = await this.listarDepartamentosUseCase.execute(idPais);
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
    const data = await this.listarProvinciasUseCase.execute(idDepartamento);
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
    const data = await this.listarDistritosUseCase.execute(idProvincia);
    return ApiResponseDto.success(
      data || [],
      'Distritos obtenidos exitosamente',
    );
  }
}
