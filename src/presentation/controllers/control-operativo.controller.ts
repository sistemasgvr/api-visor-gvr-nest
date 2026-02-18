import { Controller, Get, Post, Param, Query, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ListarJornadasTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-jornadas-trabajador.use-case';
import { CrearJornadaUseCase } from '../../application/use-cases/control-operativo/crear-jornada.use-case';
import { ListarActividadesUseCase } from '../../application/use-cases/control-operativo/listar-actividades.use-case';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';

@Controller('control-operativo')
@UseGuards(JwtAuthGuard)
export class ControlOperativoController {
    constructor(
        private readonly listarJornadasTrabajadorUseCase: ListarJornadasTrabajadorUseCase,
        private readonly crearJornadaUseCase: CrearJornadaUseCase,
        private readonly listarActividadesUseCase: ListarActividadesUseCase,
    ) {}

    /**
     * Listar jornadas de un trabajador en un rango de fechas (por defecto semana actual).
     * GET /control-operativo/trabajadores/:idTrabajador/jornadas?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD&limit=10&offset=0
     */
    @Get('trabajadores/:idTrabajador/jornadas')
    async listarJornadasTrabajador(
        @Param('idTrabajador', ParseIntPipe) idTrabajador: number,
        @Query('fechaInicio') fechaInicio?: string,
        @Query('fechaFin') fechaFin?: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        const parsedLimit = limit != null && limit !== '' ? parseInt(limit, 10) : undefined;
        const parsedOffset = offset != null && offset !== '' ? parseInt(offset, 10) : undefined;
        const result = await this.listarJornadasTrabajadorUseCase.execute({
            idTrabajador,
            fechaInicio,
            fechaFin,
            limit: Number.isNaN(parsedLimit) ? undefined : parsedLimit,
            offset: Number.isNaN(parsedOffset) ? undefined : parsedOffset,
        });

        return ApiResponseDto.success(result, 'Jornadas listadas exitosamente');
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

    /**
     * Listar actividades con filtros opcionales.
     * GET /control-operativo/actividades?idJornada=&idTrabajador=&idProyecto=&idEstadoActividad=
     */
    @Get('actividades')
    async listarActividades(
        @Query('idJornada') idJornada?: string,
        @Query('idTrabajador') idTrabajador?: string,
        @Query('idProyecto') idProyecto?: string,
        @Query('idEstadoActividad') idEstadoActividad?: string,
    ) {
        const params = {
            idJornada: idJornada ? parseInt(idJornada, 10) : undefined,
            idTrabajador: idTrabajador ? parseInt(idTrabajador, 10) : undefined,
            idProyecto: idProyecto ? parseInt(idProyecto, 10) : undefined,
            idEstadoActividad: idEstadoActividad ? parseInt(idEstadoActividad, 10) : undefined,
        };
        const data = await this.listarActividadesUseCase.execute(params);
        return ApiResponseDto.success(data, 'Actividades listadas exitosamente');
    }
}
