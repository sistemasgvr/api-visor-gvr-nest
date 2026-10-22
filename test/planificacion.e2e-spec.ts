import {
  ArgumentsHost,
  Catch,
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { Server } from 'node:http';
import type { Response } from 'express';
import { PlanificacionModule } from '../src/composition/modules/planificacion.module';
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
      imports: [PlanificacionModule],
    })
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
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    token = module.get(JwtService).sign({ sub: 23, roles: [], permisos: [] });
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
    { idaprobador: 0 },
    { idaprobador: 2, actor: 999 },
    { idaprobador: null },
  ])('400 con cuerpo inválido o actor inyectado: %j', async (body) => {
    await request(app.getHttpServer() as Server)
      .post(base)
      .auth(token, { type: 'bearer' })
      .send(body)
      .expect(400);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });
  it('crea con actor del JWT y devuelve 201', async () => {
    await request(app.getHttpServer() as Server)
      .post(base)
      .auth(token, { type: 'bearer' })
      .send({ idaprobador: 4 })
      .expect(201);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_CrearPlanProyecto',
      [23, 8, 4],
    );
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
      .send({})
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
      pla_ListarAsignacionesColaborador: [],
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
