import {
  ArgumentsHost,
  Catch,
  Controller,
  Get,
  type INestApplication,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import type { Server } from 'node:http';
import type { Response } from 'express';
import request from 'supertest';
import { AuthorizationModule } from '../src/composition/modules/platform/authorization.module';
import { DatabaseFunctionService } from '../src/infrastructure/database/database-function.service';
import { GranularPermissionsService } from '../src/application/services/granular-permissions.service';
import { ApplicationFailure } from '../src/application/errors/application.error';
import { failureHttpStatus } from '../src/infrastructure/runtime/application-failure.adapter';
import { RequireGranularPermission } from '../src/infrastructure/auth/granular-permission.guard';

@Controller('granular-fixture')
class ProtectedFixture {
  @Get()
  @RequireGranularPermission('seguridad.roles.ver')
  execute() {
    return { ok: true };
  }
}

@Catch(ApplicationFailure)
class ApplicationFailureFixtureFilter {
  catch(error: ApplicationFailure, host: ArgumentsHost) {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(failureHttpStatus[error.kind])
      .json({ message: error.message });
  }
}

describe('HTTP de autorización con JWT real y persistencia simulada (sin SQL)', () => {
  let app: INestApplication;
  let token: string;
  const database = { callFunction: jest.fn(), callFunctionSingle: jest.fn() };
  const dataSource = {
    isInitialized: true,
    entityMetadatas: [],
    options: { type: 'postgres' },
    query: jest.fn(),
    destroy: jest.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AuthorizationModule],
      controllers: [ProtectedFixture],
    })
      .overrideProvider(ConfigService)
      .useValue(
        new ConfigService({
          JWT_SECRET: 'authorization-test-secret',
          JWT_EXPIRES_IN: '1h',
        }),
      )
      .overrideProvider(getDataSourceToken())
      .useValue(dataSource)
      .overrideProvider(DatabaseFunctionService)
      .useValue(database)
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new ApplicationFailureFixtureFilter());
    await app.init();
    token = module.get(JwtService).sign({
      sub: 7,
      roles: [{ nombre: 'Administrador' }],
      permisos: ['todo'],
    });
    expect(module.get(GranularPermissionsService)).toBeDefined();
  });
  afterAll(async () => {
    await app?.close();
    expect(dataSource.query).not.toHaveBeenCalled();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    database.callFunction.mockResolvedValue([
      { codigo: 'seguridad.roles.asignar_permisos', alcances: ['global'] },
    ]);
    database.callFunctionSingle.mockResolvedValue({
      auth_SincronizarPermisosRolV2: {
        idrol: 2,
        revision: 4,
        modificado: true,
      },
    });
  });

  it('rechaza solicitudes sin JWT antes de consultar permisos', async () => {
    await request(app.getHttpServer() as Server)
      .get('/api/autorizacion/me')
      .expect(401);
    expect(database.callFunction).not.toHaveBeenCalled();
  });

  it('usa el actor del JWT y entrega cambios con revisión nueva', async () => {
    const result = await request(app.getHttpServer() as Server)
      .put('/api/autorizacion/roles/2/permisos')
      .auth(token, { type: 'bearer' })
      .send({
        revision: 3,
        permisos: [{ idpermiso: 42, alcances: ['asignados'] }],
      })
      .expect(200);
    expect((result.body as { data: unknown }).data).toEqual({
      idrol: 2,
      revision: 4,
      modificado: true,
    });
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'auth_SincronizarPermisosRolV2',
      [7, 2, '[{"idpermiso":42,"alcances":["asignados"]}]', 3],
    );
  });

  it.each([
    { permisos: [] },
    { revision: 3, permisos: null },
    { revision: 3, permisos: [], idactor: 99 },
    { revision: 3, permisos: [{ idpermiso: 42, alcances: ['admin'] }] },
    {
      revision: 3,
      permisos: [
        { idpermiso: 42, alcances: ['global'] },
        { idpermiso: 42, alcances: ['asignados'] },
      ],
    },
  ])('rechaza cuerpo ambiguo o identidad inyectada: %j', async (body) => {
    await request(app.getHttpServer() as Server)
      .put('/api/autorizacion/roles/2/permisos')
      .auth(token, { type: 'bearer' })
      .send(body)
      .expect(400);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });

  it('no convierte visibilidad del contenedor en acceso directo', async () => {
    database.callFunctionSingle.mockResolvedValue({
      gen_UsuarioTieneAccesoMenuV2: false,
    });
    const result = await request(app.getHttpServer() as Server)
      .get('/api/autorizacion/menus/9/acceso')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect((result.body as { data: unknown }).data).toEqual({
      permitido: false,
    });
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'gen_UsuarioTieneAccesoMenuV2',
      [7, 9],
    );
  });

  it('deniega el guard aunque el JWT diga Administrador y observa la revocación', async () => {
    database.callFunction
      .mockResolvedValueOnce([
        { codigo: 'seguridad.roles.ver', alcances: ['global'] },
      ])
      .mockResolvedValueOnce([]);
    await request(app.getHttpServer() as Server)
      .get('/api/granular-fixture')
      .auth(token, { type: 'bearer' })
      .expect(200);
    await request(app.getHttpServer() as Server)
      .get('/api/granular-fixture')
      .auth(token, { type: 'bearer' })
      .expect(403);
    expect(database.callFunction).toHaveBeenCalledTimes(2);
  });

  it('el guard global valida el JWT antes de usar su identidad', async () => {
    await request(app.getHttpServer() as Server)
      .get('/api/granular-fixture')
      .auth('token-invalido', { type: 'bearer' })
      .expect(401);
    expect(database.callFunction).not.toHaveBeenCalled();
  });

  it('rechaza administración sin concesiones sin llamar a la función de escritura', async () => {
    database.callFunction.mockResolvedValue([]);
    await request(app.getHttpServer() as Server)
      .put('/api/autorizacion/roles/2/permisos')
      .auth(token, { type: 'bearer' })
      .send({ revision: 3, permisos: [] })
      .expect(403);
    expect(database.callFunctionSingle).not.toHaveBeenCalled();
  });

  it('traduce revisión obsoleta a HTTP 409 para que el cliente recargue', async () => {
    database.callFunctionSingle.mockRejectedValue({ code: '40001' });
    await request(app.getHttpServer() as Server)
      .put('/api/autorizacion/roles/2/permisos')
      .auth(token, { type: 'bearer' })
      .send({ revision: 3, permisos: [] })
      .expect(409);
  });
});
