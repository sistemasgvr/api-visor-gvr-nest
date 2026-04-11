import { webcrypto } from 'crypto';

// Polyfill para crypto.randomUUID() - debe estar ANTES de cualquier otra importación de NestJS
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { json, urlencoded, raw } from 'express';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { envs } from './config';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Main.ts');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // WOPI PutFile: Collabora envía el archivo como body binario (no JSON). Hay que leerlo como raw ANTES de json().
  app.use((req: any, res, next) => {
    if (
      req.method === 'POST' &&
      req.url &&
      req.url.includes('/collabora/wopi/files/') &&
      req.url.includes('/contents')
    ) {
      return raw({ type: () => true, limit: '50mb' })(req, res, (err: any) => {
        if (err) return next(err);
        req.rawBody = req.body;
        next();
      });
    }
    next();
  });

  // Configurar validación global (json solo aplica a application/json; WOPI PutFile ya tiene req.rawBody)
  app.use(json({
    limit: '50mb',
    verify: (req: any, res, buf) => {
      if (req.url && req.url.includes('/collabora/wopi/files/') && req.url.includes('/contents')) {
        req.rawBody = req.rawBody || buf;
      }
    },
  }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true, // Transforma los payloads a instancias de DTO
    }),
  );

  // Configurar interceptor de logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Configurar filtro global de excepciones
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Configurar CORS: frontend + Collabora. Sin origin = permitir (peticiones server-to-server)
  // Safari/iOS: credentials: true + origin exacto; si en el futuro se usan cookies, deben ser SameSite=None; Secure.
  const allowedOrigins = [...envs.frontendUrls];
  if (envs.collaboraUrl) {
    allowedOrigins.push(envs.collaboraUrl);
  }

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true); // Collabora server-to-server sin Origin
      const normalized = origin.replace(/\/$/, '');
      if (allowedOrigins.some((o) => origin === o || normalized === o.replace(/\/$/, '')))
        return callback(null, true);
      callback(null, false);
    },
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders:
      'Content-Type, Accept, Accept-Language, Authorization, X-Requested-With, User-Agent, X-WOPI-Override, X-WOPI-Lock, X-WOPI-Editors, X-LOOL-WOPI-IsModifiedByUser, X-LOOL-WOPI-IsAutosave',
    exposedHeaders: 'Authorization, Content-Length, Content-Type',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Prefijo global para todas las rutas de la API
  app.setGlobalPrefix('api');

  // Servir fotos de perfil (uploads/profiles)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Documentación OpenAPI con Scalar (https://scalar.com)
  const config = new DocumentBuilder()
    .setTitle('API Visor GVR')
    .setDescription('Documentación de la API del sistema Visor GVR. Usa **Authorize** para ingresar tu JWT Bearer token y probar las rutas protegidas.')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addSecurityRequirements('access-token') // Por defecto todas las rutas requieren autenticación
    .addTag('auth', 'Autenticación y sesiones')
    .addTag('health', 'Estado del servicio')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Scalar: documentación interactiva en /api/docs
  app.use(
    '/api/docs',
    apiReference({
      content: document,
      theme: 'elysiajs',
    }),
  );

  // Exponer OpenAPI JSON en /api/openapi.json (para consumo externo)
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter.get) {
    httpAdapter.get('/api/openapi.json', (req: any, res: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(document);
    });
  }

  //await app.listen(envs.port || 4001, envs.host);
  // Deja que el servidor decida la interfaz (escuchar en 0.0.0.0 por defecto)
  await app.listen(process.env.PORT || 3000, '0.0.0.0');

  // Verificar estado de la base de datos
  try {
    const dataSource = app.get(DataSource);
    const isConnected = dataSource.isInitialized;
    logger.log(`📊 Database: ${isConnected ? '✅ Connected' : '❌ Not connected'}`);
  } catch (error) {
    logger.log(`📊 Database: ❌ Connection check failed`);
  }

  const port = envs.port || 4001;
  const host = envs.host;
  logger.log(`🚀⭐ Application is running on: http://${host}:${port}/api`);
  logger.log(`📖 API Docs (Scalar): http://${host}:${port}/api/docs`);
}
bootstrap();
