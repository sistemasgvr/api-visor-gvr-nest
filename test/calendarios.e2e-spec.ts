import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import type { Server } from 'node:http';
import request from 'supertest';
import { CalendariosModule } from '../src/composition/modules/calendarios.module';
import { spanishValidationExceptionFactory } from '../src/presentation/validation/spanish-validation-messages';
import type * as FilterModule from '../src/presentation/filters/global-exception.filter';

describe('Configuración HTTP de calendarios', () => {
  let app: INestApplication;
  let token: string;
  let jwt: JwtService;
  const query = jest.fn();
  const previous: Record<string, string | undefined> = {};
  const detalle = {
    calendario: { id: 6, revision: 2 },
    version: { id: 9, revision: 4 },
    semana: [],
    excepciones: [],
    versiones: [],
    minutossemanales: 0,
  };
  const base = '/api/planificacion/calendarios';

  beforeAll(async () => {
    const settings: Record<string, string> = {
      JWT_SECRET: 'calendar-http-tests-only',
      JWT_EXPIRES_IN: '1h',
      DATABASE_URL: 'postgresql://unused:unused@127.0.0.1/unused',
    };
    const fixture = {
      FRONTEND_URLS: 'https://frontend.test',
      JWT_SECRET: settings.JWT_SECRET,
      JWT_EXPIRES_IN: '1h',
      AUTODESK_CLIENT_ID: 'test-client',
      AUTODESK_CLIENT_SECRET: 'test-secret',
      AUTODESK_CALLBACK_URL: 'https://callback.test',
    };
    for (const [key, value] of Object.entries(fixture)) {
      previous[key] = process.env[key];
      process.env[key] = value;
    }
    const { GlobalExceptionFilter } = jest.requireActual<typeof FilterModule>(
      '../src/presentation/filters/global-exception.filter',
    );
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        CalendariosModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue({ get: (key: string) => settings[key] })
      .overrideProvider(getDataSourceToken())
      .useValue({
        isInitialized: true,
        entityMetadatas: [],
        options: { type: 'postgres' },
        query,
        destroy: jest.fn(),
        getRepository: jest.fn(),
      })
      .setLogger({ log() {}, warn() {}, error() {} })
      .compile();
    jwt = module.get(JwtService);
    token = jwt.sign({
      sub: 23,
      correo: 'calendar@example.test',
      nombre: 'Prueba',
      roles: [{ id: 1 }],
      permisos: [],
    });
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: spanishValidationExceptionFactory,
      }),
    );
    await app.init();
    expect(query).not.toHaveBeenCalled();
  });

  beforeEach(() => query.mockReset());
  afterAll(async () => {
    await app?.close();
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('rechaza peticiones sin JWT, con firma ajena o con token expirado antes de consultar SQL', async () => {
    await request(app.getHttpServer() as Server)
      .get(base)
      .expect(401);
    const forged = jwt.sign({ sub: 23 }, { secret: 'untrusted-test-key' });
    await request(app.getHttpServer() as Server)
      .get(base)
      .auth(forged, { type: 'bearer' })
      .expect(401);
    const expired = jwt.sign({ sub: 23 }, { expiresIn: -1 });
    await request(app.getHttpServer() as Server)
      .get(base)
      .auth(expired, { type: 'bearer' })
      .expect(401);
    expect(query).not.toHaveBeenCalled();
  });

  it('conserva paginación, estado cero y JSONB usando el servicio SQL existente', async () => {
    const listado = {
      data: [],
      pagination: { total: 0, limit: 5, offset: 10 },
    };
    query.mockResolvedValueOnce([{ pla_ListarCalendarios: listado }]);
    const response = await request(app.getHttpServer() as Server)
      .get(base + '?estado=0&limit=5&offset=10')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(response.body).toMatchObject({ status: 200, data: listado });
    expect(query).toHaveBeenCalledWith(
      'SELECT * FROM "pla_ListarCalendarios"($1, $2, $3, $4, $5)',
      [23, '', 0, 5, 10],
    );
  });

  it('crea con el usuario del JWT y rechaza suplantación desde el cuerpo', async () => {
    query.mockResolvedValueOnce([{ pla_CrearCalendario: detalle }]);
    const response = await request(app.getHttpServer() as Server)
      .post(base)
      .auth(token, { type: 'bearer' })
      .send({ nombre: ' Remoto ' })
      .expect(201);
    expect(response.body).toMatchObject({ status: 201, data: detalle });
    expect(query).toHaveBeenLastCalledWith(
      'SELECT * FROM "pla_CrearCalendario"($1, $2, $3, $4)',
      [23, 'Remoto', '', 'America/Lima'],
    );
    query.mockClear();
    await request(app.getHttpServer() as Server)
      .post(base)
      .auth(token, { type: 'bearer' })
      .send({ nombre: 'Remoto', idusuario: 99 })
      .expect(400);
    expect(query).not.toHaveBeenCalled();
  });

  it('guarda semana ISO completa y bloquea horarios imposibles antes del driver', async () => {
    const semana = Array.from({ length: 7 }, (_, i) => ({
      diasemana: i + 1,
      laborable: i < 5,
      horaentrada: i < 5 ? '08:00' : null,
      horasalida: i < 5 ? '17:00' : null,
      minutosrefrigerio: i < 5 ? 60 : 0,
    }));
    query.mockResolvedValueOnce([{ pla_GuardarJornadaSemanal: detalle }]);
    await request(app.getHttpServer() as Server)
      .put(base + '/versiones/9/semana')
      .auth(token, { type: 'bearer' })
      .send({ revision: 4, zonahoraria: 'America/Lima', semana })
      .expect(200);
    expect(query).toHaveBeenCalledWith(
      'SELECT * FROM "pla_GuardarJornadaSemanal"($1, $2, $3, $4, $5)',
      [23, 9, 4, 'America/Lima', JSON.stringify(semana)],
    );
    query.mockClear();
    semana[0].horasalida = '07:00';
    await request(app.getHttpServer() as Server)
      .put(base + '/versiones/9/semana')
      .auth(token, { type: 'bearer' })
      .send({ revision: 4, zonahoraria: 'America/Lima', semana })
      .expect(400);
    expect(query).not.toHaveBeenCalled();
  });

  it('permite desactivar una excepción preservando minutos cero y el ID del path', async () => {
    query.mockResolvedValueOnce([{ pla_GuardarExcepcionCalendario: detalle }]);
    await request(app.getHttpServer() as Server)
      .put(base + '/versiones/9/excepciones/15')
      .auth(token, { type: 'bearer' })
      .send({
        revision: 4,
        fecha: '2026-12-24',
        nombre: 'Prueba manual',
        idtipo: 617,
        minutosefectivos: 0,
        activo: false,
      })
      .expect(200);
    expect(query).toHaveBeenCalledWith(
      'SELECT * FROM "pla_GuardarExcepcionCalendario"($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [23, 9, 4, '2026-12-24', 'Prueba manual', 617, 0, false, 15],
    );
  });

  it('elimina con revisión de query y conserva el detalle actualizado', async () => {
    query.mockResolvedValueOnce([{ pla_EliminarExcepcionCalendario: detalle }]);
    const response = await request(app.getHttpServer() as Server)
      .delete(base + '/versiones/9/excepciones/15?revision=4')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(response.body).toMatchObject({ data: detalle });
    expect(query).toHaveBeenCalledWith(
      'SELECT * FROM "pla_EliminarExcepcionCalendario"($1, $2, $3, $4)',
      [23, 9, 4, 15],
    );
  });

  it.each([
    ['23505', 409, 'CALENDARIOS_DUPLICADO'],
    ['40001', 409, 'CALENDARIOS_REVISION_OBSOLETA'],
    ['55000', 409, 'CALENDARIOS_ESTADO_INCOMPATIBLE'],
    ['P0002', 404, 'CALENDARIOS_NO_ENCONTRADO'],
    ['22023', 400, 'CALENDARIOS_DATOS_INVALIDOS'],
    ['42883', 500, 'CALENDARIOS_ERROR_INTERNO'],
  ])(
    'traduce %s a HTTP %s sin filtrar información SQL',
    async (code, status, expectedCode) => {
      query.mockRejectedValueOnce({ code, message: 'consulta SQL privada' });
      const response = await request(app.getHttpServer() as Server)
        .post(base + '/versiones/9/publicar')
        .auth(token, { type: 'bearer' })
        .send({ revision: 4 })
        .expect(status);
      expect(response.body).toMatchObject({ status, code: expectedCode });
      expect(JSON.stringify(response.body)).not.toContain('SQL privada');
    },
  );

  it('respeta la denegación SQL aunque el JWT incluya un rol administrador', async () => {
    query.mockRejectedValueOnce({ driverError: { code: '42501' } });
    const response = await request(app.getHttpServer() as Server)
      .post(base)
      .auth(token, { type: 'bearer' })
      .send({ nombre: 'Calendario' })
      .expect(403);
    expect(response.body).toMatchObject({
      code: 'CALENDARIOS_ACCESO_DENEGADO',
    });
  });

  it.each([
    '/0',
    '/2147483648',
    '?limit=101',
    '?offset=-1',
    '?estado=2',
    '/6?idversion=0',
    '/versiones/9/disponibilidad?desde=2026-02-30&hasta=2026-03-01',
    '/versiones/9/disponibilidad?desde=2026-03-02&hasta=2026-03-01',
    '/versiones/9/disponibilidad?desde=2024-01-01&hasta=2025-01-01',
  ])('rechaza entrada inválida %s sin llamar al driver', async (path) => {
    await request(app.getHttpServer() as Server)
      .get(base + path)
      .auth(token, { type: 'bearer' })
      .expect(400);
    expect(query).not.toHaveBeenCalled();
  });

  it('rechaza fechas con hora, IDs de tipo inválidos y activo nulo', async () => {
    const data = {
      revision: 4,
      fecha: '2026-12-24',
      nombre: 'Ejemplo',
      idtipo: 617,
      minutosefectivos: 0,
    };
    for (const invalid of [
      { fecha: '2026-12-24T00:00:00Z' },
      { fecha: '2025-02-29' },
      { idtipo: 'Otro' },
      { idtipo: 0 },
      { idtipo: 1.5 },
      { idtipo: 2147483648 },
      { idtipo: null },
      { activo: null },
    ]) {
      await request(app.getHttpServer() as Server)
        .post(base + '/versiones/9/excepciones')
        .auth(token, { type: 'bearer' })
        .send({ ...data, ...invalid })
        .expect(400);
    }
    expect(query).not.toHaveBeenCalled();
  });

  it('acepta un ID nuevo sin enumeración estática y conserva nombres e IDs del catálogo', async () => {
    const actualizado = {
      ...detalle,
      version: {
        id: 9,
        revision: 5,
        estado: 1,
        idestado: 615,
        nombreestado: 'En preparación',
      },
      excepciones: [{ id: 15, idtipo: 900, tipo: 'Regional configurable' }],
    };
    query.mockResolvedValueOnce([
      { pla_GuardarExcepcionCalendario: actualizado },
    ]);
    const response = await request(app.getHttpServer() as Server)
      .post(base + '/versiones/9/excepciones')
      .auth(token, { type: 'bearer' })
      .send({
        revision: 4,
        fecha: '2026-12-24',
        nombre: 'Ejemplo',
        idtipo: 900,
        minutosefectivos: 0,
      })
      .expect(201);
    expect(query).toHaveBeenCalledWith(
      'SELECT * FROM "pla_GuardarExcepcionCalendario"($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [23, 9, 4, '2026-12-24', 'Ejemplo', 900, 0, true, null],
    );
    expect(response.body).toMatchObject({ data: actualizado });
  });

  it('exige idtipo y rechaza el campo textual anterior', async () => {
    for (const tipo of [{}, { tipo: 'Nacional' }]) {
      await request(app.getHttpServer() as Server)
        .post(base + '/versiones/9/excepciones')
        .auth(token, { type: 'bearer' })
        .send({
          revision: 4,
          fecha: '2026-12-24',
          nombre: 'Ejemplo',
          minutosefectivos: 0,
          ...tipo,
        })
        .expect(400);
    }
    expect(query).not.toHaveBeenCalled();
  });

  it('no expone los auxiliares internos como endpoints', async () => {
    await request(app.getHttpServer() as Server)
      .post(base + '/autorizar')
      .auth(token, { type: 'bearer' })
      .expect(404);
    await request(app.getHttpServer() as Server)
      .post(base + '/bloquear-borrador')
      .auth(token, { type: 'bearer' })
      .expect(404);
    expect(query).not.toHaveBeenCalled();
  });
});
