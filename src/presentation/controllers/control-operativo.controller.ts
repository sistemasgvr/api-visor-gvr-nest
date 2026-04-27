import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  UnauthorizedException,
  ForbiddenException,
  Req,
  Header,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ListarJornadasTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-jornadas-trabajador.use-case';
import { ListarTrabajadoresParaFiltroUseCase } from '../../application/use-cases/control-operativo/listar-trabajadores-para-filtro.use-case';
import { CrearJornadaUseCase } from '../../application/use-cases/control-operativo/crear-jornada.use-case';
import { ListarActividadesUseCase } from '../../application/use-cases/control-operativo/listar-actividades.use-case';
import { CronCierreJornadasUseCase } from '../../application/use-cases/control-operativo/cron-cierre-jornadas.use-case';
import { CronAlertaActividadesSinValidarUseCase } from '../../application/use-cases/control-operativo/cron-alerta-actividades-sin-validar.use-case';
import { ActualizarEstadoJornadaUseCase } from '../../application/use-cases/control-operativo/actualizar-estado-jornada.use-case';
import { ListarProyectosAccesoTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-proyectos-acceso-trabajador.use-case';
import { ListarProyectosParaValidacionUseCase } from '../../application/use-cases/control-operativo/listar-proyectos-para-validacion.use-case';
import { ListarTrabajadoresSinJornadaHoyUseCase } from '../../application/use-cases/control-operativo/listar-trabajadores-sin-jornada-hoy.use-case';
import { ListarTrabajadoresSinActividadesHoyUseCase } from '../../application/use-cases/control-operativo/listar-trabajadores-sin-actividades-hoy.use-case';
import { CrearActividadUseCase } from '../../application/use-cases/control-operativo/crear-actividad.use-case';
import { AgregarEvidenciasActividadUseCase } from '../../application/use-cases/control-operativo/agregar-evidencias-actividad.use-case';
import { EliminarEvidenciaActividadUseCase } from '../../application/use-cases/control-operativo/eliminar-evidencia-actividad.use-case';
import { ObtenerActividadUseCase } from '../../application/use-cases/control-operativo/obtener-actividad.use-case';
import { ListarObservacionesActividadUseCase } from '../../application/use-cases/control-operativo/listar-observaciones-actividad.use-case';
import { ActualizarActividadUseCase } from '../../application/use-cases/control-operativo/actualizar-actividad.use-case';
import { EliminarActividadUseCase } from '../../application/use-cases/control-operativo/eliminar-actividad.use-case';
import { ListarActividadesValidacionUseCase } from '../../application/use-cases/control-operativo/listar-actividades-validacion.use-case';
import { ListarValorizacionUseCase } from '../../application/use-cases/control-operativo/listar-valorizacion.use-case';
import { ListarDesempenoUseCase } from '../../application/use-cases/control-operativo/listar-desempeno.use-case';
import { ListarTrabajadoresPorProyectoUseCase } from '../../application/use-cases/control-operativo/listar-trabajadores-por-proyecto.use-case';
import { ValidarActividadUseCase } from '../../application/use-cases/control-operativo/validar-actividad.use-case';
import { ListarReporteGeneralUseCase } from '../../application/use-cases/control-operativo/listar-reporte-general.use-case';
import { ListarLideresEquipoReporteGeneralUseCase } from '../../application/use-cases/control-operativo/listar-lideres-equipo-reporte-general.use-case';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { getFechaHoy } from '../../shared/utils/date.util';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { AgregarEvidenciasActividadDto } from '../../application/dtos/control-operativo/agregar-evidencias-actividad.dto';
import type { ActividadEvidenciaEntrada } from '../../domain/repositories/control-operativo.repository.interface';

@Controller('control-operativo')
export class ControlOperativoController {
  constructor(
    private readonly listarJornadasTrabajadorUseCase: ListarJornadasTrabajadorUseCase,
    private readonly listarTrabajadoresParaFiltroUseCase: ListarTrabajadoresParaFiltroUseCase,
    private readonly crearJornadaUseCase: CrearJornadaUseCase,
    private readonly listarActividadesUseCase: ListarActividadesUseCase,
    private readonly cronCierreJornadasUseCase: CronCierreJornadasUseCase,
    private readonly actualizarEstadoJornadaUseCase: ActualizarEstadoJornadaUseCase,
    private readonly listarProyectosAccesoTrabajadorUseCase: ListarProyectosAccesoTrabajadorUseCase,
    private readonly listarProyectosParaValidacionUseCase: ListarProyectosParaValidacionUseCase,
    private readonly listarTrabajadoresSinJornadaHoyUseCase: ListarTrabajadoresSinJornadaHoyUseCase,
    private readonly listarTrabajadoresSinActividadesHoyUseCase: ListarTrabajadoresSinActividadesHoyUseCase,
    private readonly crearActividadUseCase: CrearActividadUseCase,
    private readonly agregarEvidenciasActividadUseCase: AgregarEvidenciasActividadUseCase,
    private readonly eliminarEvidenciaActividadUseCase: EliminarEvidenciaActividadUseCase,
    private readonly obtenerActividadUseCase: ObtenerActividadUseCase,
    private readonly listarObservacionesActividadUseCase: ListarObservacionesActividadUseCase,
    private readonly actualizarActividadUseCase: ActualizarActividadUseCase,
    private readonly eliminarActividadUseCase: EliminarActividadUseCase,
    private readonly listarActividadesValidacionUseCase: ListarActividadesValidacionUseCase,
    private readonly listarValorizacionUseCase: ListarValorizacionUseCase,
    private readonly listarDesempenoUseCase: ListarDesempenoUseCase,
    private readonly listarTrabajadoresPorProyectoUseCase: ListarTrabajadoresPorProyectoUseCase,
    private readonly validarActividadUseCase: ValidarActividadUseCase,
    private readonly listarReporteGeneralUseCase: ListarReporteGeneralUseCase,
    private readonly listarLideresEquipoReporteGeneralUseCase: ListarLideresEquipoReporteGeneralUseCase,
    private readonly cronAlertaActividadesSinValidarUseCase: CronAlertaActividadesSinValidarUseCase,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Cron único de cierre de jornadas (al final del día).
   * GET /control-operativo/cron/cierre-jornadas?key=CRON_SECRET
   * GET /control-operativo/cron/cierre-jornadas?key=CRON_SECRET&fecha=YYYY-MM-DD  (opcional, para ejecutar manualmente una fecha)
   * Sin fecha usa hoy (hora Perú). Con fecha usas la indicada.
   * Crea Alertas para quien no abrió ese día; pone en Alerta las de ese día sin actividades;
   * jornadas pasados los días de tolerancia: con actividades → Cerrado, sin actividades → Incompleto.
   */
  @Get('cron/cierre-jornadas')
  async cronCierreJornadas(
    @Query('key') key?: string,
    @Query('fecha') fecha?: string,
  ) {
    const secret = this.configService.get<string>('CRON_SECRET');
    if (secret && key !== secret) {
      throw new UnauthorizedException('Cron no autorizado');
    }
    const f = fecha?.trim() || getFechaHoy();
    const result = await this.cronCierreJornadasUseCase.execute(f);
    return ApiResponseDto.success(
      {
        fecha: f,
        insertados_alerta: result.insertados_alerta,
        actualizados_alerta: result.actualizados_alerta,
        pasados_culminado: result.pasados_culminado,
        pasados_incompleto: result.pasados_incompleto,
      },
      'Cierre de jornadas ejecutado',
    );
  }

  /**
   * Cron de alerta por actividades sin validar (> 7 días "Por Aprobar").
   * GET /control-operativo/cron/alerta-actividades-sin-validar?key=CRON_SECRET
   * GET /control-operativo/cron/alerta-actividades-sin-validar?key=CRON_SECRET&fecha=YYYY-MM-DD
   * Detecta actividades con más de 7 días sin validar, notifica por WebSocket y persiste
   * notificaciones para Administradores (1), Gerencia (5) y Administrador GVR (11).
   */
  @Get('cron/alerta-actividades-sin-validar')
  @HttpCode(HttpStatus.OK)
  async cronAlertaActividadesSinValidar(
    @Query('key') key?: string,
    @Query('fecha') fecha?: string,
  ) {
    const secret = this.configService.get<string>('CRON_SECRET');
    if (secret && key !== secret) {
      throw new UnauthorizedException('Cron no autorizado');
    }
    const f = fecha?.trim() || getFechaHoy();
    const result = await this.cronAlertaActividadesSinValidarUseCase.execute(f);
    return ApiResponseDto.success(
      {
        fecha: f,
        total_actividades_vencidas: result.totalActividades,
        usuarios_notificados: result.usuariosANotificar.length,
      },
      result.totalActividades === 0
        ? 'Sin actividades vencidas pendientes de alerta'
        : `Alerta enviada: ${result.totalActividades} actividad(es) sin validar notificada(s)`,
    );
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
    const parsedLimit =
      limit != null && limit !== '' ? parseInt(limit, 10) : undefined;
    const parsedOffset =
      offset != null && offset !== '' ? parseInt(offset, 10) : undefined;
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
   * Listar trabajadores para el filtro de jornadas (admin: todos; no admin: jerarquía recursiva).
   * GET /control-operativo/trabajadores-para-filtro?idTrabajador=123
   */
  @Get('trabajadores-para-filtro')
  @UseGuards(JwtAuthGuard)
  async listarTrabajadoresParaFiltro(
    @Query('idTrabajador') idTrabajador?: string,
  ) {
    const id =
      idTrabajador != null && idTrabajador !== ''
        ? parseInt(idTrabajador, 10)
        : NaN;
    if (Number.isNaN(id) || id < 1) {
      return ApiResponseDto.success(
        [],
        'Trabajadores para filtro (sin id se devuelve vacío)',
      );
    }
    const data = await this.listarTrabajadoresParaFiltroUseCase.execute(id);
    return ApiResponseDto.success(
      data,
      'Trabajadores para filtro listados exitosamente',
    );
  }

  /**
   * Listar proyectos para filtros en actividades, valorización, desempeño y validación.
   * idTrabajador = tratrabajador.id (ID del trabajador), NO idUsuario (auth). Proyectos se filtran por proaccesoproyecto.idtrabajador.
   * Por rol: admins ven todos; coordinador BIM los que coordina; resto por acceso.
   * GET /control-operativo/proyectos-acceso-trabajador?idTrabajador=123&paraValidacion=1
   * paraValidacion=1 usa pro_ListarProyectosParaValidacion (alineado con actividades-validacion).
   */
  @Get('proyectos-acceso-trabajador')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @UseGuards(JwtAuthGuard)
  async listarProyectosAccesoTrabajador(
    @Query('idTrabajador') idTrabajador?: string,
    @Query('paraValidacion') paraValidacion?: string,
  ) {
    const id =
      idTrabajador != null && idTrabajador !== ''
        ? parseInt(idTrabajador, 10)
        : NaN;
    if (Number.isNaN(id) || id < 1) {
      return ApiResponseDto.success(
        [],
        'Proyectos acceso (idTrabajador = tratrabajador.id requerido)',
      );
    }
    const pv = paraValidacion === 'true' || paraValidacion === '1';
    const data = pv
      ? await this.listarProyectosParaValidacionUseCase.execute(id)
      : await this.listarProyectosAccesoTrabajadorUseCase.execute(id);
    return ApiResponseDto.success(
      Array.isArray(data) ? data : [],
      'Proyectos con acceso listados exitosamente',
    );
  }

  /**
   * Dashboard: trabajadores que tienen jornada abierta hoy pero no han registrado ninguna actividad.
   * Roles permitidos enviados por el front (rolesAdmin). GET .../trabajadores-sin-actividades-hoy?fecha=YYYY-MM-DD&rolesAdmin=1,5,11
   */
  @Get('trabajadores-sin-actividades-hoy')
  @UseGuards(JwtAuthGuard)
  async listarTrabajadoresSinActividadesHoy(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('fecha') fecha?: string,
    @Query('rolesAdmin') rolesAdmin?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const f = (fecha ?? '').trim() || getFechaHoy();
    const rolesAdminIds = this.parseRolesAdminQuery(rolesAdmin);
    const result =
      await this.listarTrabajadoresSinActividadesHoyUseCase.execute(
        Number(userId),
        f,
        rolesAdminIds,
      );
    return ApiResponseDto.success(
      result,
      'Trabajadores sin actividades hoy listados exitosamente',
    );
  }

  /**
   * Dashboard: trabajadores que no han registrado (abierto) jornada en la fecha (ej. hoy).
   * Roles permitidos enviados por el front (rolesAdmin). GET .../trabajadores-sin-jornada-hoy?fecha=YYYY-MM-DD&rolesAdmin=1,5,11
   */
  @Get('trabajadores-sin-jornada-hoy')
  @UseGuards(JwtAuthGuard)
  async listarTrabajadoresSinJornadaHoy(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('fecha') fecha?: string,
    @Query('rolesAdmin') rolesAdmin?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const f = (fecha ?? '').trim() || getFechaHoy();
    const rolesAdminIds = this.parseRolesAdminQuery(rolesAdmin);
    const result = await this.listarTrabajadoresSinJornadaHoyUseCase.execute(
      Number(userId),
      f,
      rolesAdminIds,
    );
    return ApiResponseDto.success(
      result,
      'Trabajadores sin jornada listados exitosamente',
    );
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
      return ApiResponseDto.badRequest(
        'idEstadoJornada es obligatorio y debe ser un número válido',
      );
    }
    const ok = await this.actualizarEstadoJornadaUseCase.execute({
      idJornada,
      idEstadoJornada: id,
    });
    if (!ok) {
      return ApiResponseDto.badRequest(
        'No se pudo actualizar el estado de la jornada',
      );
    }
    return ApiResponseDto.success(
      { idJornada, idEstadoJornada: id },
      'Estado de jornada actualizado',
    );
  }

  /**
   * Crear una actividad en una jornada.
   * POST /control-operativo/actividades
   * Body: idJornada, idProyecto, idTrabajador, idTipoActividad, nombreActividad, ...
   * idCoordinador se obtiene del proyecto (proProyecto.idcoordinador); opcional en body.
   */
  @Post('actividades')
  @UseGuards(JwtAuthGuard)
  async crearActividad(
    @Body('idJornada') idJornada: number,
    @Body('idProyecto') idProyecto: number,
    @Body('idTrabajador') idTrabajador: number,
    @Body('idTipoActividad') idTipoActividad: number,
    @Body('nombreActividad') nombreActividad: string,
    @Body('idCoordinador') idCoordinador?: number,
    @Body('descripcionDetallada') descripcionDetallada?: string,
    @Body('horaInicio') horaInicio?: string,
    @Body('horaFin') horaFin?: string,
    @Body('linkEvidencia') linkEvidencia?: string,
    @Body('idEstadoActividad') idEstadoActividad?: number,
    @Body('idModalidad') idModalidad?: number,
  ) {
    const data = await this.crearActividadUseCase.execute({
      idJornada: Number(idJornada),
      idProyecto: Number(idProyecto),
      idTrabajador: Number(idTrabajador),
      idCoordinador:
        idCoordinador != null && idCoordinador > 0
          ? Number(idCoordinador)
          : null,
      idTipoActividad: Number(idTipoActividad),
      nombreActividad: nombreActividad?.trim() ?? '',
      descripcionDetallada: descripcionDetallada?.trim() || null,
      horaInicio: horaInicio?.trim() || undefined,
      horaFin: horaFin?.trim() || undefined,
      linkEvidencia: linkEvidencia?.trim() || null,
      idEstadoActividad: idEstadoActividad ?? null,
      idModalidad: idModalidad ?? null,
    });
    if (!data) {
      return ApiResponseDto.badRequest('No se pudo crear la actividad');
    }
    return ApiResponseDto.created(data, 'Actividad creada exitosamente');
  }

  /**
   * Registrar URLs de evidencias (enlaces o URLs devueltas por storage) para una actividad del trabajador en sesión.
   * POST /control-operativo/actividades/:id/evidencias
   */
  @Post('actividades/:id/evidencias')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async agregarEvidenciasActividad(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AgregarEvidenciasActividadDto,
    @Req() req: Request & { user?: { id?: number; sub?: number } },
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const evidencias: ActividadEvidenciaEntrada[] = [];
    if (dto.evidencias?.length) {
      for (const e of dto.evidencias) {
        const url = (e?.url ?? '').trim();
        if (!url) continue;
        evidencias.push({
          url,
          nombreOriginal: e.nombreOriginal?.trim() || null,
          tipoMime: e.tipoMime?.trim() || null,
          tamanoBytes:
            e.tamanoBytes != null && Number.isFinite(e.tamanoBytes)
              ? e.tamanoBytes
              : null,
        });
      }
    } else {
      for (const u of dto.urls ?? []) {
        const t = (u != null ? String(u) : '').trim();
        if (t) evidencias.push({ url: t });
      }
    }
    const inserted = await this.agregarEvidenciasActividadUseCase.execute({
      idActividad: id,
      evidencias,
      idUsuario: Number(userId),
    });
    return ApiResponseDto.success({ inserted }, 'Evidencias registradas');
  }

  /**
   * Eliminar una evidencia de archivo (registro + objeto en MinIO si aplica). Solo el trabajador dueño.
   * DELETE /control-operativo/actividades/:id/evidencias/:idEvidencia
   */
  @Delete('actividades/:id/evidencias/:idEvidencia')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async eliminarEvidenciaActividad(
    @Param('id', ParseIntPipe) idActividad: number,
    @Param('idEvidencia', ParseIntPipe) idEvidencia: number,
    @Req() req: Request & { user?: { id?: number; sub?: number } },
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    await this.eliminarEvidenciaActividadUseCase.execute({
      idActividad,
      idEvidencia,
      idUsuario: Number(userId),
    });
    return ApiResponseDto.success(null, 'Evidencia eliminada');
  }

  /**
   * Listar actividades con filtros opcionales.
   * GET /control-operativo/actividades?idJornada=&idTrabajador=&idProyecto=&idEstadoActividad=&limit=10&offset=0
   */
  @Get('actividades')
  @UseGuards(JwtAuthGuard)
  async listarActividades(
    @Query('idJornada') idJornada?: string,
    @Query('idTrabajador') idTrabajador?: string,
    @Query('idProyecto') idProyecto?: string,
    @Query('idEstadoActividad') idEstadoActividad?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const params = {
      idJornada: idJornada ? parseInt(idJornada, 10) : undefined,
      idTrabajador: idTrabajador ? parseInt(idTrabajador, 10) : undefined,
      idProyecto: idProyecto ? parseInt(idProyecto, 10) : undefined,
      idEstadoActividad: idEstadoActividad
        ? parseInt(idEstadoActividad, 10)
        : undefined,
      limit: limit != null && limit !== '' ? parseInt(limit, 10) : undefined,
      offset:
        offset != null && offset !== '' ? parseInt(offset, 10) : undefined,
    };
    const result = await this.listarActividadesUseCase.execute(params);
    return ApiResponseDto.success(result, 'Actividades listadas exitosamente');
  }

  /**
   * Listar actividades para la pestaña Validación (jerarquía del usuario de sesión, excluyéndose).
   * GET /control-operativo/actividades-validacion?idTrabajador=&idProyecto=&idEstadoActividad=&limit=10&offset=0
   * Alcance total (todas las actividades): solo Administrador Sistemas y Administrador GVR (según JWT).
   */
  @Get('actividades-validacion')
  @UseGuards(JwtAuthGuard)
  async listarActividadesValidacion(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('idTrabajador') idTrabajador?: string,
    @Query('idProyecto') idProyecto?: string,
    @Query('idEstadoActividad') idEstadoActividad?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const result = await this.listarActividadesValidacionUseCase.execute({
      idUsuario: Number(userId),
      idTrabajadorFiltro:
        idTrabajador != null && idTrabajador !== ''
          ? parseInt(idTrabajador, 10)
          : undefined,
      idProyectoFiltro:
        idProyecto != null && idProyecto !== ''
          ? parseInt(idProyecto, 10)
          : undefined,
      idEstadoActividadFiltro:
        idEstadoActividad != null && idEstadoActividad !== ''
          ? parseInt(idEstadoActividad, 10)
          : undefined,
      limit: limit != null && limit !== '' ? parseInt(limit, 10) : undefined,
      offset:
        offset != null && offset !== '' ? parseInt(offset, 10) : undefined,
    });
    return ApiResponseDto.success(
      result,
      'Actividades de validación listadas exitosamente',
    );
  }

  /**
   * Valorización: actividades aprobadas por proyecto y rango de fechas, agrupadas por modelador y coordinador.
   * Solo roles enviados en rolesAdmin (front envía ROLES_ADMIN_CONTROL_OPERATIVO).
   * GET /control-operativo/valorizacion?idProyecto=1&fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD&rolesAdmin=1,5,11
   */
  @Get('valorizacion')
  @UseGuards(JwtAuthGuard)
  async listarValorizacion(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('idProyecto') idProyecto?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('rolesAdmin') rolesAdmin?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const idProy =
      idProyecto != null && idProyecto !== '' ? parseInt(idProyecto, 10) : NaN;
    if (Number.isNaN(idProy) || idProy < 1) {
      return ApiResponseDto.success(
        { grupos: [], totalGeneralHoras: 0 },
        'Valorización (proyecto y fechas requeridos)',
      );
    }
    const fInicio = (fechaInicio ?? '').trim() || undefined;
    const fFin = (fechaFin ?? '').trim() || undefined;
    if (!fInicio || !fFin) {
      return ApiResponseDto.success(
        { grupos: [], totalGeneralHoras: 0 },
        'Valorización (fechaInicio y fechaFin requeridos)',
      );
    }
    const rolesAdminIds = this.parseRolesAdminQuery(rolesAdmin);
    const result = await this.listarValorizacionUseCase.execute({
      idUsuario: Number(userId),
      idProyecto: idProy,
      fechaInicio: fInicio,
      fechaFin: fFin,
      rolesAdminPermitidos: rolesAdminIds,
    });
    return ApiResponseDto.success(result, 'Valorización listada exitosamente');
  }

  /**
   * Evaluación de desempeño: actividades rechazadas, observaciones, horas no justificadas, comentarios coordinador.
   * Solo roles enviados en rolesAdmin (front envía ROLES_ADMIN_CONTROL_OPERATIVO).
   * GET /control-operativo/desempeno?idProyecto=1&fechaInicio=...&fechaFin=...&idTrabajador=1&rolesAdmin=1,5,11
   */
  @Get('desempeno')
  @UseGuards(JwtAuthGuard)
  async listarDesempeno(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('idProyecto') idProyecto?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('idTrabajador') idTrabajador?: string,
    @Query('rolesAdmin') rolesAdmin?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const idProy =
      idProyecto != null && idProyecto !== '' ? parseInt(idProyecto, 10) : NaN;
    if (Number.isNaN(idProy) || idProy < 1) {
      return ApiResponseDto.success(
        {
          totalActividadesRechazadas: 0,
          totalObservaciones: 0,
          totalHorasNoJustificadas: 0,
          detalleActividadesRechazadas: [],
          detalleObservaciones: [],
        },
        'Evaluación de desempeño (proyecto y fechas requeridos)',
      );
    }
    const fInicio = (fechaInicio ?? '').trim() || undefined;
    const fFin = (fechaFin ?? '').trim() || undefined;
    if (!fInicio || !fFin) {
      return ApiResponseDto.success(
        {
          totalActividadesRechazadas: 0,
          totalObservaciones: 0,
          totalHorasNoJustificadas: 0,
          detalleActividadesRechazadas: [],
          detalleObservaciones: [],
        },
        'Evaluación de desempeño (fechaInicio y fechaFin requeridos)',
      );
    }
    const rolesAdminIds = this.parseRolesAdminQuery(rolesAdmin);
    const idTrab =
      idTrabajador != null && idTrabajador !== ''
        ? parseInt(idTrabajador, 10)
        : undefined;
    const result = await this.listarDesempenoUseCase.execute({
      idUsuario: Number(userId),
      idProyecto: idProy,
      fechaInicio: fInicio,
      fechaFin: fFin,
      rolesAdminPermitidos: rolesAdminIds,
      idTrabajador:
        idTrab !== undefined && !Number.isNaN(idTrab) && idTrab >= 1
          ? idTrab
          : undefined,
    });
    return ApiResponseDto.success(
      result,
      'Evaluación de desempeño listada exitosamente',
    );
  }

  /**
   * Lista trabajadores con al menos una actividad en el proyecto (para filtro Desempeño).
   * GET /control-operativo/trabajadores-por-proyecto?idProyecto=1&rolesAdmin=1,5,11
   */
  @Get('trabajadores-por-proyecto')
  @UseGuards(JwtAuthGuard)
  async listarTrabajadoresPorProyecto(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('idProyecto') idProyecto?: string,
    @Query('rolesAdmin') rolesAdmin?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const idProy =
      idProyecto != null && idProyecto !== '' ? parseInt(idProyecto, 10) : NaN;
    if (Number.isNaN(idProy) || idProy < 1) {
      return ApiResponseDto.success([], 'Proyecto requerido');
    }
    const rolesAdminIds = this.parseRolesAdminQuery(rolesAdmin);
    const result = await this.listarTrabajadoresPorProyectoUseCase.execute({
      idUsuario: Number(userId),
      idProyecto: idProy,
      rolesAdminPermitidos: rolesAdminIds,
    });
    return ApiResponseDto.success(
      result,
      'Trabajadores del proyecto listados exitosamente',
    );
  }

  /**
   * Coordinadores / responsables con personal a cargo (filtro reporte general).
   * GET /control-operativo/reporte-general/lideres-equipo?rolesAdmin=...
   */
  @Get('reporte-general/lideres-equipo')
  @UseGuards(JwtAuthGuard)
  async listarLideresEquipoReporteGeneral(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('rolesAdmin') rolesAdmin?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const rolesAdminIds = this.parseRolesAdminQuery(rolesAdmin);
    const data = await this.listarLideresEquipoReporteGeneralUseCase.execute({
      idUsuario: Number(userId),
      rolesAdminPermitidos: rolesAdminIds,
    });
    return ApiResponseDto.success(data, 'Líderes listados exitosamente');
  }

  /**
   * Reporte general de actividades con filtros opcionales.
   * Solo roles enviados en rolesAdmin (front envía ROLES_ADMIN_CONTROL_OPERATIVO).
   * GET /control-operativo/reporte-general?...&idTrabajadores=1,2&idProyectos=3&idEstadosActividad=374,375&idLiderEquipo=5&...
   */
  @Get('reporte-general')
  @UseGuards(JwtAuthGuard)
  async listarReporteGeneral(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('idTrabajadores') idTrabajadores?: string,
    @Query('idProyectos') idProyectos?: string,
    @Query('idEstadosActividad') idEstadosActividad?: string,
    @Query('idLiderEquipo') idLiderEquipo?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('rolesAdmin') rolesAdmin?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const fInicio = (fechaInicio ?? '').trim() || null;
    const fFin = (fechaFin ?? '').trim() || null;
    const rolesAdminIds = this.parseRolesAdminQuery(rolesAdmin);
    const limitNum = limit && limit !== '' ? parseInt(limit, 10) : 50;
    const offsetNum = offset && offset !== '' ? parseInt(offset, 10) : 0;
    const idLiderParsed =
      idLiderEquipo != null && idLiderEquipo.trim() !== ''
        ? parseInt(idLiderEquipo.trim(), 10)
        : NaN;
    const idLiderEquipoVal =
      !Number.isNaN(idLiderParsed) && idLiderParsed >= 1 ? idLiderParsed : null;
    const result = await this.listarReporteGeneralUseCase.execute({
      idUsuario: Number(userId),
      idTrabajadores: this.parseIdsListQuery(idTrabajadores),
      idProyectos: this.parseIdsListQuery(idProyectos),
      idEstadosActividad: this.parseIdsListQuery(idEstadosActividad),
      fechaInicio: fInicio,
      fechaFin: fFin,
      idLiderEquipo: idLiderEquipoVal,
      limit: !Number.isNaN(limitNum) && limitNum >= 0 ? limitNum : 50,
      offset: !Number.isNaN(offsetNum) && offsetNum >= 0 ? offsetNum : 0,
      rolesAdminPermitidos: rolesAdminIds,
    });
    return ApiResponseDto.success(
      result,
      'Reporte general listado exitosamente',
    );
  }

  /** Lista de IDs separados por coma (ej. "1,5,11"). Vacío o inválido => null (sin filtro). */
  private parseIdsListQuery(param?: string): number[] | null {
    if (param == null || param.trim() === '') {
      return null;
    }
    const ids = param
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n >= 1);
    return ids.length > 0 ? ids : null;
  }

  /** Parsea query rolesAdmin (ej. "1,5,11") a número[]. Si viene vacío, devuelve [1, 5, 11] por compatibilidad. */
  private parseRolesAdminQuery(rolesAdmin?: string): number[] {
    if (rolesAdmin == null || (rolesAdmin = rolesAdmin.trim()) === '') {
      return [1, 5, 11];
    }
    const ids = rolesAdmin
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n >= 1);
    return ids.length > 0 ? ids : [1, 5, 11];
  }

  /**
   * Listar observaciones del coordinador sobre una actividad (para "Corregir").
   * GET /control-operativo/actividades/:id/observaciones
   */
  @Get('actividades/:id/observaciones')
  @UseGuards(JwtAuthGuard)
  async listarObservacionesActividad(@Param('id', ParseIntPipe) id: number) {
    const data = await this.listarObservacionesActividadUseCase.execute(id);
    return ApiResponseDto.success(data, 'Observaciones listadas exitosamente');
  }

  /**
   * Obtener una actividad por ID con toda la información relacionada (para "Ver").
   * GET /control-operativo/actividades/:id?contextoValidacion=1
   * Con contextoValidacion=1 solo responde si el usuario puede validar esa actividad.
   */
  @Get('actividades/:id')
  @UseGuards(JwtAuthGuard)
  async obtenerActividad(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Param('id', ParseIntPipe) id: number,
    @Query('contextoValidacion') contextoValidacion?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    const ctxVal = contextoValidacion === 'true' || contextoValidacion === '1';
    if (ctxVal && userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const data = await this.obtenerActividadUseCase.execute(
      ctxVal
        ? {
            idActividad: id,
            contextoValidacion: true,
            idUsuario: Number(userId),
          }
        : id,
    );
    if (!data) {
      if (ctxVal) {
        throw new ForbiddenException(
          'No tiene permiso para ver esta actividad en validación',
        );
      }
      return ApiResponseDto.notFound('Actividad no encontrada');
    }
    return ApiResponseDto.success(data, 'Actividad obtenida exitosamente');
  }

  /**
   * Validar una actividad (Aprobar / Observar / Rechazar). Comentario obligatorio para Observar y Rechazar.
   * PATCH /control-operativo/actividades/:id/validar
   * Body: { "idEstadoActividad": number, "comentarioValidacion"?: string }
   */
  @Patch('actividades/:id/validar')
  @UseGuards(JwtAuthGuard)
  async validarActividad(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body('idEstadoActividad') idEstadoActividad: number,
    @Body('comentarioValidacion') comentarioValidacion?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const idEstado =
      idEstadoActividad != null ? Number(idEstadoActividad) : NaN;
    if (Number.isNaN(idEstado) || idEstado < 1) {
      return ApiResponseDto.badRequest(
        'idEstadoActividad es obligatorio y debe ser un número válido',
      );
    }
    const data = await this.validarActividadUseCase.execute({
      idActividad: id,
      idEstadoActividad: idEstado,
      comentarioValidacion: comentarioValidacion?.trim() || null,
      idUsuario: Number(userId),
    });
    if (!data) {
      return ApiResponseDto.badRequest('No se pudo validar la actividad');
    }
    return ApiResponseDto.success(data, 'Actividad validada exitosamente');
  }

  /**
   * Actualizar una actividad.
   * PATCH /control-operativo/actividades/:id
   */
  @Patch('actividades/:id')
  @UseGuards(JwtAuthGuard)
  async actualizarActividad(
    @Param('id', ParseIntPipe) id: number,
    @Body('idProyecto') idProyecto: number,
    @Body('idTrabajador') idTrabajador: number,
    @Body('idCoordinador') idCoordinador: number,
    @Body('idTipoActividad') idTipoActividad: number,
    @Body('nombreActividad') nombreActividad: string,
    @Body('descripcionDetallada') descripcionDetallada?: string,
    @Body('horaInicio') horaInicio?: string,
    @Body('horaFin') horaFin?: string,
    @Body('linkEvidencia') linkEvidencia?: string,
    @Body('idModalidad') idModalidad?: number,
    @Body('corregirObservacion') corregirObservacion?: boolean,
  ) {
    const data = await this.actualizarActividadUseCase.execute({
      idActividad: id,
      idProyecto: Number(idProyecto),
      idTrabajador: Number(idTrabajador),
      idCoordinador: Number(idCoordinador),
      idTipoActividad: Number(idTipoActividad),
      nombreActividad: nombreActividad?.trim() ?? '',
      descripcionDetallada: descripcionDetallada?.trim() || null,
      horaInicio: horaInicio?.trim() || undefined,
      horaFin: horaFin?.trim() || undefined,
      linkEvidencia: linkEvidencia?.trim() || null,
      idModalidad: idModalidad ?? null,
      corregirObservacion: corregirObservacion === true,
    });
    if (!data) {
      return ApiResponseDto.badRequest('No se pudo actualizar la actividad');
    }
    return ApiResponseDto.success(data, 'Actividad actualizada exitosamente');
  }

  /**
   * Eliminar una actividad (solo si está en estado "Por aprobar").
   * DELETE /control-operativo/actividades/:id
   */
  @Delete('actividades/:id')
  @UseGuards(JwtAuthGuard)
  async eliminarActividad(@Param('id', ParseIntPipe) id: number) {
    try {
      const ok = await this.eliminarActividadUseCase.execute(id);
      if (!ok) {
        return ApiResponseDto.badRequest(
          'No se puede eliminar la actividad. Solo se pueden eliminar actividades en estado "Por aprobar".',
        );
      }
      return ApiResponseDto.success({ id }, 'Actividad eliminada exitosamente');
    } catch (error: any) {
      const message = error?.message ?? 'No se pudo eliminar la actividad';
      return ApiResponseDto.badRequest(message);
    }
  }
}
