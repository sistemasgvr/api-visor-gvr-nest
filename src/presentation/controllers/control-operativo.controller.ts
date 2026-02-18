import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, ParseIntPipe, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ListarJornadasTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-jornadas-trabajador.use-case';
import { CrearJornadaUseCase } from '../../application/use-cases/control-operativo/crear-jornada.use-case';
import { ListarActividadesUseCase } from '../../application/use-cases/control-operativo/listar-actividades.use-case';
import { CronCierreJornadasUseCase } from '../../application/use-cases/control-operativo/cron-cierre-jornadas.use-case';
import { ActualizarEstadoJornadaUseCase } from '../../application/use-cases/control-operativo/actualizar-estado-jornada.use-case';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';

@Controller('control-operativo')
export class ControlOperativoController {
    constructor(
        private readonly listarJornadasTrabajadorUseCase: ListarJornadasTrabajadorUseCase,
        private readonly crearJornadaUseCase: CrearJornadaUseCase,
        private readonly listarActividadesUseCase: ListarActividadesUseCase,
        private readonly cronCierreJornadasUseCase: CronCierreJornadasUseCase,
        private readonly actualizarEstadoJornadaUseCase: ActualizarEstadoJornadaUseCase,
        private readonly configService: ConfigService,
    ) {}

    /**
     * Cron único de cierre de jornadas (al final del día).
     * GET /control-operativo/cron/cierre-jornadas?fecha=YYYY-MM-DD&key=CRON_SECRET
     * Sin fecha usa "hoy". Hace: 1) Crea jornadas en Alerta para quien no abrió ese día.
     * 2) Para el día anterior: Alerta sin actividades → Incompleto; con actividades → Completado.
     */
    @Get('cron/cierre-jornadas')
    async cronCierreJornadas(@Query('fecha') fecha: string, @Query('key') key?: string) {
        const secret = this.configService.get<string>('CRON_SECRET');
        if (secret && key !== secret) {
            throw new UnauthorizedException('Cron no autorizado');
        }
        const f = fecha?.trim() || this.getFechaHoy();
        const result = await this.cronCierreJornadasUseCase.execute(f);
        return ApiResponseDto.success(
            {
                fecha: f,
                insertados_alerta: result.insertados_alerta,
                pasados_incompleto: result.pasados_incompleto,
                pasados_completado: result.pasados_completado,
            },
            'Cierre de jornadas ejecutado',
        );
    }

    private getFechaHoy(): string {
        return new Date().toISOString().slice(0, 10);
    }

    /**
     * Listar jornadas de un trabajador en un rango de fechas (por defecto semana actual).
     * GET /control-operativo/trabajadores/:idTrabajador/jornadas?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD&limit=10&offset=0
     */
    @Get('trabajadores/:idTrabajador/jornadas')
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
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
     * Actualizar estado de una jornada (admin / rol con permiso). Ej: Incompleto → Abierta.
     * PATCH /control-operativo/jornadas/:idJornada/estado
     * Body: { "idEstadoJornada": number }
     */
    @Patch('jornadas/:idJornada/estado')
    @UseGuards(JwtAuthGuard)
    async actualizarEstadoJornada(
        @Param('idJornada', ParseIntPipe) idJornada: number,
        @Body('idEstadoJornada') idEstadoJornada: number,
    ) {
        const id = idEstadoJornada != null ? Number(idEstadoJornada) : NaN;
        if (Number.isNaN(id) || id < 1) {
            return ApiResponseDto.badRequest('idEstadoJornada es obligatorio y debe ser un número válido');
        }
        const ok = await this.actualizarEstadoJornadaUseCase.execute({
            idJornada,
            idEstadoJornada: id,
        });
        if (!ok) {
            return ApiResponseDto.badRequest('No se pudo actualizar el estado de la jornada');
        }
        return ApiResponseDto.success({ idJornada, idEstadoJornada: id }, 'Estado de jornada actualizado');
    }

    /**
     * Listar actividades con filtros opcionales.
     * GET /control-operativo/actividades?idJornada=&idTrabajador=&idProyecto=&idEstadoActividad=
     */
    @Get('actividades')
    @UseGuards(JwtAuthGuard)
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
