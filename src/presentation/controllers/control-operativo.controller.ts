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
  BadRequestException,
  ForbiddenException,
  Req,
  Header,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Request } from 'express';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  ContextualAuthorization,
  RequireGranularPermission,
  RequireResourcePermission,
  RequireScopedPermission,
  RequireWorkerPermission,
} from '../../infrastructure/auth/granular-permission.guard';
import {
  CONTROL_ACTIVITY_RESOURCE,
  CONTROL_JORNADA_RESOURCE,
} from '../../infrastructure/auth/control-worker-policies';
import { ControlOperativoAccess } from '../../infrastructure/auth/control-operativo-access.service';
import { ActorId, GrantedScope } from '../http/granted-scopes.decorator';
import type { AuthorizationScope } from '../../application/ports/authorization.port';
import {
  ID_ESTADO_ACTIVIDAD_APROBADO,
  ID_ESTADO_ACTIVIDAD_OBSERVADO,
  ID_ESTADO_ACTIVIDAD_RECHAZADO,
} from '../../domain/constants/estado-actividad.constants';
import { ListarJornadasTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-jornadas-trabajador.use-case';
import { ListarTrabajadoresParaFiltroUseCase } from '../../application/use-cases/control-operativo/listar-trabajadores-para-filtro.use-case';
import { CrearJornadaUseCase } from '../../application/use-cases/control-operativo/crear-jornada.use-case';
import { ListarActividadesUseCase } from '../../application/use-cases/control-operativo/listar-actividades.use-case';
import { CronCierreJornadasUseCase } from '../../application/use-cases/control-operativo/cron-cierre-jornadas.use-case';
import { CronAlertaActividadesSinValidarUseCase } from '../../application/use-cases/control-operativo/cron-alerta-actividades-sin-validar.use-case';
import { ActualizarEstadoJornadaUseCase } from '../../application/use-cases/control-operativo/actualizar-estado-jornada.use-case';
import { HabilitarJornadasUsuariosUseCase } from '../../application/use-cases/control-operativo/habilitar-jornadas-usuarios.use-case';
import { CerrarHabilitacionesVencidasUseCase } from '../../application/use-cases/control-operativo/cerrar-habilitaciones-vencidas.use-case';
import { HabilitarJornadasUsuariosDto } from '../dtos/control-operativo/habilitar-jornadas-usuarios.dto';
import { ActualizarEstadoJornadaDto } from '../dtos/control-operativo/actualizar-estado-jornada.dto';
import { ListarProyectosAccesoTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-proyectos-acceso-trabajador.use-case';
import { ListarCoordinadoresProyectoUseCase } from '../../application/use-cases/proyecto/listar-coordinadores-proyecto.use-case';
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
import { ListarActividadesObservadasSubsanarUseCase } from '../../application/use-cases/control-operativo/listar-actividades-observadas-subsanar.use-case';
import { ListarValorizacionUseCase } from '../../application/use-cases/control-operativo/listar-valorizacion.use-case';
import { ListarDesempenoUseCase } from '../../application/use-cases/control-operativo/listar-desempeno.use-case';
import { ListarTrabajadoresPorProyectoUseCase } from '../../application/use-cases/control-operativo/listar-trabajadores-por-proyecto.use-case';
import { ValidarActividadUseCase } from '../../application/use-cases/control-operativo/validar-actividad.use-case';
import { ListarReporteGeneralUseCase } from '../../application/use-cases/control-operativo/listar-reporte-general.use-case';
import { ListarLideresEquipoReporteGeneralUseCase } from '../../application/use-cases/control-operativo/listar-lideres-equipo-reporte-general.use-case';
import { ListarReporteHorasMesProyectoTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-reporte-horas-mes-proyecto-trabajador.use-case';
import { ListarReporteHorasRangoDetalleProyectoUseCase } from '../../application/use-cases/control-operativo/listar-reporte-horas-rango-detalle-proyecto.use-case';
import { ExportarActividadesJornadasWordUseCase } from '../../application/use-cases/control-operativo/exportar-actividades-jornadas-word.use-case';
import { ExportarActividadesJornadasWordMasivoUseCase } from '../../application/use-cases/control-operativo/exportar-actividades-jornadas-word-masivo.use-case';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import { getFechaHoy } from '../../domain/utils/date.util';
import type { AuthenticatedUser } from '../../domain/types/authenticated-user';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { AgregarEvidenciasActividadDto } from '../dtos/control-operativo/agregar-evidencias-actividad.dto';
import { ExportarActividadesWordMasivoDto } from '../dtos/control-operativo/exportar-actividades-word-masivo.dto';
import type { ActividadEvidenciaEntrada } from '../../domain/repositories/control-operativo.repository.interface';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

const CRON = 'Cron con CRON_SECRET';
/** Proyectos de los filtros de cada pestaña: «todos» en alguna de ellas muestra todos los proyectos. */
const PERMISOS_PESTANAS = [
  'control_operativo.jornadas.ver',
  'control_operativo.valorizacion.ver',
  'control_operativo.desempeno.ver',
  'control_operativo.reportes.ver_general',
  'control_operativo.reportes.ver_horas_mes',
  'control_operativo.entregables.ver',
];
const LECTURA_ACTIVIDAD = [
  'control_operativo.actividades.ver',
  'control_operativo.actividades.subsanar',
  'control_operativo.validacion.ver',
];
/** Acción de validación según el estado elegido. */
const PERMISO_VALIDACION: Record<number, string> = {
  [ID_ESTADO_ACTIVIDAD_APROBADO]: 'control_operativo.validacion.aprobar',
  [ID_ESTADO_ACTIVIDAD_OBSERVADO]: 'control_operativo.validacion.observar',
  [ID_ESTADO_ACTIVIDAD_RECHAZADO]: 'control_operativo.validacion.rechazar',
};

@ApiTags('control-operativo')
@Controller('control-operativo')
export class ControlOperativoController {
  constructor(
    private readonly listarJornadasTrabajadorUseCase: ListarJornadasTrabajadorUseCase,
    private readonly listarTrabajadoresParaFiltroUseCase: ListarTrabajadoresParaFiltroUseCase,
    private readonly crearJornadaUseCase: CrearJornadaUseCase,
    private readonly listarActividadesUseCase: ListarActividadesUseCase,
    private readonly cronCierreJornadasUseCase: CronCierreJornadasUseCase,
    private readonly actualizarEstadoJornadaUseCase: ActualizarEstadoJornadaUseCase,
    private readonly habilitarJornadasUsuariosUseCase: HabilitarJornadasUsuariosUseCase,
    private readonly cerrarHabilitacionesVencidasUseCase: CerrarHabilitacionesVencidasUseCase,
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
    private readonly listarActividadesObservadasSubsanarUseCase: ListarActividadesObservadasSubsanarUseCase,
    private readonly listarValorizacionUseCase: ListarValorizacionUseCase,
    private readonly listarDesempenoUseCase: ListarDesempenoUseCase,
    private readonly listarTrabajadoresPorProyectoUseCase: ListarTrabajadoresPorProyectoUseCase,
    private readonly validarActividadUseCase: ValidarActividadUseCase,
    private readonly listarReporteGeneralUseCase: ListarReporteGeneralUseCase,
    private readonly listarLideresEquipoReporteGeneralUseCase: ListarLideresEquipoReporteGeneralUseCase,
    private readonly listarReporteHorasMesProyectoTrabajadorUseCase: ListarReporteHorasMesProyectoTrabajadorUseCase,
    private readonly listarReporteHorasRangoDetalleProyectoUseCase: ListarReporteHorasRangoDetalleProyectoUseCase,
    private readonly cronAlertaActividadesSinValidarUseCase: CronAlertaActividadesSinValidarUseCase,
    private readonly exportarActividadesJornadasWordUseCase: ExportarActividadesJornadasWordUseCase,
    private readonly exportarActividadesJornadasWordMasivoUseCase: ExportarActividadesJornadasWordMasivoUseCase,
    private readonly configService: ConfigService,
    private readonly access: ControlOperativoAccess,
    private readonly listarCoordinadoresProyectoUseCase: ListarCoordinadoresProyectoUseCase,
  ) {}

  @ApiOperation({ summary: 'Coordinadores disponibles para registrar o editar actividades' })
  @Get('proyectos/:id/coordinadores')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission(
    'control_operativo.actividades.crear',
    'control_operativo.actividades.editar',
  )
  async listarCoordinadoresActividad(
    @ActorId() actor: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    let permitido = false;
    for (const code of [
      'control_operativo.actividades.crear',
      'control_operativo.actividades.editar',
    ]) {
      const proyectos = await this.access.proyectosPermitidos(actor, code);
      if (proyectos === null || proyectos.includes(id)) {
        permitido = true;
        break;
      }
    }
    if (!permitido) throw ControlOperativoAccess.denied();
    const coordinadores = await this.listarCoordinadoresProyectoUseCase.execute(id);
    return ApiResponseDto.success(
      coordinadores.map(({ idtrabajador, nombrecoordinador }) => ({
        idtrabajador,
        nombrecoordinador,
      })),
      'Coordinadores del proyecto',
    );
  }

  /**
   * Cron único de cierre de jornadas (al final del día).
   * GET /control-operativo/cron/cierre-jornadas?key=CRON_SECRET
   * GET /control-operativo/cron/cierre-jornadas?key=CRON_SECRET&fecha=YYYY-MM-DD  (opcional, para ejecutar manualmente una fecha)
   * Sin fecha usa hoy (hora Perú). Con fecha usas la indicada.
   * Inserta jornadas Abierta del día; Alerta solo en días anteriores sin actividades;
   * el día p_fecha en Alerta pasa a Abierta; jornadas tras tolerancia → Culminado / Incompleto.
   */
  @ApiOperation({
    summary: 'Cron: cierre de jornadas al final del día',
    description:
      'Requiere query `key=CRON_SECRET` si está configurado. Opcional `fecha=YYYY-MM-DD`. Marca jornadas, alertas e incompletos según reglas de negocio.',
    security: [],
  })
  @Get('cron/cierre-jornadas')
  @ContextualAuthorization(CRON)
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
        insertados_abierta: result.insertados_abierta,
        actualizados_alerta: result.actualizados_alerta,
        pasados_culminado: result.pasados_culminado,
        pasados_incompleto: result.pasados_incompleto,
      },
      'Cierre de jornadas ejecutado',
    );
  }

  @ApiOperation({
    summary: 'Cron: cerrar habilitaciones temporales vencidas',
    description:
      'Requiere CRON_SECRET configurado y query key. Se puede invocar cada minuto.',
    security: [],
  })
  @Get('cron/cierre-habilitaciones-vencidas')
  @ContextualAuthorization(CRON)
  async cronCierreHabilitacionesVencidas(@Query('key') key?: string) {
    const secret = this.configService.get<string>('CRON_SECRET');
    if (!secret || key !== secret) {
      throw new UnauthorizedException('Cron no autorizado');
    }
    const result = await this.cerrarHabilitacionesVencidasUseCase.execute();
    return ApiResponseDto.success(
      result,
      'Cierre de habilitaciones vencidas ejecutado',
    );
  }

  /**
   * Cron de alerta por actividades sin validar (> 7 días "Por Aprobar").
   * GET /control-operativo/cron/alerta-actividades-sin-validar?key=CRON_SECRET
   * GET /control-operativo/cron/alerta-actividades-sin-validar?key=CRON_SECRET&fecha=YYYY-MM-DD
   * Detecta actividades con más de 7 días sin validar, notifica por WebSocket y persiste
   * notificaciones para Administradores (1), Gerencia (5) y Administrador GVR (11).
   */
  @ApiOperation({
    summary: 'Cron: alerta actividades sin validar (>7 días en Por aprobar)',
    description:
      'Requiere `key=CRON_SECRET`. Notifica a quienes validan con alcance «todos».',
    security: [],
  })
  @Get('cron/alerta-actividades-sin-validar')
  @HttpCode(HttpStatus.OK)
  @ContextualAuthorization(CRON)
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
  @ApiOperation({
    summary: 'Listar jornadas de un trabajador',
    description: 'Rango de fechas opcional (por defecto semana actual).',
  })
  @Get('trabajadores/:idTrabajador/jornadas')
  @RequireWorkerPermission('control_operativo.jornadas.ver')
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
   * Exportar reporte de actividades como Word (.docx).
   * GET /control-operativo/trabajadores/:idTrabajador/actividades/export-word?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD&fechaEmision=YYYY-MM-DD
   * Respuesta binaria (no JSON). Por ahora incluye la primera página del informe de servicio.
   */
  @ApiOperation({
    summary: 'Exportar reporte de actividades (Word)',
    description:
      'Descarga un .docx del reporte de actividades (portada + detalle). Las horas dedicadas solo se incluyen con `control_operativo.jornadas.exportar_word` en alcance «todos».',
  })
  @Get('trabajadores/:idTrabajador/actividades/export-word')
  @RequireScopedPermission('control_operativo.jornadas.exportar_word')
  @UseGuards(JwtAuthGuard)
  async exportarActividadesJornadasWord(
    @Res() res: Response,
    @ActorId() actor: number,
    @Param('idTrabajador', ParseIntPipe) idTrabajador: number,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('fechaEmision') fechaEmision?: string,
  ): Promise<void> {
    // El trabajador debe estar en el alcance de la persona que exporta.
    const codigo = 'control_operativo.jornadas.exportar_word';
    if (!(await this.access.trabajadorPermitido(actor, codigo, idTrabajador)))
      throw ControlOperativoAccess.denied();
    const incluirHorasDedicadasEnWord = (
      await this.access.scopes(actor, codigo)
    ).includes('todos');
    const { buffer, fileName } =
      await this.exportarActividadesJornadasWordUseCase.execute({
        idTrabajador,
        fechaInicio,
        fechaFin,
        fechaEmision,
        incluirHorasDedicadasEnWord,
      });
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName.replace(/"/g, '')}"`,
    );
    res.send(buffer);
  }

  /**
   * Exportación masiva: ZIP con un .docx por colaborador (mismo contenido que export-word).
   * POST /control-operativo/actividades/export-word-masivo
   * Body: { fechaInicio, fechaFin, fechaEmision?, idsTrabajador: number[] }
   * Requiere `control_operativo.reportes.exportar_word_masivo` («asignados»: sólo su equipo).
   * Si fallan algunos, el ZIP incluye `exportacion_errores.txt` y los .docx generados correctamente.
   */
  @ApiOperation({
    summary: 'Exportar actividades Word masivo (ZIP)',
    description:
      'ZIP con un informe por id de colaborador, según el alcance del permiso. Máx. 80 ids por solicitud.',
  })
  @Post('actividades/export-word-masivo')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission('control_operativo.reportes.exportar_word_masivo')
  async exportarActividadesJornadasWordMasivo(
    @Res() res: Response,
    @ActorId() actor: number,
    @GrantedScope('control_operativo.reportes.exportar_word_masivo')
    alcance: AuthorizationScope,
    @Body() body: ExportarActividadesWordMasivoDto,
  ): Promise<void> {
    // «asignados»: sólo colaboradores de su equipo.
    const permitidos = await this.access.trabajadoresPermitidos(
      actor,
      'control_operativo.reportes.exportar_word_masivo',
    );
    if (
      permitidos !== null &&
      (body.idsTrabajador ?? []).some((id) => !permitidos.includes(Number(id)))
    ) {
      throw new ForbiddenException(
        'Solo puede exportar informes de colaboradores de su equipo.',
      );
    }
    const incluirHorasDedicadasEnWord = alcance === 'todos';
    const { buffer, fileName } =
      await this.exportarActividadesJornadasWordMasivoUseCase.execute({
        idsTrabajador: body.idsTrabajador,
        fechaInicio: body.fechaInicio,
        fechaFin: body.fechaFin,
        fechaEmision: body.fechaEmision,
        incluirHorasDedicadasEnWord,
      });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName.replace(/"/g, '')}"`,
    );
    res.send(buffer);
  }

  /**
   * Listar trabajadores para el filtro de jornadas (admin: todos; no admin: jerarquía recursiva).
   * GET /control-operativo/trabajadores-para-filtro?idTrabajador=123
   */
  @ApiOperation({
    summary: 'Trabajadores para filtro de jornadas',
    description:
      'Según el alcance de jornadas.ver: todos, su equipo o él mismo. Requiere idTrabajador en query.',
  })
  @Get('trabajadores-para-filtro')
  @RequireScopedPermission('control_operativo.jornadas.ver')
  @UseGuards(JwtAuthGuard)
  async listarTrabajadoresParaFiltro(
    @Req() req: Request & { user: { sub: number } },
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
    const data = await this.listarTrabajadoresParaFiltroUseCase.execute(
      req.user.sub,
      await this.access.scopes(req.user.sub, 'control_operativo.jornadas.ver'),
    );
    return ApiResponseDto.success(
      data,
      'Trabajadores para filtro listados exitosamente',
    );
  }

  /**
   * Listar proyectos para filtros en actividades, valorización, desempeño y validación.
   * idTrabajador = tratrabajador.id (ID del trabajador), NO idUsuario (auth). Proyectos se filtran por proaccesoproyecto.idtrabajador.
   * «todos» en el permiso de la pestaña: todos los proyectos; si no, los que coordina, con acceso o de su equipo.
   * GET /control-operativo/proyectos-acceso-trabajador?idTrabajador=123&paraValidacion=1&soloVigentes=1
   * paraValidacion=1 usa pro_ListarProyectosParaValidacion (alineado con actividades-validacion).
   * soloVigentes=1 limita a proyectos en estado Vigente (registro de actividades).
   */
  @ApiOperation({
    summary: 'Proyectos a los que tiene acceso un trabajador',
    description:
      'idTrabajador es tratrabajador.id. `paraValidacion=1` usa el mismo alcance que la pestaña Validación. `soloVigentes=1` solo proyectos Vigentes.',
  })
  @Get('proyectos-acceso-trabajador')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission(
    ...PERMISOS_PESTANAS,
    'control_operativo.validacion.ver',
    'control_operativo.actividades.crear',
    'control_operativo.entregables.crear',
  )
  async listarProyectosAccesoTrabajador(
    @ActorId() actor: number,
    @Query('idTrabajador') idTrabajador?: string,
    @Query('paraValidacion') paraValidacion?: string,
    @Query('soloVigentes') soloVigentes?: string,
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
    const sv = soloVigentes === 'true' || soloVigentes === '1';
    // «todos» según la pestaña: validación, registro de actividades (crear jornadas) o el resto.
    const tieneTodos = async (codigos: string[]) => {
      for (const codigo of codigos)
        if ((await this.access.scopes(actor, codigo)).includes('todos'))
          return true;
      return false;
    };
    const data = pv
      ? await this.listarProyectosParaValidacionUseCase.execute(
          id,
          await tieneTodos(['control_operativo.validacion.ver']),
        )
      : await this.listarProyectosAccesoTrabajadorUseCase.execute(
          id,
          sv,
          await tieneTodos(
            sv ? ['control_operativo.jornadas.crear'] : PERMISOS_PESTANAS,
          ),
        );
    return ApiResponseDto.success(
      Array.isArray(data) ? data : [],
      'Proyectos con acceso listados exitosamente',
    );
  }

  /**
   * Dashboard: trabajadores que tienen jornada abierta hoy pero no han registrado ninguna actividad.
   * Requiere `inicio.indicadores.ver_sin_actividades`. GET .../trabajadores-sin-actividades-hoy?fecha=YYYY-MM-DD
   */
  @ApiOperation({
    summary: 'Dashboard: trabajadores con jornada abierta sin actividades',
    description: 'Filtra por fecha y roles administrativos permitidos.',
  })
  @Get('trabajadores-sin-actividades-hoy')
  @UseGuards(JwtAuthGuard)
  @RequireGranularPermission('inicio.indicadores.ver_sin_actividades')
  async listarTrabajadoresSinActividadesHoy(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('fecha') fecha?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const f = (fecha ?? '').trim() || getFechaHoy();
    const result =
      await this.listarTrabajadoresSinActividadesHoyUseCase.execute(
        Number(userId),
        f,
      );
    return ApiResponseDto.success(
      result,
      'Trabajadores sin actividades hoy listados exitosamente',
    );
  }

  /**
   * Dashboard: trabajadores que no han registrado (abierto) jornada en la fecha (ej. hoy).
   * Requiere `inicio.indicadores.ver_sin_jornada`. GET .../trabajadores-sin-jornada-hoy?fecha=YYYY-MM-DD
   */
  @ApiOperation({
    summary: 'Dashboard: trabajadores sin jornada registrada en la fecha',
    description: 'Filtra por fecha y roles administrativos permitidos.',
  })
  @Get('trabajadores-sin-jornada-hoy')
  @UseGuards(JwtAuthGuard)
  @RequireGranularPermission('inicio.indicadores.ver_sin_jornada')
  async listarTrabajadoresSinJornadaHoy(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('fecha') fecha?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const f = (fecha ?? '').trim() || getFechaHoy();
    const result = await this.listarTrabajadoresSinJornadaHoyUseCase.execute(
      Number(userId),
      f,
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
  @ApiOperation({
    summary: 'Crear o reutilizar jornada del trabajador para una fecha',
    description:
      'Si ya existe jornada ese día, la devuelve sin duplicar. Body incluye fechaJornada y opcionales de contrato.',
  })
  @Post('trabajadores/:idTrabajador/jornadas')
  @RequireWorkerPermission('control_operativo.jornadas.crear')
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
   * Body: { "idEstadoJornada": number, "duracionMinutos"?: number }
   * La duración es obligatoria al abrir; el actor procede de la sesión.
   */
  @ApiOperation({
    summary: 'Cambiar estado de una jornada',
    description: 'Uso administrativo o con permiso (ej. Incompleto → Abierta).',
  })
  @Patch('jornadas/:idJornada/estado')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission('control_operativo.jornadas.cambiar_estado')
  async actualizarEstadoJornada(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Param('idJornada', ParseIntPipe) idJornada: number,
    @Body() body: ActualizarEstadoJornadaDto,
    @ActorId() idUsuario: number,
  ) {
    const idTrabajador = await this.access.trabajadorDeJornada(idJornada);
    if (idTrabajador == null)
      throw new BadRequestException('No existe la jornada o está inactiva');
    await this.access.exigirTrabajador(
      idUsuario,
      'control_operativo.jornadas.cambiar_estado',
      idTrabajador,
    );
    const id = body.idEstadoJornada;
    const ok = await this.actualizarEstadoJornadaUseCase.execute({
      idJornada,
      idEstadoJornada: id,
      idUsuarioModificacion: idUsuario,
      duracionMinutos: body.duracionMinutos,
    });
    if (!ok) {
      throw new BadRequestException(
        'No se pudo actualizar el estado de la jornada',
      );
    }
    return ApiResponseDto.success(
      { idJornada, idEstadoJornada: id },
      'Estado de jornada actualizado',
    );
  }

  @ApiOperation({
    summary: 'Habilitar jornadas de usuarios por rango y duración',
    description:
      'Solo administradores y gerencia. idTrabajadores son IDs de tratrabajador; duración en minutos desde la llamada.',
  })
  @Post('jornadas/habilitar-usuarios')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @RequireScopedPermission('control_operativo.jornadas.cambiar_estado')
  async habilitarJornadasUsuarios(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Body() body: HabilitarJornadasUsuariosDto,
    @ActorId() idUsuario: number,
  ) {
    for (const idTrabajador of body.idTrabajadores ?? [])
      await this.access.exigirTrabajador(
        idUsuario,
        'control_operativo.jornadas.cambiar_estado',
        Number(idTrabajador),
      );
    const result = await this.habilitarJornadasUsuariosUseCase.execute({
      idTrabajadores: body.idTrabajadores,
      fechaInicio: body.fechaInicio,
      fechaFin: body.fechaFin,
      duracionMinutos: body.duracionMinutos,
      idUsuarioHabilita: idUsuario,
    });
    return ApiResponseDto.success(result, 'Habilitación de jornadas procesada');
  }

  /**
   * Crear una actividad en una jornada.
   * POST /control-operativo/actividades
   * Body: idJornada, idProyecto, idTrabajador, idTipoActividad, nombreActividad, ...
   * idCoordinador se obtiene del proyecto (proProyecto.idcoordinador); opcional en body.
   */
  @ApiOperation({
    summary: 'Registrar actividad en una jornada',
    description:
      'Incluye proyecto, tipo, horas y datos del modelador; coordinador puede venir del proyecto.',
  })
  @Post('actividades')
  @UseGuards(JwtAuthGuard)
  @RequireResourcePermission(
    'control_operativo.actividades.crear',
    CONTROL_JORNADA_RESOURCE,
    'idJornada',
    'body',
  )
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
    @Body('idEntregable') idEntregable?: number,
    @Body('incidenciaDetallada') incidenciaDetallada?: string,
    @Body('entregableCulminado') entregableCulminado?: boolean,
  ) {
    if (
      (await this.access.trabajadorDeJornada(Number(idJornada))) !==
      Number(idTrabajador)
    ) {
      throw new BadRequestException(
        'La actividad debe registrarse para el trabajador de la jornada',
      );
    }
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
      idEntregable:
        idEntregable != null && idEntregable > 0 ? Number(idEntregable) : null,
      incidenciaDetallada: incidenciaDetallada?.trim() || null,
      entregableCulminado: entregableCulminado === true,
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
  @ApiOperation({
    summary: 'Adjuntar evidencias (URLs) a una actividad',
    description:
      'Tras subir archivos a storage, se registran aquí las URLs y metadatos.',
  })
  @Post('actividades/:id/evidencias')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @RequireResourcePermission(
    'control_operativo.actividades.adjuntar_evidencias',
    CONTROL_ACTIVITY_RESOURCE,
    'id',
  )
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
  @ApiOperation({
    summary: 'Eliminar evidencia de una actividad',
    description:
      'Solo el trabajador dueño; borra registro y objeto en MinIO si aplica.',
  })
  @Delete('actividades/:id/evidencias/:idEvidencia')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @RequireResourcePermission(
    'control_operativo.actividades.eliminar_evidencias',
    CONTROL_ACTIVITY_RESOURCE,
    'id',
  )
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
  @ApiOperation({
    summary: 'Listar actividades con filtros',
    description:
      'Por jornada, trabajador, proyecto y estado; paginación opcional.',
  })
  @Get('actividades')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission('control_operativo.actividades.ver')
  async listarActividades(
    @ActorId() actor: number,
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
    // propios = sus actividades; asignados = las de su equipo; todos = cualquiera.
    const trabajadorJornada = params.idJornada
      ? await this.access.trabajadorDeJornada(params.idJornada)
      : null;
    const idTrabajadorObjetivo = trabajadorJornada ?? params.idTrabajador;
    if (
      !idTrabajadorObjetivo ||
      (params.idTrabajador != null &&
        trabajadorJornada != null &&
        params.idTrabajador !== trabajadorJornada)
    ) {
      throw new BadRequestException('Indique la jornada o el trabajador');
    }
    await this.access.exigirTrabajador(
      actor,
      'control_operativo.actividades.ver',
      idTrabajadorObjetivo,
    );
    const result = await this.listarActividadesUseCase.execute(params);
    if (
      !(await this.access.trabajadorPermitido(
        actor,
        'control_operativo.actividades.ver_evidencias',
        idTrabajadorObjetivo,
      ))
    )
      for (const actividad of result.data ?? []) delete actividad.evidencias;
    return ApiResponseDto.success(result, 'Actividades listadas exitosamente');
  }

  /**
   * Listar actividades para la pestaña Validación (jerarquía del usuario de sesión, excluyéndose).
   * GET /control-operativo/actividades-validacion?idTrabajador=&idProyecto=&idEstadoActividad=&limit=10&offset=0
   * Alcance total (todas las actividades): solo Administrador Sistemas y Administrador GVR (según JWT).
   */
  @ApiOperation({
    summary: 'Actividades para la pestaña Validación',
    description:
      'Alcance según jerarquía del usuario (excluye propias). Con validacion.ver «todos», todas.',
  })
  @Get('actividades-validacion')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission('control_operativo.validacion.ver')
  async listarActividadesValidacion(
    @GrantedScope('control_operativo.validacion.ver')
    alcance: AuthorizationScope,
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
      accesoTotal: alcance === 'todos',
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
   * Actividades observadas del trabajador de sesión (vista subsanar en Registro).
   * GET /control-operativo/actividades-observadas-subsanar?idProyecto=&limit=&offset=
   */
  @ApiOperation({
    summary: 'Actividades observadas para subsanar',
    description:
      'Solo actividades en estado Observado del trabajador autenticado.',
  })
  @Get('actividades-observadas-subsanar')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission('control_operativo.actividades.subsanar')
  async listarActividadesObservadasSubsanar(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('idProyecto') idProyecto?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const result =
      await this.listarActividadesObservadasSubsanarUseCase.execute({
        idUsuario: Number(userId),
        idProyectoFiltro:
          idProyecto != null && idProyecto !== ''
            ? parseInt(idProyecto, 10)
            : undefined,
        limit: limit != null && limit !== '' ? parseInt(limit, 10) : undefined,
        offset:
          offset != null && offset !== '' ? parseInt(offset, 10) : undefined,
      });
    return ApiResponseDto.success(
      result,
      'Actividades observadas listadas exitosamente',
    );
  }

  /**
   * Valorización: actividades aprobadas por proyecto y rango de fechas, agrupadas por modelador y coordinador.
   * Requiere `control_operativo.valorizacion.ver` («asignados»: proyectos de su ámbito).
   * GET /control-operativo/valorizacion?idProyecto=1&fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
   */
  @ApiOperation({
    summary: 'Valorización de horas (actividades aprobadas)',
    description:
      'Requiere proyecto y fechas; el proyecto debe estar en el alcance del permiso.',
  })
  @Get('valorizacion')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission('control_operativo.valorizacion.ver')
  async listarValorizacion(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('idProyecto') idProyecto?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
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
    const result = await this.listarValorizacionUseCase.execute({
      idUsuario: Number(userId),
      idProyecto: idProy,
      fechaInicio: fInicio,
      fechaFin: fFin,
      proyectosPermitidos: await this.access.proyectosPermitidos(
        Number(userId),
        'control_operativo.valorizacion.ver',
      ),
    });
    return ApiResponseDto.success(result, 'Valorización listada exitosamente');
  }

  /**
   * Evaluación de desempeño: actividades rechazadas, observaciones, horas no justificadas, comentarios coordinador.
   * Requiere `control_operativo.desempeno.ver` (propios / asignados / todos).
   * GET /control-operativo/desempeno?idProyecto=1&fechaInicio=...&fechaFin=...&idTrabajador=1
   */
  @ApiOperation({
    summary: 'Evaluación de desempeño (rechazos, observaciones, horas)',
    description:
      'Módulo administrativo; filtros por proyecto, fechas y trabajador opcional.',
  })
  @Get('desempeno')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission('control_operativo.desempeno.ver')
  async listarDesempeno(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('idProyecto') idProyecto?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('idTrabajador') idTrabajador?: string,
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
    const idTrab =
      idTrabajador != null && idTrabajador !== ''
        ? parseInt(idTrabajador, 10)
        : undefined;
    // «propios»: sólo su propio desempeño; «asignados»: proyectos y equipo; «todos»: cualquiera.
    const alcancesDesempeno = await this.access.scopes(
      Number(userId),
      'control_operativo.desempeno.ver',
    );
    const soloPropio =
      !alcancesDesempeno.includes('todos') &&
      !alcancesDesempeno.includes('asignados');
    const result = await this.listarDesempenoUseCase.execute({
      idUsuario: Number(userId),
      idProyecto: idProy,
      fechaInicio: fInicio,
      fechaFin: fFin,
      proyectosPermitidos: soloPropio
        ? null
        : await this.access.proyectosPermitidos(
            Number(userId),
            'control_operativo.desempeno.ver',
          ),
      trabajadoresPermitidos: await this.access.trabajadoresPermitidos(
        Number(userId),
        'control_operativo.desempeno.ver',
      ),
      trabajadorPropio: soloPropio
        ? await this.access.trabajadorDe(Number(userId))
        : null,
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
   * Lista trabajadores del proyecto (Desempeño / asignación de entregables).
   * Con desempeño o entregables en «todos» (o «asignados» en un proyecto propio): listado del proyecto.
   * Modelador/Desarrollador Web: solo su propia persona (autoasignación).
   * GET /control-operativo/trabajadores-por-proyecto?idProyecto=1
   */
  @ApiOperation({
    summary: 'Trabajadores del proyecto',
    description:
      'Con alcance sobre el proyecto: sus trabajadores. Si no: solo sí mismo.',
  })
  @Get('trabajadores-por-proyecto')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission(
    'control_operativo.desempeno.ver',
    'control_operativo.entregables.crear',
    'control_operativo.entregables.editar',
  )
  async listarTrabajadoresPorProyecto(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('idProyecto') idProyecto?: string,
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
    // Todo el proyecto con «todos», o con «asignados» en un proyecto de su ámbito.
    let verProyecto = false;
    for (const codigo of [
      'control_operativo.desempeno.ver',
      'control_operativo.entregables.crear',
      'control_operativo.entregables.editar',
    ]) {
      const permitidos = await this.access.proyectosPermitidos(
        Number(userId),
        codigo,
      );
      if (permitidos === null || permitidos.includes(idProy)) {
        verProyecto = true;
        break;
      }
    }
    const result = await this.listarTrabajadoresPorProyectoUseCase.execute({
      idUsuario: Number(userId),
      idProyecto: idProy,
      verProyecto,
    });
    return ApiResponseDto.success(
      result,
      'Trabajadores del proyecto listados exitosamente',
    );
  }

  /**
   * Coordinadores / responsables con personal a cargo (filtro reporte general).
   * GET /control-operativo/reporte-general/lideres-equipo
   */
  @ApiOperation({
    summary: 'Líderes de equipo para filtro del reporte general',
    description: 'Coordinadores con personal a cargo.',
  })
  @Get('reporte-general/lideres-equipo')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission('control_operativo.reportes.ver_general')
  async listarLideresEquipoReporteGeneral(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const data = await this.listarLideresEquipoReporteGeneralUseCase.execute();
    return ApiResponseDto.success(data, 'Líderes listados exitosamente');
  }

  /**
   * Reporte general de actividades con filtros opcionales.
   * Requiere `control_operativo.reportes.ver_general` («asignados»: proyectos de su ámbito).
   * GET /control-operativo/reporte-general?...&idTrabajadores=1,2&idProyectos=3&idEstadosActividad=374,375&idLiderEquipo=5&...
   */
  @ApiOperation({
    summary: 'Reporte general de actividades',
    description:
      'Filtros múltiples (fechas, proyectos, trabajadores, estados, líder). Según el alcance del permiso.',
  })
  @Get('reporte-general')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission('control_operativo.reportes.ver_general')
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
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const fInicio = (fechaInicio ?? '').trim() || null;
    const fFin = (fechaFin ?? '').trim() || null;
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
      proyectosPermitidos: await this.access.proyectosPermitidos(
        Number(userId),
        'control_operativo.reportes.ver_general',
      ),
    });
    return ApiResponseDto.success(
      result,
      'Reporte general listado exitosamente',
    );
  }

  /**
   * Detalle horas por colaborador y proyecto (para matrices / Excel ancho).
   * GET /control-operativo/reporte-horas-mes-proyecto-trabajador/detalle-por-proyecto?fechaInicio=...&fechaFin=...
   */
  @ApiOperation({
    summary: 'Reporte horas: detalle colaborador × proyecto',
    description:
      'Una fila por par colaborador-proyecto en el rango. Mismos filtros que el consolidado.',
  })
  @Get('reporte-horas-mes-proyecto-trabajador/detalle-por-proyecto')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission('control_operativo.reportes.exportar_horas_excel')
  async listarReporteHorasRangoDetalleProyecto(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('idTrabajadores') idTrabajadores?: string,
    @Query('idProyectos') idProyectos?: string,
    @Query('idEstadosActividad') idEstadosActividad?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const fInicio = (fechaInicio ?? '').trim() || null;
    const fFin = (fechaFin ?? '').trim() || null;
    if (!fInicio || !fFin) {
      throw new BadRequestException('fechaInicio y fechaFin son obligatorias');
    }
    if (fInicio > fFin) {
      throw new BadRequestException(
        'fechaInicio no puede ser posterior a fechaFin',
      );
    }
    const result =
      await this.listarReporteHorasRangoDetalleProyectoUseCase.execute({
        idUsuario: Number(userId),
        fechaInicio: fInicio,
        fechaFin: fFin,
        idTrabajadores: this.parseIdsListQuery(idTrabajadores),
        idProyectos: this.parseIdsListQuery(idProyectos),
        idEstadosActividad: this.parseIdsListQuery(idEstadosActividad),
        proyectosPermitidos: await this.access.proyectosPermitidos(
          Number(userId),
          'control_operativo.reportes.exportar_horas_excel',
        ),
      });
    return ApiResponseDto.success(
      result,
      'Detalle por proyecto listado exitosamente',
    );
  }

  /**
   * Horas dedicadas agregadas por trabajador en un rango de fechas (todos los proyectos consolidados).
   * GET /control-operativo/reporte-horas-mes-proyecto-trabajador?fechaInicio=...&fechaFin=...&horasMetaDia=8&...
   */
  @ApiOperation({
    summary: 'Reporte horas por rango (por colaborador)',
    description:
      'Totales por trabajador en el periodo; filtro opcional por proyectos/estados, según el alcance del permiso.',
  })
  @Get('reporte-horas-mes-proyecto-trabajador')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission('control_operativo.reportes.ver_horas_mes')
  async listarReporteHorasMesProyectoTrabajador(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('horasMetaDia') horasMetaDia?: string,
    @Query('idTrabajadores') idTrabajadores?: string,
    @Query('idProyectos') idProyectos?: string,
    @Query('idEstadosActividad') idEstadosActividad?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const fInicio = (fechaInicio ?? '').trim() || null;
    const fFin = (fechaFin ?? '').trim() || null;
    if (!fInicio || !fFin) {
      throw new BadRequestException('fechaInicio y fechaFin son obligatorias');
    }
    if (fInicio > fFin) {
      throw new BadRequestException(
        'fechaInicio no puede ser posterior a fechaFin',
      );
    }
    const metaRaw =
      horasMetaDia != null && horasMetaDia.trim() !== ''
        ? parseFloat(horasMetaDia.trim().replace(',', '.'))
        : 8;
    const horasMeta = Number.isFinite(metaRaw) && metaRaw > 0 ? metaRaw : 8;
    const result =
      await this.listarReporteHorasMesProyectoTrabajadorUseCase.execute({
        idUsuario: Number(userId),
        fechaInicio: fInicio,
        fechaFin: fFin,
        idTrabajadores: this.parseIdsListQuery(idTrabajadores),
        idProyectos: this.parseIdsListQuery(idProyectos),
        idEstadosActividad: this.parseIdsListQuery(idEstadosActividad),
        horasMetaDia: horasMeta,
        proyectosPermitidos: await this.access.proyectosPermitidos(
          Number(userId),
          'control_operativo.reportes.ver_horas_mes',
        ),
      });
    return ApiResponseDto.success(
      result,
      'Reporte de horas por periodo listado exitosamente',
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

  /** Leer una actividad: suya o de su equipo (ver/subsanar), o validable por la persona. */
  private async exigirLecturaActividad(actor: number, idActividad: number) {
    const idTrabajador = await this.access.trabajadorDeActividad(idActividad);
    if (idTrabajador == null) return;
    for (const codigo of [
      'control_operativo.actividades.ver',
      'control_operativo.actividades.subsanar',
    ])
      if (await this.access.trabajadorPermitido(actor, codigo, idTrabajador))
        return;
    const validacion = await this.access.scopes(
      actor,
      'control_operativo.validacion.ver',
    );
    if (
      validacion.length &&
      (await this.obtenerActividadUseCase.execute({
        idActividad,
        contextoValidacion: true,
        idUsuario: actor,
        accesoTotalValidacion: validacion.includes('todos'),
      }))
    )
      return;
    throw ControlOperativoAccess.denied();
  }

  /**
   * Listar observaciones del coordinador sobre una actividad (para "Corregir").
   * GET /control-operativo/actividades/:id/observaciones
   */
  @ApiOperation({
    summary: 'Observaciones del coordinador sobre la actividad',
    description: 'Para flujo de corrección.',
  })
  @Get('actividades/:id/observaciones')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission(...LECTURA_ACTIVIDAD)
  async listarObservacionesActividad(
    @Param('id', ParseIntPipe) id: number,
    @ActorId() actor: number,
  ) {
    await this.exigirLecturaActividad(actor, id);
    const data = await this.listarObservacionesActividadUseCase.execute(id);
    return ApiResponseDto.success(data, 'Observaciones listadas exitosamente');
  }

  /**
   * Obtener una actividad por ID con toda la información relacionada (para "Ver").
   * GET /control-operativo/actividades/:id?contextoValidacion=1
   * Con contextoValidacion=1 solo responde si el usuario puede validar esa actividad.
   */
  @ApiOperation({
    summary: 'Detalle de una actividad',
    description:
      'Query `contextoValidacion=1` restringe si el usuario puede validar esa actividad.',
  })
  @Get('actividades/:id')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission(...LECTURA_ACTIVIDAD)
  async obtenerActividad(
    @Req() req: Request & { user?: { id?: number; sub?: number } },
    @Param('id', ParseIntPipe) id: number,
    @Query('contextoValidacion') contextoValidacion?: string,
  ) {
    const userId = req.user?.sub ?? req.user?.id;
    const ctxVal = contextoValidacion === 'true' || contextoValidacion === '1';
    if (userId == null) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const validacion = ctxVal
      ? await this.access.scopes(
          Number(userId),
          'control_operativo.validacion.ver',
        )
      : [];
    if (ctxVal && !validacion.length) throw ControlOperativoAccess.denied();
    if (!ctxVal) await this.exigirLecturaActividad(Number(userId), id);
    const data = await this.obtenerActividadUseCase.execute(
      ctxVal
        ? {
            idActividad: id,
            contextoValidacion: true,
            idUsuario: Number(userId),
            accesoTotalValidacion: validacion.includes('todos'),
          }
        : id,
    );
    // Fuera de validación, las evidencias requieren «ver evidencias» sobre el trabajador.
    if (
      data &&
      !ctxVal &&
      !(await this.access.trabajadorPermitido(
        Number(userId),
        'control_operativo.actividades.ver_evidencias',
        Number(data.idtrabajador),
      ))
    )
      delete (data as { evidencias?: unknown }).evidencias;
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
  @ApiOperation({
    summary: 'Validar actividad (aprobar / observar / rechazar)',
    description: 'Comentario obligatorio para observar o rechazar.',
  })
  @Patch('actividades/:id/validar')
  @UseGuards(JwtAuthGuard)
  @RequireScopedPermission(
    'control_operativo.validacion.aprobar',
    'control_operativo.validacion.observar',
    'control_operativo.validacion.rechazar',
  )
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
    const codigo = PERMISO_VALIDACION[idEstado];
    const alcances = codigo
      ? await this.access.scopes(Number(userId), codigo)
      : [];
    if (!alcances.length) throw ControlOperativoAccess.denied();
    const data = await this.validarActividadUseCase.execute({
      idActividad: id,
      idEstadoActividad: idEstado,
      comentarioValidacion: comentarioValidacion?.trim() || null,
      idUsuario: Number(userId),
      accesoTotal: alcances.includes('todos'),
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
  @ApiOperation({
    summary: 'Actualizar datos de la actividad',
    description:
      'Incluye flag corregirObservacion para enviar corrección tras observación.',
  })
  @Patch('actividades/:id')
  @UseGuards(JwtAuthGuard)
  @RequireResourcePermission(
    [
      'control_operativo.actividades.editar',
      'control_operativo.actividades.subsanar',
    ],
    CONTROL_ACTIVITY_RESOURCE,
    'id',
  )
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
    @Body('idEntregable') idEntregable?: number,
    @Body('incidenciaDetallada') incidenciaDetallada?: string,
    @Body('entregableCulminado') entregableCulminado?: boolean,
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
      idEntregable:
        idEntregable != null && idEntregable > 0 ? Number(idEntregable) : null,
      incidenciaDetallada: incidenciaDetallada?.trim() || null,
      entregableCulminado: entregableCulminado === true,
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
  @ApiOperation({
    summary: 'Eliminar actividad',
    description: 'Solo si está en estado "Por aprobar".',
  })
  @Delete('actividades/:id')
  @UseGuards(JwtAuthGuard)
  @RequireResourcePermission(
    'control_operativo.actividades.eliminar',
    CONTROL_ACTIVITY_RESOURCE,
    'id',
  )
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
