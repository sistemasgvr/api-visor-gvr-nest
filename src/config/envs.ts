/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { validate } from './env.validation';
import { buildCorsAllowedOrigins } from './cors-origins.util';

const rootEnvPath = join(__dirname, '..', '..', '.env');
if (existsSync(rootEnvPath)) {
  loadDotenv({ path: rootEnvPath });
} else {
  loadDotenv();
}

interface EnvsVars {
  PORT: number;
  HOST?: string;
  NODE_ENV: string;
  DB_HOST?: string;
  DB_PORT?: number;
  DB_USERNAME?: string;
  DB_PASSWORD?: string;
  DB_DATABASE?: string;
  DB_SYNCHRONIZE: boolean;
  DB_LOGGING: boolean;
  DATABASE_URL?: string;
  FRONTEND_URLS: string;
  COLLABORA_URL?: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  AUTODESK_CLIENT_ID: string;
  AUTODESK_CLIENT_SECRET: string;
  AUTODESK_CALLBACK_URL: string;
}

const envsVars: EnvsVars = validate(process.env);

export const envs = {
  port: envsVars.PORT,
  host: envsVars.HOST ?? '0.0.0.0',
  nodeEnv: envsVars.NODE_ENV,
  dbHost: envsVars.DB_HOST,
  dbPort: envsVars.DB_PORT,
  dbUsername: envsVars.DB_USERNAME,
  dbPassword: envsVars.DB_PASSWORD,
  dbDatabase: envsVars.DB_DATABASE,
  dbSynchronize: envsVars.DB_SYNCHRONIZE,
  dbLogging: envsVars.DB_LOGGING,
  databaseUrl: envsVars.DATABASE_URL,
  frontendUrls: buildCorsAllowedOrigins(
    envsVars.FRONTEND_URLS.split(',')
      .map((u) => u.trim())
      .filter(Boolean),
  ),
  collaboraUrl: envsVars.COLLABORA_URL?.trim() || '',
  jwtSecret: envsVars.JWT_SECRET,
  jwtExpiresIn: envsVars.JWT_EXPIRES_IN,
  autodeskClientId: envsVars.AUTODESK_CLIENT_ID,
  autodeskClientSecret: envsVars.AUTODESK_CLIENT_SECRET,
  autodeskCallbackUrl: envsVars.AUTODESK_CALLBACK_URL,
};
