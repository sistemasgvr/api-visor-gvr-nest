import {
  Controller,
  Get,
  HttpException,
  Post,
  Body,
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { UnauthenticatedError } from '../src/application/errors/application.error';
import { toApplicationFailure } from '../src/infrastructure/runtime/application-failure.adapter';
import { LoginDto } from '../src/presentation/dtos/login.dto';
import { spanishValidationExceptionFactory } from '../src/presentation/validation/spanish-validation-messages';
import type * as FilterModule from '../src/presentation/filters/global-exception.filter';

@Controller('compatibility-fixture')
class CompatibilityController {
  @Get('refresh-error')
  refresh() {
    throw new UnauthenticatedError({
      message: 'Sesión inválida o expirada',
      code: 'AUTH_REFRESH_SESSION_INVALID',
    });
  }

  @Get('provider-error')
  provider() {
    throw toApplicationFailure(
      new HttpException(
        { message: 'Límite de solicitudes', code: 'RATE_LIMIT' },
        429,
      ),
    );
  }

  @Post('login-input')
  input(@Body() input: LoginDto) {
    return { correo: input.correo };
  }
}

describe('Compatibilidad del borde HTTP', () => {
  let app: INestApplication;
  const previous: Record<string, string | undefined> = {};

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
    const module = await Test.createTestingModule({
      controllers: [CompatibilityController],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        exceptionFactory: spanishValidationExceptionFactory,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('mantiene el estado, mensaje y código de negocio de refresh', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/compatibility-fixture/refresh-error')
      .expect(401);
    expect(response.body).toMatchObject({
      status: 401,
      message: 'Sesión inválida o expirada',
      code: 'AUTH_REFRESH_SESSION_INVALID',
    });
  });

  it('mantiene el estado y código originales de un proveedor', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/compatibility-fixture/provider-error')
      .expect(429);
    expect(response.body).toMatchObject({
      status: 429,
      message: 'Límite de solicitudes',
      code: 'RATE_LIMIT',
    });
  });

  it('los DTO HTTP siguen validando el correo y la longitud de contraseña', async () => {
    await request(app.getHttpServer() as Server)
      .post('/compatibility-fixture/login-input')
      .send({ correo: 'invalid', contrasena: 'x' })
      .expect(400);
    const response = await request(app.getHttpServer() as Server)
      .post('/compatibility-fixture/login-input')
      .send({ correo: 'user@example.test', contrasena: 'secret123' })
      .expect(201);
    expect(response.body).toEqual({ correo: 'user@example.test' });
  });
});
