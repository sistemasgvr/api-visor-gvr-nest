import { DocumentAccessService } from '../src/application/services/document-access.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { ApplicationRuntimeModule } from '../src/composition/modules/platform/application-runtime.module';
import { CrearTrabajadorUseCase } from '../src/application/use-cases/trabajador/crear-trabajador.use-case';
import { ZodValidationPipe } from '../src/presentation/validation/zod-validation.pipe';
import { ArgumentsHost, Catch, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { Server } from 'node:http';
import type { Response } from 'express';
import { ProyectoModule } from '../src/composition/modules/proyecto.module';
import { GRANULAR_PERMISSIONS } from '../src/application/ports/granular-permissions.port';
import { DatabaseFunctionService } from '../src/infrastructure/database/database-function.service';
import { ApplicationFailure } from '../src/application/errors/application.error';
import { failureHttpStatus } from '../src/infrastructure/runtime/application-failure.adapter';
@Catch(ApplicationFailure)
class FailureFilter {
  catch(error: ApplicationFailure, host: ArgumentsHost) {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(failureHttpStatus[error.kind])
      .json({ message: error.message, details: error.details });
  }
}
describe('Planificación HTTP con JWT y políticas reales', () => {
  let app: INestApplication;
  let token: string;
  const database = {
    callFunctionSingle: jest.fn(),
    callFunction: jest.fn(),
    executeQuery: jest.fn(),
  };
  const permissions = { readCurrent: jest.fn() };
  const base = '/api/proyectos/8/planificacion';
  const grant = (code: string, scope = 'todos') =>
    permissions.readCurrent.mockResolvedValue({
      active: true,
      grants: [{ code, scopes: [scope] }],
    });
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        ApplicationRuntimeModule,
        ProyectoModule,
      ],
    })
      .useMocker((token) => (token === DocumentAccessService ? {} : undefined))
      .overrideProvider(CrearTrabajadorUseCase)
      .useValue({ execute: jest.fn() })
      .overrideProvider(ConfigService)
      .useValue(
        new ConfigService({
          JWT_SECRET: 'planning-http-only',
          JWT_EXPIRES_IN: '1h',
        }),
      )
      .overrideProvider(getDataSourceToken())
      .useValue({
        isInitialized: true,
        entityMetadatas: [],
        options: { type: 'postgres' },
        query: jest.fn(),
        destroy: jest.fn(),
      })
      .overrideProvider(DatabaseFunctionService)
      .useValue(database)
      .overrideProvider(GRANULAR_PERMISSIONS)
      .useValue(permissions)
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new FailureFilter());
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
    token = new JwtService({ secret: 'planning-http-only' }).sign({
      sub: 23,
      roles: [],
      permisos: [],
    });
  });
  afterAll(async () => {
    await app?.close();
  });
  beforeEach(() => {
    jest.resetAllMocks();
    grant('proyectos.planificacion.editar');
    database.executeQuery.mockImplementation((sql: string) =>
      Promise.resolve(
        sql.includes('AS exists')
          ? [{ exists: true, assigned: true }]
          : [{ ok: 1 }],
      ),
    );
    database.callFunctionSingle.mockResolvedValue({
      pla_CrearPlanProyecto: { id: 2, revision: 1 },
    });
  });
  const calendarioPlan = base + '/2/calendario';
  const revisionAmpliaciones = base + '/2/revision-ampliaciones';
  const previsualizarAmpliacion = base + '/2/ampliaciones/7/previsualizar';
  it('previsualización de reanudación exige JWT y alcance de planificación', async () => {
    await request(app.getHttpServer() as Server)
      .post(previsualizarAmpliacion)
      .send({ minutosAprobados: 120, fechaReanudacion: '2026-10-30' })
      .expect(401);
    grant('control_operativo.actividades.ver');
    await request(app.getHttpServer() as Server)
      .post(previsualizarAmpliacion)
      .auth(token, { type: 'bearer' })
      .send({ minutosAprobados: 120, fechaReanudacion: '2026-10-30' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('envía fecha y horas de previsualización al servidor con actor de JWT', async () => {
    grant('proyectos.planificacion.ver');
    const result = {
      huella: 'a'.repeat(32),
      revisionplan: 3,
      inicioefectivo: '2026-10-30',
      finefectivo: '2026-10-30',
    };
    database.callFunctionSingle.mockResolvedValue({
      pla_PrevisualizarReanudacionAmpliacion: result,
    });
    const response = await request(app.getHttpServer() as Server)
      .post(previsualizarAmpliacion)
      .auth(token, { type: 'bearer' })
      .send({ minutosAprobados: 120, fechaReanudacion: '2026-10-30' })
      .expect(200);
    expect((response.body as { data: unknown }).data).toEqual(result);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_PrevisualizarReanudacionAmpliacion',
      [23, 7, 120, '2026-10-30'],
    );
  });
  it('aprobar envía la revisión y huella que garantizan la programación revisada', async () => {
    grant('proyectos.planificacion.ver');
    database.callFunctionSingle.mockResolvedValue({
      pla_ResolverAmpliacion: { id: 7, minutosaprobados: 120 },
    });
    await request(app.getHttpServer() as Server)
      .patch(base + '/2/ampliaciones/7')
      .auth(token, { type: 'bearer' })
      .send({
        minutosAprobados: 120,
        resolucion: 'Aprobar',
        fechaReanudacion: '2026-10-30',
        revisionPlan: 3,
        huella: 'a'.repeat(32),
      })
      .expect(200);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_ResolverAmpliacion',
      [23, 7, 120, 'Aprobar', '2026-10-30', 3, 'a'.repeat(32), false],
    );
  });
  it('reprogramar saldo ya aprobado nunca incrementa horas de nuevo', async () => {
    grant('proyectos.planificacion.ver');
    database.callFunctionSingle.mockResolvedValue({
      pla_ResolverAmpliacion: { id: 7, minutosaprobados: 120 },
    });
    await request(app.getHttpServer() as Server)
      .patch(base + '/2/ampliaciones/7/reprogramar')
      .auth(token, { type: 'bearer' })
      .send({
        resolucion: 'Solo saldo',
        fechaReanudacion: '2026-10-30',
        revisionPlan: 3,
        huella: 'a'.repeat(32),
      })
      .expect(200);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_ResolverAmpliacion',
      [23, 7, 0, 'Solo saldo', '2026-10-30', 3, 'a'.repeat(32), true],
    );
  });
  it.each([
    { minutosAprobados: 120, resolucion: 'Sin previsualizar' },
    {
      minutosAprobados: 120,
      resolucion: 'Inválida',
      fechaReanudacion: '2026-02-30',
      revisionPlan: 3,
      huella: 'a'.repeat(32),
    },
  ])('rechaza aprobación inválida %j antes de SQL', async (body) => {
    grant('proyectos.planificacion.ver');
    await request(app.getHttpServer() as Server)
      .patch(base + '/2/ampliaciones/7')
      .auth(token, { type: 'bearer' })
      .send(body)
      .expect(400);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('la bandeja exige sesión y permiso ver planificación', async () => {
    await request(app.getHttpServer() as Server)
      .get(revisionAmpliaciones)
      .expect(401);
    grant('control_operativo.actividades.ver');
    await request(app.getHttpServer() as Server)
      .get(revisionAmpliaciones)
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it.each(['todos', 'asignados'])(
    'consulta la bandeja autorizada (%s), con filtros validados',
    async (scope) => {
      grant('proyectos.planificacion.ver', scope);
      const result = {
        total: 0,
        solicitudes: [],
        pendientes: 0,
        esaprobador: false,
      };
      database.callFunctionSingle.mockResolvedValue({
        pla_ObtenerBandejaAmpliaciones: result,
      });
      const res = await request(app.getHttpServer() as Server)
        .get(
          revisionAmpliaciones +
            '?estado=todas&busqueda=Diseño&idActividad=7&offset=10&limite=10',
        )
        .auth(token, { type: 'bearer' })
        .expect(200);
      expect((res.body as { data: unknown }).data).toEqual(result);
      expect(database.callFunctionSingle).toHaveBeenCalledWith(
        'pla_ObtenerBandejaAmpliaciones',
        [23, 2, 8, 'todas', 7, 'Diseño', 10, 10],
      );
    },
  );
  it('deniega bandeja de un proyecto ajeno con alcance asignados', async () => {
    grant('proyectos.planificacion.ver', 'asignados');
    database.executeQuery.mockResolvedValue([
      { exists: true, assigned: false },
    ]);
    await request(app.getHttpServer() as Server)
      .get(revisionAmpliaciones)
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it.each(['?estado=otro', '?limite=101', '?offset=-1', '?idActividad=0'])(
    'rechaza filtros de bandeja %s',
    async (query) => {
      grant('proyectos.planificacion.ver');
      await request(app.getHttpServer() as Server)
        .get(revisionAmpliaciones + query)
        .auth(token, { type: 'bearer' })
        .expect(400);
      expect(database.callFunctionSingle).not.toHaveBeenCalled();
    },
  );
  const rango = '?desde=2026-10-19&hasta=2026-10-25';
  it('O4 exige JWT y permiso ver planificación', async () => {
    await request(app.getHttpServer() as Server)
      .get(calendarioPlan + rango)
      .expect(401);
    grant('configuracion.calendarios.ver', 'global');
    await request(app.getHttpServer() as Server)
      .get(calendarioPlan + rango)
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it.each(['todos', 'asignados'])(
    'O4 consulta con planificación.ver (%s) sin permisos de configuración',
    async (scope) => {
      grant('proyectos.planificacion.ver', scope);
      const result = {
        idcalendario: 6,
        nombre: 'Laboral',
        idversion: 3,
        dias: [{ fecha: '2026-10-19', minutos: 0, nombre: 'Feriado' }],
      };
      database.callFunctionSingle.mockResolvedValue({
        pla_ObtenerCalendarioPlan: result,
      });
      const res = await request(app.getHttpServer() as Server)
        .get(calendarioPlan + rango)
        .auth(token, { type: 'bearer' })
        .expect(200);
      expect((res.body as { data: unknown }).data).toEqual(result);
      expect(database.callFunctionSingle).toHaveBeenCalledWith(
        'pla_ObtenerCalendarioPlan',
        [23, 2, '2026-10-19', '2026-10-25'],
      );
    },
  );
  it('O4 devuelve 404 para un plan de otro proyecto', async () => {
    grant('proyectos.planificacion.ver');
    database.executeQuery.mockImplementation((sql: string) =>
      Promise.resolve(
        sql.includes('AS exists') ? [{ exists: true, assigned: true }] : [],
      ),
    );
    await request(app.getHttpServer() as Server)
      .get(calendarioPlan + rango)
      .auth(token, { type: 'bearer' })
      .expect(404);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('O4 deniega proyectos ajenos con alcance asignados', async () => {
    grant('proyectos.planificacion.ver', 'asignados');
    database.executeQuery.mockResolvedValue([
      { exists: true, assigned: false },
    ]);
    await request(app.getHttpServer() as Server)
      .get(calendarioPlan + rango)
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it.each([
    '',
    '?desde=2026-10-19',
    '?desde=2026-10-20&hasta=2026-10-19',
    '?desde=2026-01-01&hasta=2027-01-02',
    '?desde=2026-02-30&hasta=2026-03-01',
    '?desde=2026-10-19&hasta=2026-10-20&idversion=99',
  ])('O4 rechaza query inválida %s', async (query) => {
    grant('proyectos.planificacion.ver');
    await request(app.getHttpServer() as Server)
      .get(calendarioPlan + query)
      .auth(token, { type: 'bearer' })
      .expect(400);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('O4 admite exactamente 366 días inclusivos', async () => {
    grant('proyectos.planificacion.ver');
    database.callFunctionSingle.mockResolvedValue({
      pla_ObtenerCalendarioPlan: {
        idcalendario: 6,
        nombre: 'Laboral',
        idversion: 3,
        dias: [],
      },
    });
    await request(app.getHttpServer() as Server)
      .get(calendarioPlan + '?desde=2026-01-01&hasta=2027-01-01')
      .auth(token, { type: 'bearer' })
      .expect(200);
  });
  it('O4 muestra error de negocio si falta calendario publicado', async () => {
    grant('proyectos.planificacion.ver');
    database.callFunctionSingle.mockRejectedValue({
      code: 'P0001',
      message: 'Calendario sin versión publicada',
    });
    await request(app.getHttpServer() as Server)
      .get(calendarioPlan + rango)
      .auth(token, { type: 'bearer' })
      .expect(422);
  });
  const calendarios = '/api/proyectos/calendarios-publicados';
  it('O3 exige JWT', async () => {
    await request(app.getHttpServer() as Server)
      .get(calendarios)
      .expect(401);
    expect(database.callFunction).not.toHaveBeenCalled();
  });
  it.each([
    ['proyectos.proyectos.crear', 'global'],
    ['proyectos.proyectos.editar', 'todos'],
    ['proyectos.proyectos.editar', 'asignados'],
    ['proyectos.planificacion.editar', 'todos'],
    ['proyectos.planificacion.editar', 'asignados'],
  ])('O3 permite consultar con %s (%s)', async (code, scope) => {
    grant(code, scope);
    const rows = [{ id: 6, nombre: 'Laboral', numeroversion: 2 }];
    database.callFunction.mockResolvedValue(rows);
    const res = await request(app.getHttpServer() as Server)
      .get(calendarios)
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect((res.body as { data: unknown }).data).toEqual(rows);
    expect(database.callFunction).toHaveBeenCalledWith(
      'tra_ListarCalendariosPublicados',
    );
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
    expect(database.executeQuery).not.toHaveBeenCalled();
  });
  it.each([
    'proyectos.proyectos.ver',
    'proyectos.planificacion.ver',
    'usuarios.trabajadores.editar',
  ])('O3 no concede acceso solo por %s', async (code) => {
    grant(code, 'todos');
    await request(app.getHttpServer() as Server)
      .get(calendarios)
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunction).not.toHaveBeenCalled();
  });
  it('O3 rechaza sesión sin concesiones vigentes aunque el JWT declare permisos', async () => {
    permissions.readCurrent.mockResolvedValue({ active: true, grants: [] });
    const forged = new JwtService({ secret: 'planning-http-only' }).sign({
      sub: 23,
      roles: [{ id: 1 }],
      permisos: ['proyectos.proyectos.crear'],
    });
    await request(app.getHttpServer() as Server)
      .get(calendarios)
      .auth(forged, { type: 'bearer' })
      .expect(403);
    expect(database.callFunction).not.toHaveBeenCalled();
  });
  it('O3 responde vacío cuando no hay calendarios publicados', async () => {
    grant('proyectos.planificacion.editar');
    database.callFunction.mockResolvedValue([]);
    const res = await request(app.getHttpServer() as Server)
      .get(calendarios)
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect((res.body as { data: unknown }).data).toEqual([]);
  });
  it('O3 conserva el mismo contrato y datos de la ruta de Trabajadores', async () => {
    permissions.readCurrent.mockResolvedValue({
      active: true,
      grants: [
        { code: 'proyectos.planificacion.editar', scopes: ['asignados'] },
        { code: 'usuarios.trabajadores.crear', scopes: ['global'] },
      ],
    });
    database.callFunction.mockResolvedValue([
      { id: 6, nombre: 'Laboral', numeroversion: 2 },
    ]);
    const proyectos = await request(app.getHttpServer() as Server)
      .get(calendarios)
      .auth(token, { type: 'bearer' })
      .expect(200);
    const trabajadores = await request(app.getHttpServer() as Server)
      .get('/api/trabajadores/calendarios-publicados')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(proyectos.body).toEqual(trabajadores.body);
    expect(database.callFunction).toHaveBeenCalledTimes(2);
  });
  it('O2 exige JWT y permiso de planificación sobre el proyecto', async () => {
    await request(app.getHttpServer() as Server)
      .get(base + '/equipo')
      .expect(401);
    grant('proyectos.accesos.ver');
    await request(app.getHttpServer() as Server)
      .get(base + '/equipo')
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it.each(['todos', 'asignados'])(
    'O2 permite ver equipo con planificación.ver (%s), sin accesos.ver',
    async (scope) => {
      grant('proyectos.planificacion.ver', scope);
      const rows = [
        {
          idtrabajador: 4,
          nombre: 'Persona',
          foto: null,
          puesto: null,
          idcalendario: null,
          tienecalendariopublicado: false,
        },
      ];
      database.callFunctionSingle.mockResolvedValue({
        pla_ListarEquipoPlan: rows,
      });
      const res = await request(app.getHttpServer() as Server)
        .get(base + '/equipo')
        .auth(token, { type: 'bearer' })
        .expect(200);
      expect((res.body as { data: unknown }).data).toEqual(rows);
      expect(database.callFunctionSingle).toHaveBeenCalledWith(
        'pla_ListarEquipoPlan',
        [23, 8],
      );
    },
  );
  it('O2 deniega un proyecto ajeno con alcance asignados', async () => {
    grant('proyectos.planificacion.ver', 'asignados');
    database.executeQuery.mockResolvedValue([
      { exists: true, assigned: false },
    ]);
    await request(app.getHttpServer() as Server)
      .get(base + '/equipo')
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('O2 deniega proyectos inexistentes o inactivos desde el guard', async () => {
    grant('proyectos.planificacion.ver');
    database.executeQuery.mockResolvedValue([
      { exists: false, assigned: false },
    ]);
    await request(app.getHttpServer() as Server)
      .get(base + '/equipo')
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('O2 devuelve vacío para un proyecto activo sin equipo', async () => {
    grant('proyectos.planificacion.ver');
    database.callFunctionSingle.mockResolvedValue({ pla_ListarEquipoPlan: [] });
    const res = await request(app.getHttpServer() as Server)
      .get(base + '/equipo')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect((res.body as { data: unknown }).data).toEqual([]);
  });
  const estados = '/api/proyectos/planificacion/estados';
  it('resumen exige JWT, permiso y devuelve las métricas del lote autorizado', async () => {
    const url = '/api/proyectos/planificacion/resumen?ids=8,9,8';
    await request(app.getHttpServer() as Server)
      .get(url)
      .expect(401);
    permissions.readCurrent.mockResolvedValue({ active: true, grants: [] });
    await request(app.getHttpServer() as Server)
      .get(url)
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
    grant('proyectos.planificacion.ver', 'asignados');
    database.executeQuery.mockResolvedValue([{ id: 8 }]);
    const rows = [
      { idproyecto: 8, metricas: { avancereal: 0, minutosplanificados: 2400 } },
    ];
    database.callFunctionSingle.mockResolvedValue({
      pla_ListarResumenPlanes: rows,
    });
    const result = await request(app.getHttpServer() as Server)
      .get(url)
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect((result.body as { data: unknown }).data).toEqual(rows);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_ListarResumenPlanes',
      [23, [8]],
    );
  });
  it('O1 exige JWT y permiso de planificación', async () => {
    await request(app.getHttpServer() as Server)
      .get(estados + '?ids=8')
      .expect(401);
    permissions.readCurrent.mockResolvedValue({ active: true, grants: [] });
    await request(app.getHttpServer() as Server)
      .get(estados + '?ids=8')
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('O1 devuelve el lote sin requerir permisos de ver proyectos', async () => {
    grant('proyectos.planificacion.ver');
    const rows = [
      {
        idproyecto: 8,
        idplan: 2,
        idestadoplan: 700,
        revision: 1,
        publicadoen: null,
      },
    ];
    database.callFunctionSingle.mockResolvedValue({
      pla_ListarEstadoPlanes: rows,
    });
    const res = await request(app.getHttpServer() as Server)
      .get(estados + '?ids=8,9,8')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect((res.body as { data: unknown }).data).toEqual(rows);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_ListarEstadoPlanes',
      [23, [8, 9]],
    );
  });
  it('O1 filtra asignados en el servidor', async () => {
    grant('proyectos.planificacion.ver', 'asignados');
    database.executeQuery.mockResolvedValue([{ id: 8 }]);
    database.callFunctionSingle.mockResolvedValue({
      pla_ListarEstadoPlanes: [],
    });
    await request(app.getHttpServer() as Server)
      .get(estados + '?ids=8,9')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_ListarEstadoPlanes',
      [23, [8]],
    );
  });
  it('O1 responde vacío si todos los IDs son ajenos', async () => {
    grant('proyectos.planificacion.ver', 'asignados');
    database.executeQuery.mockResolvedValue([]);
    const res = await request(app.getHttpServer() as Server)
      .get(estados + '?ids=9')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect((res.body as { data: unknown }).data).toEqual([]);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it.each([
    '',
    '?ids=',
    '?ids=0',
    '?ids=8,,9',
    '?ids=2147483648',
    '?ids=8&ids=9',
    '?ids=8&actor=1',
  ])('O1 rechaza query inválida %s', async (query) => {
    grant('proyectos.planificacion.ver');
    await request(app.getHttpServer() as Server)
      .get(estados + query)
      .auth(token, { type: 'bearer' })
      .expect(400);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('401 sin JWT y 403 sin permiso aunque el token afirme un rol', async () => {
    await request(app.getHttpServer() as Server)
      .get(base)
      .expect(401);
    permissions.readCurrent.mockResolvedValue({ active: true, grants: [] });
    await request(app.getHttpServer() as Server)
      .get(base)
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('403 con alcance asignados en un proyecto ajeno', async () => {
    grant('proyectos.planificacion.ver', 'asignados');
    database.executeQuery.mockResolvedValue([
      { exists: true, assigned: false },
    ]);
    await request(app.getHttpServer() as Server)
      .get(base)
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('devuelve plan null para un proyecto sin planificación', async () => {
    grant('proyectos.planificacion.ver');
    database.callFunctionSingle.mockResolvedValue({
      pla_ObtenerPlanProyecto: { idproyecto: 8, plan: null },
    });
    const response = await request(app.getHttpServer() as Server)
      .get(base)
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect((response.body as { data: unknown }).data).toEqual({
      idproyecto: 8,
      plan: null,
    });
  });
  it('404 para plan de otro proyecto antes de llamar la función', async () => {
    grant('proyectos.planificacion.ver');
    database.executeQuery.mockImplementation((sql: string) =>
      Promise.resolve(
        sql.includes('AS exists') ? [{ exists: true, assigned: true }] : [],
      ),
    );
    await request(app.getHttpServer() as Server)
      .get(base + '/2/cronograma')
      .auth(token, { type: 'bearer' })
      .expect(404);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it.each([
    { idaprobador: 0, idcalendario: 2, idmodalidad: 385 },
    { idaprobador: 2, idcalendario: 2, idmodalidad: 385, actor: 999 },
    { idaprobador: null, idcalendario: 2, idmodalidad: 385 },
    { idcalendario: 2, idmodalidad: 385 },
    { idaprobador: 2, idmodalidad: 385 },
    { idaprobador: 2, idcalendario: 2 },
    {},
  ])('400 con cuerpo inválido o actor inyectado: %j', async (body) => {
    await request(app.getHttpServer() as Server)
      .post(base)
      .auth(token, { type: 'bearer' })
      .send(body)
      .expect(400);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  const planCompleto = { idaprobador: 4, idcalendario: 2, idmodalidad: 385 };
  const candidatos = (...ids: number[]) =>
    database.callFunctionSingle.mockImplementation((name: string) =>
      Promise.resolve(
        name === 'pla_ListarAprobadoresPlan'
          ? {
              pla_ListarAprobadoresPlan: ids.map((idtrabajador) => ({
                idtrabajador,
                nombre: 'Persona',
                foto: null,
                puesto: null,
                escoordinador: false,
              })),
            }
          : { [name]: { id: 2, revision: 1 } },
      ),
    );
  it('crea con actor del JWT, calendario y modalidad, y devuelve 201', async () => {
    candidatos(4);
    await request(app.getHttpServer() as Server)
      .post(base)
      .auth(token, { type: 'bearer' })
      .send(planCompleto)
      .expect(201);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_CrearPlanProyecto',
      [23, 8, 4, 2, 385],
    );
  });
  it('no crea el plan si el aprobador no es coordinador ni tiene permiso de aprobación', async () => {
    candidatos(5);
    await request(app.getHttpServer() as Server)
      .post(base)
      .auth(token, { type: 'bearer' })
      .send(planCompleto)
      .expect(400);
    expect(database.callFunctionSingle).not.toHaveBeenCalledWith(
      'pla_CrearPlanProyecto',
      expect.anything(),
    );
  });
  it('lista aprobadores con el permiso independiente decidido en el backend', async () => {
    grant('proyectos.planificacion.ver');
    candidatos(4);
    const res = await request(app.getHttpServer() as Server)
      .get(base + '/aprobadores')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect((res.body as { data: unknown[] }).data).toHaveLength(1);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_ListarAprobadoresPlan',
      [23, 8, 'proyectos.planificacion.aprobar_ampliaciones'],
    );
  });
  it.each([
    { trabajador: 4, elegible: true, status: 200 },
    { trabajador: 5, elegible: true, status: 403 },
    { trabajador: 4, elegible: false, status: 400 },
  ])(
    'publicación exige al aprobador designado y vigente: %j',
    async ({ trabajador, elegible, status }) => {
      grant('proyectos.planificacion.publicar');
      database.executeQuery.mockImplementation((sql: string) =>
        Promise.resolve(
          sql.includes('AS exists')
            ? [{ exists: true, assigned: true }]
            : sql.includes('SELECT id FROM public.tratrabajador')
              ? [{ id: trabajador }]
              : [{ ok: 1 }],
        ),
      );
      database.callFunctionSingle.mockImplementation((name: string) =>
        Promise.resolve({
          [name]:
            name === 'pla_ObtenerPlanProyecto'
              ? { idproyecto: 8, plan: { id: 2, idaprobador: 4 } }
              : name === 'pla_ListarAprobadoresPlan'
                ? elegible
                  ? [{ idtrabajador: 4 }]
                  : []
                : { idlineabase: 1, revisionplan: 5 },
        }),
      );
      await request(app.getHttpServer() as Server)
        .post(base + '/2/publicar')
        .auth(token, { type: 'bearer' })
        .send({ revisionPlan: 3, motivo: 'Gantt revisado' })
        .expect(status);
      if (status === 200)
        expect(database.callFunctionSingle).toHaveBeenCalledWith(
          'pla_PublicarPlanProyecto',
          [23, 2, 3, 'Gantt revisado'],
        );
      else
        expect(database.callFunctionSingle).not.toHaveBeenCalledWith(
          'pla_PublicarPlanProyecto',
          expect.anything(),
        );
    },
  );
  it('ser candidato con Aprobar ampliaciones no concede Publicar automáticamente', async () => {
    grant('proyectos.planificacion.aprobar_ampliaciones');
    await request(app.getHttpServer() as Server)
      .post(base + '/2/publicar')
      .auth(token, { type: 'bearer' })
      .send({ revisionPlan: 3, motivo: 'Revisión' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  const reglas = base + '/2/reglas';
  it('configura calendario y modalidad de un plan existente', async () => {
    grant('proyectos.planificacion.configurar');
    candidatos();
    await request(app.getHttpServer() as Server)
      .put(reglas)
      .auth(token, { type: 'bearer' })
      .send({ revisionPlan: 3, reglas: { idcalendario: 2, idmodalidad: 385 } })
      .expect(200);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_ActualizarReglasPlan',
      [23, 2, 3, JSON.stringify({ idcalendario: 2, idmodalidad: 385 }), null],
    );
    expect(database.callFunctionSingle).not.toHaveBeenCalledWith(
      'pla_ListarAprobadoresPlan',
      expect.anything(),
    );
  });
  it('rechaza como aprobador a quien no es coordinador ni tiene permiso de aprobación', async () => {
    grant('proyectos.planificacion.configurar');
    candidatos(5);
    await request(app.getHttpServer() as Server)
      .put(reglas)
      .auth(token, { type: 'bearer' })
      .send({ revisionPlan: 3, reglas: { idaprobador: 4 } })
      .expect(400);
    expect(database.callFunctionSingle).not.toHaveBeenCalledWith(
      'pla_ActualizarReglasPlan',
      expect.anything(),
    );
  });
  it.each([
    { idaprobador: null },
    { idcalendario: null },
    { idmodalidad: null },
    { idcalendario: 0 },
  ])('no permite quitar datos obligatorios del plan: %j', async (body) => {
    grant('proyectos.planificacion.configurar');
    await request(app.getHttpServer() as Server)
      .put(reglas)
      .auth(token, { type: 'bearer' })
      .send({ revisionPlan: 3, reglas: body })
      .expect(400);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('crea actividad y reparto con JSONB en una sola llamada', async () => {
    database.callFunctionSingle.mockResolvedValue({
      pla_GuardarActividad: { id: 3, revision: 1 },
    });
    await request(app.getHttpServer() as Server)
      .post(base + '/2/actividades')
      .auth(token, { type: 'bearer' })
      .send({
        revisionPlan: 1,
        datos: {
          identregable: 1,
          nombre: ' Diseño ',
          minutosestimados: 60,
          asignaciones: [{ idtrabajador: 4, minutosasignados: 60 }],
        },
      })
      .expect(201);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_GuardarActividad',
      [
        23,
        2,
        1,
        JSON.stringify({
          identregable: 1,
          nombre: 'Diseño',
          minutosestimados: 60,
          asignaciones: [{ idtrabajador: 4, minutosasignados: 60 }],
        }),
        null,
        null,
        null,
      ],
    );
  });
  it.each([
    { revisionPlan: 1, datos: { nombre: 'Falta entregable' } },
    { revisionPlan: 1, datos: [] },
    {
      revisionPlan: 1,
      datos: {
        identregable: 1,
        nombre: 'Hito',
        eshito: true,
        minutosestimados: 60,
      },
    },
    { revisionPlan: 0, datos: { identregable: 1, nombre: 'A' } },
    { revisionPlan: 1, datos: { identregable: 1, nombre: ' ' } },
    {
      revisionPlan: 1,
      datos: { identregable: 1, nombre: 'A', minutosestimados: null },
    },
    {
      revisionPlan: 1,
      datos: {
        identregable: 1,
        nombre: 'A',
        fechanoiniciarantes: '2026-02-30',
      },
    },
    {
      revisionPlan: 1,
      datos: {
        identregable: 1,
        nombre: 'A',
        asignaciones: [
          { idtrabajador: 4, minutosasignados: 60 },
          { idtrabajador: 4, minutosasignados: 20 },
        ],
      },
    },
  ])('valida contenido anidado antes de SQL: %j', async (body) => {
    await request(app.getHttpServer() as Server)
      .post(base + '/2/actividades')
      .auth(token, { type: 'bearer' })
      .send(body)
      .expect(400);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it.each([
    ['40001', 409],
    ['P0001', 422],
  ] as const)('mapea %s al HTTP correspondiente', async (code, status) => {
    database.callFunctionSingle.mockRejectedValue({
      code,
      message: 'Las dependencias forman un ciclo',
    });
    const response = await request(app.getHttpServer() as Server)
      .post(base)
      .auth(token, { type: 'bearer' })
      .send(planCompleto)
      .expect(status);
    if (code === 'P0001')
      expect((response.body as { message: string }).message).toBe(
        'Las dependencias forman un ciclo',
      );
  });
  it('rechaza campos arbitrarios en previsualización', async () => {
    await request(app.getHttpServer() as Server)
      .post(base + '/2/previsualizar')
      .auth(token, { type: 'bearer' })
      .send({ cambios: { actividades: [{ idactividad: 1, idplan: 999 }] } })
      .expect(400);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('el selector obtiene al trabajador desde el actor', async () => {
    grant('control_operativo.actividades.ver', 'propios');
    database.executeQuery.mockResolvedValue([{ id: 7 }]);
    database.callFunctionSingle.mockResolvedValue({
      pla_ListarAsignacionesColaborador: { planes: [], asignaciones: [] },
    });
    await request(app.getHttpServer() as Server)
      .get('/api/planificacion/mis-asignaciones?fecha=2026-10-22')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_ListarAsignacionesColaborador',
      [23, 7, '2026-10-22', null],
    );
  });
  it('consulta las asignaciones de otra persona con alcance todos', async () => {
    grant('control_operativo.actividades.ver', 'todos');
    database.callFunctionSingle.mockResolvedValue({
      pla_ListarAsignacionesColaborador: { planes: [], asignaciones: [] },
    });
    await request(app.getHttpServer() as Server)
      .get('/api/planificacion/trabajadores/9/asignaciones?fecha=2026-10-22')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_ListarAsignacionesColaborador',
      [23, 9, '2026-10-22', null],
    );
  });
  it('rechaza las asignaciones de otra persona fuera del alcance', async () => {
    grant('control_operativo.actividades.ver', 'propios');
    database.executeQuery.mockResolvedValue([{ id: 7 }]);
    await request(app.getHttpServer() as Server)
      .get('/api/planificacion/trabajadores/9/asignaciones?fecha=2026-10-22')
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it.each(['reconectar', 'quitar'])(
    'elimina una actividad enviando el modo %s a SQL V2',
    async (dependencias) => {
      database.callFunctionSingle.mockResolvedValue({
        pla_EliminarActividadV2: {
          idactividad: 3,
          revisionplan: 5,
          dependenciasretiradas: 2,
          dependenciascreadas: [],
        },
      });
      await request(app.getHttpServer() as Server)
        .delete(base + '/2/actividades/3')
        .auth(token, { type: 'bearer' })
        .query({
          revisionPlan: 4,
          revision: 2,
          dependencias,
          motivo: 'Cambio de alcance',
        })
        .expect(200);
      expect(database.callFunctionSingle).toHaveBeenCalledWith(
        'pla_EliminarActividadV2',
        [23, 3, 4, 2, dependencias, 'Cambio de alcance'],
      );
    },
  );
  it('rechaza un modo de eliminación inválido antes de llamar a SQL', async () => {
    await request(app.getHttpServer() as Server)
      .delete(base + '/2/actividades/3')
      .auth(token, { type: 'bearer' })
      .query({ revisionPlan: 4, revision: 2, dependencias: 'borrar' })
      .expect(400);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('exige permiso de edición para analizar la eliminación', async () => {
    grant('proyectos.planificacion.ver');
    await request(app.getHttpServer() as Server)
      .get(base + '/2/actividades/3/eliminacion')
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('no admite idtrabajador en el selector', async () => {
    grant('control_operativo.actividades.ver', 'propios');
    await request(app.getHttpServer() as Server)
      .get(
        '/api/planificacion/mis-asignaciones?fecha=2026-10-22&idtrabajador=999',
      )
      .auth(token, { type: 'bearer' })
      .expect(400);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
});
