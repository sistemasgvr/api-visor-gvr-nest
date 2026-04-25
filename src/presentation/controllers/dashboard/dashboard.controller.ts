import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiResponseDto } from '../../../shared/dtos/api-response.dto';
import { JwtAuthGuard } from '../../../infrastructure/auth/jwt-auth.guard';

import { ObtenerCantidadProyectosVigentesUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-proyectos-vigentes.use-case';
import { ObtenerCantidadTrabajadoresActivosUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-trabajadores-activos.use-case';
import { ObtenerCantidadActividadesPendientesUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-actividades-pendientes.use-case';
import { ObtenerCantidadActividadesObservadasUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-actividades-observadas.use-case';
import { ObtenerCantidadActividadesRechazadasUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-actividades-rechazadas.use-case';
import { ObtenerCantidadTrabajadoresPorProyectoUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-trabajadores-por-proyecto.use-case';
import { ObtenerCantidadJornadasCompletasSemanaUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-jornadas-completas-semana.use-case';
import { ObtenerTopTrabajadoresHorasMesUseCase } from '../../../application/use-cases/dashboard/obtener-top-trabajadores-horas-mes.use-case';
import { ObtenerCantidadTrabajadoresConectadoSemanaUseCase } from '../../../application/use-cases/dashboard/obtener-cantidad-trabajadores-conectado-semana.use-case';
import { ObtenerHorasEsperadasVsRegistradasMesUseCase } from '../../../application/use-cases/dashboard/obtener-horas-esperadas-vs-registradas-mes.use-case';

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
  ) {}

  @Get('cantidad-proyectos-vigentes')
  @HttpCode(HttpStatus.OK)
  async obtenerCantidadProyectosVigentes() {
    const data = await this.obtenerCantidadProyectosVigentesUseCase.execute();
    return ApiResponseDto.success(data, 'Cantidad de proyectos vigentes');
  }

  @Get('cantidad-trabajadores-activos')
  @HttpCode(HttpStatus.OK)
  async obtenerCantidadTrabajadoresActivos() {
    const data = await this.obtenerCantidadTrabajadoresActivosUseCase.execute();
    return ApiResponseDto.success(data, 'Cantidad de trabajadores activos');
  }

  @Get('cantidad-actividades-pendientes')
  @HttpCode(HttpStatus.OK)
  async obtenerCantidadActividadesPendientes() {
    const data =
      await this.obtenerCantidadActividadesPendientesUseCase.execute();
    return ApiResponseDto.success(data, 'Cantidad de actividades pendientes');
  }

  @Get('cantidad-actividades-observadas')
  @HttpCode(HttpStatus.OK)
  async obtenerCantidadActividadesObservadas() {
    const data =
      await this.obtenerCantidadActividadesObservadasUseCase.execute();
    return ApiResponseDto.success(data, 'Cantidad de actividades observadas');
  }

  @Get('cantidad-actividades-rechazadas')
  @HttpCode(HttpStatus.OK)
  async obtenerCantidadActividadesRechazadas() {
    const data =
      await this.obtenerCantidadActividadesRechazadasUseCase.execute();
    return ApiResponseDto.success(data, 'Cantidad de actividades rechazadas');
  }

  @Get('cantidad-trabajadores-por-proyecto')
  @HttpCode(HttpStatus.OK)
  async obtenerCantidadTrabajadoresPorProyecto() {
    const data =
      await this.obtenerCantidadTrabajadoresPorProyectoUseCase.execute();
    return ApiResponseDto.success(
      data,
      'Cantidad de trabajadores por proyecto',
    );
  }

  @Get('cantidad-jornadas-completas-semana')
  @HttpCode(HttpStatus.OK)
  async obtenerCantidadJornadasCompletasSemana() {
    const data =
      await this.obtenerCantidadJornadasCompletasSemanaUseCase.execute();
    return ApiResponseDto.success(
      data,
      'Cantidad de jornadas completas de la semana',
    );
  }

  @Get('top-trabajadores-horas-mes')
  @HttpCode(HttpStatus.OK)
  async obtenerTopTrabajadoresHorasMes() {
    const data = await this.obtenerTopTrabajadoresHorasMesUseCase.execute();
    return ApiResponseDto.success(data, 'Top trabajadores por horas del mes');
  }

  @Get('cantidad-trabajadores-conectado-semana')
  @HttpCode(HttpStatus.OK)
  async obtenerCantidadTrabajadoresConectadoSemana() {
    const data =
      await this.obtenerCantidadTrabajadoresConectadoSemanaUseCase.execute();
    return ApiResponseDto.success(
      data,
      'Cantidad de trabajadores conectados por semana',
    );
  }

  @Get('horas-esperadas-vs-registradas-mes')
  @HttpCode(HttpStatus.OK)
  async obtenerHorasEsperadasVsRegistradasMes() {
    const data =
      await this.obtenerHorasEsperadasVsRegistradasMesUseCase.execute();
    return ApiResponseDto.success(
      data,
      'Horas esperadas vs registradas del mes',
    );
  }
}
