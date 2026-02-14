import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ListarJornadasTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-jornadas-trabajador.use-case';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';

@Controller('control-operativo')
@UseGuards(JwtAuthGuard)
export class ControlOperativoController {
    constructor(
        private readonly listarJornadasTrabajadorUseCase: ListarJornadasTrabajadorUseCase,
    ) {}

    /**
     * Listar jornadas de un trabajador en un rango de fechas (por defecto semana actual).
     * GET /control-operativo/trabajadores/:idTrabajador/jornadas?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
     */
    @Get('trabajadores/:idTrabajador/jornadas')
    async listarJornadasTrabajador(
        @Param('idTrabajador', ParseIntPipe) idTrabajador: number,
        @Query('fechaInicio') fechaInicio?: string,
        @Query('fechaFin') fechaFin?: string,
    ) {
        const data = await this.listarJornadasTrabajadorUseCase.execute({
            idTrabajador,
            fechaInicio,
            fechaFin,
        });

        return ApiResponseDto.success(data, 'Jornadas listadas exitosamente');
    }
}
