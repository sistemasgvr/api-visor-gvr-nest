import { Controller, Get, Post, Param, Query, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ListarJornadasTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-jornadas-trabajador.use-case';
import { CrearJornadaUseCase } from '../../application/use-cases/control-operativo/crear-jornada.use-case';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';

@Controller('control-operativo')
@UseGuards(JwtAuthGuard)
export class ControlOperativoController {
    constructor(
        private readonly listarJornadasTrabajadorUseCase: ListarJornadasTrabajadorUseCase,
        private readonly crearJornadaUseCase: CrearJornadaUseCase,
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

    /**
     * Crear una jornada para un trabajador en una fecha (botón "Ingresar").
     * Si ya existe jornada para esa fecha, la devuelve sin duplicar.
     * POST /control-operativo/trabajadores/:idTrabajador/jornadas
     * Body: {
     *   "fechaJornada": "YYYY-MM-DD",
     *   "idConfiguracionJornada"?: number,
     *   "idEstadoJornada"?: number,
     *   "horasEsperadas"?: number
     * }
     * Si no se envían los opcionales, se obtienen del contrato vigente y configuración.
     */
    @Post('trabajadores/:idTrabajador/jornadas')
    async crearJornada(
        @Param('idTrabajador', ParseIntPipe) idTrabajador: number,
        @Body('fechaJornada') fechaJornada: string,
        @Body('idConfiguracionJornada') idConfiguracionJornada?: number,
        @Body('idEstadoJornada') idEstadoJornada?: number,
        @Body('horasEsperadas') horasEsperadas?: number,
    ) {
        const data = await this.crearJornadaUseCase.execute({
            idTrabajador,
            fechaJornada,
            idConfiguracionJornada,
            idEstadoJornada,
            horasEsperadas,
        });

        if (!data) {
            return ApiResponseDto.badRequest('No se pudo crear la jornada');
        }

        return ApiResponseDto.created(data, 'Jornada creada exitosamente');
    }
}
