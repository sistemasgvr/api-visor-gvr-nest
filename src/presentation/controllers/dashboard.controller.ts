import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RangoFechasDashboardDto } from '../dtos/dashboard/rango-fechas.dto';

import { ObtenerCantidadProyectosVigentesUseCase } from '../../application/use-cases/dashboard/obtener-cantidad-proyectos-vigentes.use-case';
import { ObtenerCantidadTrabajadoresActivosUseCase } from '../../application/use-cases/dashboard/obtener-cantidad-trabajadores-activos.use-case';
import { ObtenerCantidadActividadesPendientesUseCase } from '../../application/use-cases/dashboard/obtener-cantidad-actividades-pendientes.use-case';
import { ObtenerCantidadActividadesObservadasUseCase } from '../../application/use-cases/dashboard/obtener-cantidad-actividades-observadas.use-case';
import { ObtenerCantidadActividadesRechazadasUseCase } from '../../application/use-cases/dashboard/obtener-cantidad-actividades-rechazadas.use-case';
import { ObtenerCantidadTrabajadoresPorProyectoUseCase } from '../../application/use-cases/dashboard/obtener-cantidad-trabajadores-por-proyecto.use-case';
import { ObtenerCantidadJornadasCompletasSemanaUseCase } from '../../application/use-cases/dashboard/obtener-cantidad-jornadas-completas-semana.use-case';
import { ObtenerTopTrabajadoresHorasMesUseCase } from '../../application/use-cases/dashboard/obtener-top-trabajadores-horas-mes.use-case';
import { ObtenerCantidadTrabajadoresConectadoSemanaUseCase } from '../../application/use-cases/dashboard/obtener-cantidad-trabajadores-conectado-semana.use-case';
import { ObtenerHorasEsperadasVsRegistradasMesUseCase } from '../../application/use-cases/dashboard/obtener-horas-esperadas-vs-registradas-mes.use-case';
import { ObtenerProyectosConProgresoUseCase } from '../../application/use-cases/dashboard/obtener-proyectos-con-progreso.use-case';
import { ObtenerActividadesPorValidarPorCoordinadorUseCase } from '../../application/use-cases/dashboard/obtener-actividades-por-validar-por-coordinador.use-case';
import { ObtenerTopTrabajadoresJornadasCerradasUseCase } from '../../application/use-cases/dashboard/obtener-top-trabajadores-jornadas-cerradas.use-case';
import { ObtenerTopCoordinadoresActividadesValidadasUseCase } from '../../application/use-cases/dashboard/obtener-top-coordinadores-actividades-validadas.use-case';
import { RequireScopedPermission } from '../../infrastructure/auth/granular-permission.guard';

@ApiTags('dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly obtenerCantidadProyectosVigentesUseCase: ObtenerCantidadProyectosVigentesUseCase,
    private readonly obtenerCantidadTrabajadoresActivosUseCase: ObtenerCantidadTrabajadoresActivosUseCase,
    private readonly obtenerCantidadActividadesPendientesUseCase: ObtenerCantidadActividadesPendientesUseCase,
    private readonly obtenerCantidadActividadesObservadasUseCase: ObtenerCantidadActividadesObservadasUseCase,
    private readonly obtenerCantidadActividadesRechazadasUseCase: ObtenerCantidadActividadesRechazadasUseCase,
    private readonly obtenerCantidadTrabajadoresPorProyectoUseCase: ObtenerCantidadTrabajadoresPorProyectoUseCase,
    private readonly obtenerCantidadJornadasCompletasSemanaUseCase: ObtenerCantidadJornadasCompletasSemanaUseCase,
    private readonly obtenerTopTrabajadoresHorasMesUseCase: ObtenerTopTrabajadoresHorasMesUseCase,
    private readonly obtenerCantidadTrabajadoresConectadoSemanaUseCase: ObtenerCantidadTrabajadoresConectadoSemanaUseCase,
    private readonly obtenerHorasEsperadasVsRegistradasMesUseCase: ObtenerHorasEsperadasVsRegistradasMesUseCase,
    private readonly obtenerProyectosConProgresoUseCase: ObtenerProyectosConProgresoUseCase,
    private readonly obtenerActividadesPorValidarPorCoordinadorUseCase: ObtenerActividadesPorValidarPorCoordinadorUseCase,
    private readonly obtenerTopTrabajadoresJornadasCerradasUseCase: ObtenerTopTrabajadoresJornadasCerradasUseCase,
    private readonly obtenerTopCoordinadoresActividadesValidadasUseCase: ObtenerTopCoordinadoresActividadesValidadasUseCase,
  ) {}

  @ApiOperation({ summary: 'Conteo de proyectos vigentes' })
  @Get('cantidad-proyectos-vigentes')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('inicio.indicadores.ver_proyectos_vigentes')
  async obtenerCantidadProyectosVigentes() {
    const data = await this.obtenerCantidadProyectosVigentesUseCase.execute();
    return ApiResponseDto.success(data, 'Cantidad de proyectos vigentes');
  }

  @ApiOperation({ summary: 'Conteo de trabajadores activos' })
  @Get('cantidad-trabajadores-activos')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('inicio.indicadores.ver_trabajadores_activos')
  async obtenerCantidadTrabajadoresActivos() {
    const data = await this.obtenerCantidadTrabajadoresActivosUseCase.execute();
    return ApiResponseDto.success(data, 'Cantidad de trabajadores activos');
  }

  @ApiOperation({
    summary: 'Actividades pendientes de validación',
    description: 'Estados tipo “Por aprobar” según reglas de negocio.',
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Inicio del periodo (YYYY-MM-DD). Sin valor: mes actual.',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fin del periodo (YYYY-MM-DD), inclusivo.',
  })
  @Get('cantidad-actividades-pendientes')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('inicio.indicadores.ver_actividades_pendientes')
  async obtenerCantidadActividadesPendientes(
    @Query() rango: RangoFechasDashboardDto,
  ) {
    const data =
      await this.obtenerCantidadActividadesPendientesUseCase.execute(rango);
    return ApiResponseDto.success(data, 'Cantidad de actividades pendientes');
  }

  @ApiOperation({ summary: 'Actividades en estado observado' })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Inicio del periodo (YYYY-MM-DD). Sin valor: mes actual.',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fin del periodo (YYYY-MM-DD), inclusivo.',
  })
  @Get('cantidad-actividades-observadas')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('inicio.indicadores.ver_actividades_observadas')
  async obtenerCantidadActividadesObservadas(
    @Query() rango: RangoFechasDashboardDto,
  ) {
    const data =
      await this.obtenerCantidadActividadesObservadasUseCase.execute(rango);
    return ApiResponseDto.success(data, 'Cantidad de actividades observadas');
  }

  @ApiOperation({ summary: 'Actividades rechazadas' })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Inicio del periodo (YYYY-MM-DD). Sin valor: mes actual.',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fin del periodo (YYYY-MM-DD), inclusivo.',
  })
  @Get('cantidad-actividades-rechazadas')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('inicio.indicadores.ver_actividades_rechazadas')
  async obtenerCantidadActividadesRechazadas(
    @Query() rango: RangoFechasDashboardDto,
  ) {
    const data =
      await this.obtenerCantidadActividadesRechazadasUseCase.execute(rango);
    return ApiResponseDto.success(data, 'Cantidad de actividades rechazadas');
  }

  @ApiOperation({
    summary: 'Trabajadores por proyecto (agregado)',
    description: 'Para gráficos o tablas resumen.',
  })
  @Get('cantidad-trabajadores-por-proyecto')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('inicio.indicadores.ver_trabajadores_por_proyecto')
  async obtenerCantidadTrabajadoresPorProyecto() {
    const data =
      await this.obtenerCantidadTrabajadoresPorProyectoUseCase.execute();
    return ApiResponseDto.success(
      data,
      'Cantidad de trabajadores por proyecto',
    );
  }

  @ApiOperation({ summary: 'Jornadas completas en la semana actual' })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Inicio del periodo (YYYY-MM-DD). Sin valor: semana actual.',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fin del periodo (YYYY-MM-DD), inclusivo.',
  })
  @Get('cantidad-jornadas-completas-semana')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('inicio.indicadores.ver_jornadas_completas')
  async obtenerCantidadJornadasCompletasSemana(
    @Query() rango: RangoFechasDashboardDto,
  ) {
    const data =
      await this.obtenerCantidadJornadasCompletasSemanaUseCase.execute(rango);
    return ApiResponseDto.success(
      data,
      'Cantidad de jornadas completas de la semana',
    );
  }

  @ApiOperation({ summary: 'Ranking de horas registradas en el mes' })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Inicio del periodo (YYYY-MM-DD). Sin valor: mes actual.',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fin del periodo (YYYY-MM-DD), inclusivo.',
  })
  @Get('top-trabajadores-horas-mes')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('inicio.indicadores.ver_ranking_horas')
  async obtenerTopTrabajadoresHorasMes(
    @Query() rango: RangoFechasDashboardDto,
  ) {
    const data =
      await this.obtenerTopTrabajadoresHorasMesUseCase.execute(rango);
    return ApiResponseDto.success(data, 'Top trabajadores por horas del mes');
  }

  @ApiOperation({
    summary: 'Trabajadores que registraron actividad en la semana',
    description: 'Proxy al indicador de “conectados” operativos.',
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Inicio del periodo (YYYY-MM-DD). Sin valor: semana actual.',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fin del periodo (YYYY-MM-DD), inclusivo.',
  })
  @Get('cantidad-trabajadores-conectado-semana')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('inicio.indicadores.ver_usuarios_conectados')
  async obtenerCantidadTrabajadoresConectadoSemana(
    @Query() rango: RangoFechasDashboardDto,
  ) {
    const data =
      await this.obtenerCantidadTrabajadoresConectadoSemanaUseCase.execute(
        rango,
      );
    return ApiResponseDto.success(
      data,
      'Cantidad de trabajadores conectados por semana',
    );
  }

  @ApiOperation({
    summary: 'Horas esperadas vs registradas (mes)',
    description: 'Comparativo contractual vs actividades aprobadas.',
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Inicio del periodo (YYYY-MM-DD). Sin valor: mes actual.',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fin del periodo (YYYY-MM-DD), inclusivo.',
  })
  @Get('horas-esperadas-vs-registradas-mes')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('inicio.indicadores.ver_horas_esperadas_registradas')
  async obtenerHorasEsperadasVsRegistradasMes(
    @Query() rango: RangoFechasDashboardDto,
  ) {
    const data =
      await this.obtenerHorasEsperadasVsRegistradasMesUseCase.execute(rango);
    return ApiResponseDto.success(
      data,
      'Horas esperadas vs registradas del mes',
    );
  }

  @ApiOperation({
    summary: 'Proyectos con avance de actividades',
    description: 'Para tarjetas de seguimiento.',
  })
  @Get('proyectos-con-progreso')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('inicio.indicadores.ver_progreso_proyectos')
  async obtenerProyectosConProgreso() {
    const data = await this.obtenerProyectosConProgresoUseCase.execute();
    return ApiResponseDto.success(data, 'Proyectos con progreso');
  }

  @ApiOperation({
    summary: 'Actividades por validar agrupadas por coordinador',
    description:
      'Actividades en estado «Por aprobar» por coordinador asignado.',
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Inicio del periodo (YYYY-MM-DD). Sin valor: mes actual.',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fin del periodo (YYYY-MM-DD), inclusivo.',
  })
  @Get('actividades-por-validar-por-coordinador')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('inicio.indicadores.ver_actividades_por_validar')
  async obtenerActividadesPorValidarPorCoordinador(
    @Query() rango: RangoFechasDashboardDto,
  ) {
    const data =
      await this.obtenerActividadesPorValidarPorCoordinadorUseCase.execute(
        rango,
      );
    return ApiResponseDto.success(
      data,
      'Actividades por validar por coordinador',
    );
  }

  @ApiOperation({
    summary: 'Top de trabajadores con jornadas cerradas',
    description: 'Jornadas en estado «Incompleto» (cerradas sin actividades).',
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Inicio del periodo (YYYY-MM-DD). Sin valor: mes actual.',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fin del periodo (YYYY-MM-DD), inclusivo.',
  })
  @Get('top-trabajadores-jornadas-cerradas')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('inicio.indicadores.ver_jornadas_cerradas')
  async obtenerTopTrabajadoresJornadasCerradas(
    @Query() rango: RangoFechasDashboardDto,
  ) {
    const data =
      await this.obtenerTopTrabajadoresJornadasCerradasUseCase.execute(rango);
    return ApiResponseDto.success(
      data,
      'Top de trabajadores con jornadas cerradas',
    );
  }

  @ApiOperation({
    summary: 'Top de coordinadores con actividades validadas',
    description: 'Actividades en estado «Aprobado por coordinador» (375).',
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Inicio del periodo (YYYY-MM-DD). Sin valor: mes actual.',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fin del periodo (YYYY-MM-DD), inclusivo.',
  })
  @Get('top-coordinadores-actividades-validadas')
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('inicio.indicadores.ver_coordinadores_validadas')
  async obtenerTopCoordinadoresActividadesValidadas(
    @Query() rango: RangoFechasDashboardDto,
  ) {
    const data =
      await this.obtenerTopCoordinadoresActividadesValidadasUseCase.execute(
        rango,
      );
    return ApiResponseDto.success(
      data,
      'Top de coordinadores con actividades validadas',
    );
  }
}
