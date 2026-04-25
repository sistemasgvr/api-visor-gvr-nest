import {
  IsString,
  IsInt,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  PORT: number;

  @IsString()
  DB_HOST: string;

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  DB_SYNCHRONIZE: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  DB_LOGGING: boolean;

  // Autodesk ACC Configuration
  @IsString()
  AUTODESK_CLIENT_ID: string;

  @IsString()
  AUTODESK_CLIENT_SECRET: string;

  @IsString()
  AUTODESK_CALLBACK_URL: string;

  // Frontend URLs (opcional)
  @IsOptional()
  @IsString()
  FRONTEND_URLS?: string;

  // Collabora Online Configuration
  @IsOptional()
  @IsString()
  COLLABORA_URL?: string;

  // Backend public URL (para callbacks y descargas)
  @IsOptional()
  @IsString()
  BACKEND_PUBLIC_URL?: string;

  // --- Correo (SMTP vía Nodemailer; SendGrid/SES/Mailgun suelen exponer SMTP) ---
  @IsOptional()
  @IsString()
  MAIL_ENABLED?: string;

  @IsOptional()
  @IsString()
  MAIL_SMTP_HOST?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const n = parseInt(String(value), 10);
    return Number.isFinite(n) ? n : undefined;
  })
  @IsInt()
  MAIL_SMTP_PORT?: number;

  @IsOptional()
  @IsString()
  MAIL_SMTP_SECURE?: string;

  @IsOptional()
  @IsString()
  MAIL_SMTP_USER?: string;

  @IsOptional()
  @IsString()
  MAIL_SMTP_PASS?: string;

  @IsOptional()
  @IsString()
  MAIL_FROM_ADDRESS?: string;

  @IsOptional()
  @IsString()
  MAIL_FROM_NAME?: string;

  /** true + REDIS_HOST activa BullMQ para la cola `mail` */
  @IsOptional()
  @IsString()
  MAIL_USE_QUEUE?: string;

  @IsOptional()
  @IsString()
  REDIS_HOST?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const n = parseInt(String(value), 10);
    return Number.isFinite(n) ? n : undefined;
  })
  @IsInt()
  REDIS_PORT?: number;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = new EnvironmentVariables();
  Object.assign(validatedConfig, config);
  return validatedConfig;
}
