import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import request from 'supertest';
import { HealthModule } from '../src/presentation/modules/health.module';

describe('API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health devuelve estado y metadatos', async () => {
    const res = await request(app.getHttpServer() as Server)
      .get('/api/health')
      .expect(200);
    const body = res.body as {
      status: string;
      timestamp: string;
      uptime: number;
      environment: string;
    };
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('uptime');
    expect(body).toHaveProperty('environment');
  });
});
