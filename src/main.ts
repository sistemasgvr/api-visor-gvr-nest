import { webcrypto } from 'crypto';

// Polyfill para crypto.randomUUID() - debe estar ANTES de cualquier otra importación de NestJS
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, raw, urlencoded } from 'express';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { envs } from './config';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Main.ts');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use('/api/wopi/files', raw({ type: '*/*', limit: '200mb' }));

  // Configurar validación global
  app.use(json({ limit: '50mb' }));
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

  // Configurar CORS: frontend + orígenes WOPI (Collabora). Sin origin = permitir (peticiones server-to-server)
  const allowedOrigins = [...envs.frontendUrls, ...(envs.wopiAllowedOrigins || [])];
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true); // Collabora server-to-server sin Origin
      if (allowedOrigins.some((o) => origin === o || origin === o.replace(/\/$/, '')))
        return callback(null, true);
      callback(null, false);
    },
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders:
      'Content-Type, Authorization, X-Requested-With, User-Agent, X-WOPI-Host, X-WOPI-Access-Token, X-WOPI-Lock, X-WOPI-OldLock, X-WOPI-Override, X-WOPI-RelativeTarget',
    exposedHeaders: 'Authorization',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // Servir fotos de perfil (uploads/profiles)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(envs.port || 4001, '0.0.0.0');
  
  // Verificar estado de la base de datos
  try {
    const dataSource = app.get(DataSource);
    const isConnected = dataSource.isInitialized;
    logger.log(`📊 Database: ${isConnected ? '✅ Connected' : '❌ Not connected'}`);
  } catch (error) {
    logger.log(`📊 Database: ❌ Connection check failed`);
  }
  
  logger.log(`🚀 Application is running on: http://0.0.0.0:${envs.port || 4001}/api`);
}
bootstrap();
