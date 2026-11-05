import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Logger as PinoLogger, LoggerModule } from 'nestjs-pino';
import request from 'supertest';
import { Writable } from 'node:stream';
import type { Server } from 'node:http';
import { createPinoHttpOptions } from '../src/bootstrap/pino-logger.config';
import { useRequestId } from '../src/bootstrap/apply-core-middlewares';
import { Environment } from '../src/config/env.validation';
import type * as FilterModule from '../src/presentation/filters/global-exception.filter';

interface LogRecord {
  level: number;
  requestId?: string;
  context?: string;
  msg?: string;
  password?: string;
  token?: string;
  req?: { url: string; method: string; requestId: string };
  res?: { statusCode: number };
  responseTime?: number;
  err?: { message: string; stack: string };
}

@Controller('logging-fixture')
class LoggingController {
  private readonly logger = new Logger('LoggingFixture');

  @Get()
  async success() {
    await new Promise<void>((resolve) => setImmediate(resolve));
    this.logger.log({
      event: 'fixture',
      password: 'never-password-secret',
      token: 'never-token-secret',
    });
    return { ok: true };
  }

  @Get('bad-request')
  badRequest() {
    throw new BadRequestException('Solicitud inválida');
  }

  @Post()
  body() {
    return { token: 'never-response-secret' };
  }

  @Get('error')
  error() {
    const error = new InternalServerErrorException('Fallo de prueba');
    Object.assign(error, { config: { token: 'never-error-config-secret' } });
    throw error;
  }
}

describe('Pino como logger de Nest y HTTP', () => {
  let app: INestApplication;
  const lines: string[] = [];
  const previous: Record<string, string | undefined> = {};
  const records = (): LogRecord[] =>
    lines.flatMap((line) =>
      line
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((part) => JSON.parse(part) as LogRecord),
    );

  beforeAll(async () => {
    const fixture = {
      FRONTEND_URLS: 'https://frontend.test',
      JWT_SECRET: 'fixture-only-secret',
      JWT_EXPIRES_IN: '1d',
      AUTODESK_CLIENT_ID: 'fixture-client',
      AUTODESK_CLIENT_SECRET: 'fixture-secret',
      AUTODESK_CALLBACK_URL: 'https://callback.test',
    };
    for (const [key, value] of Object.entries(fixture)) {
      previous[key] = process.env[key];
      process.env[key] ??= value;
    }
    const { GlobalExceptionFilter } = jest.requireActual<typeof FilterModule>(
      '../src/presentation/filters/global-exception.filter',
    );
    const stream = new Writable({
      write(chunk: Buffer, _encoding, callback) {
        lines.push(chunk.toString());
        callback();
      },
    });
    const module = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          pinoHttp: [
            createPinoHttpOptions({
              NODE_ENV: Environment.Test,
              LOG_LEVEL: 'info',
            }),
            stream,
          ],
        }),
      ],
      controllers: [LoggingController],
    }).compile();
    app = module.createNestApplication({ bufferLogs: true });
    app.useLogger(app.get(PinoLogger));
    useRequestId(app);
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  beforeEach(() => {
    lines.length = 0;
  });
  afterAll(async () => {
    await app.close();
    Logger.overrideLogger(false);
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('correlaciona cabecera, mensajes del servicio y una sola finalización HTTP', async () => {
    await request(app.getHttpServer() as Server)
      .get('/logging-fixture?access_token=never-query-secret')
      .set('X-Request-Id', 'request-demo-1')
      .set('Authorization', 'Bearer never-header-secret')
      .set('Cookie', 'session=never-cookie-secret')
      .expect('X-Request-Id', 'request-demo-1')
      .expect(200, { ok: true });

    const logs = records();
    const http = logs.filter((entry) => entry.res);
    expect(http).toHaveLength(1);
    expect(http[0]).toMatchObject({
      level: 30,
      requestId: 'request-demo-1',
      req: {
        url: '/logging-fixture',
        method: 'GET',
        requestId: 'request-demo-1',
      },
      res: { statusCode: 200 },
    });
    expect(http[0].responseTime).toEqual(expect.any(Number));
    expect(
      logs.find((entry) => entry.context === 'LoggingFixture'),
    ).toMatchObject({
      requestId: 'request-demo-1',
      password: '[REDACTED]',
      token: '[REDACTED]',
    });
    expect(lines.join('')).not.toMatch(
      /never-(query|header|cookie|password|token)-secret/,
    );
  });

  it.each([
    ['bad-request', 400, 40],
    ['missing', 404, 40],
    ['error', 500, 50],
  ])('registra %s con HTTP %s y nivel %s', async (path, status, level) => {
    await request(app.getHttpServer() as Server)
      .get(`/logging-fixture/${path}`)
      .expect(status);
    const http = records().filter((entry) => entry.res);
    expect(http).toHaveLength(1);
    expect(http[0]).toMatchObject({ level, res: { statusCode: status } });
    if (status === 500) {
      expect(http[0].err?.message).toBe('Fallo de prueba');
      expect(http[0].err?.stack).toContain('InternalServerErrorException');
      expect(lines.join('')).not.toContain('never-error-config-secret');
    }
  });

  it('genera UUID cuando falta el ID o la cabecera es inválida', async () => {
    for (const header of [undefined, 'un id invalido', 'a'.repeat(129)]) {
      const pending = request(app.getHttpServer() as Server).get(
        '/logging-fixture',
      );
      if (header) pending.set('X-Request-Id', header);
      const response = await pending.expect(200);
      expect(response.headers['x-request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    }
  });

  it('omite cuerpos de solicitud y respuesta', async () => {
    await request(app.getHttpServer() as Server)
      .post('/logging-fixture')
      .send({ password: 'never-request-body-secret' })
      .expect(201, { token: 'never-response-secret' });
    expect(records().filter((entry) => entry.res)).toHaveLength(1);
    expect(lines.join('')).not.toMatch(/never-(request-body|response)-secret/);
  });

  it('mantiene aislados los contextos de solicitudes simultáneas', async () => {
    await Promise.all(
      ['concurrent-1', 'concurrent-2'].map((id) =>
        request(app.getHttpServer() as Server)
          .get('/logging-fixture')
          .set('X-Request-Id', id)
          .expect(200),
      ),
    );
    const appLogs = records().filter(
      (entry) => entry.context === 'LoggingFixture',
    );
    expect(appLogs.map((entry) => entry.requestId).sort()).toEqual([
      'concurrent-1',
      'concurrent-2',
    ]);
    expect(records().filter((entry) => entry.res)).toHaveLength(2);
  });
});
