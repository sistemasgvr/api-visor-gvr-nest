import { z } from 'zod';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}
const numberFromEnvironment = (value: unknown) =>
  typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
const booleanFromEnvironment = (value: unknown) =>
  typeof value === 'string' && /^(true|false)$/i.test(value)
    ? value.toLowerCase() === 'true'
    : value;
/** Esquema único para ConfigModule y la configuración tipada del proceso. */
export const environmentSchema = z.looseObject({
  PORT: z.preprocess(numberFromEnvironment, z.number().default(4001)),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(Environment).default(Environment.Development),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
    .default('info'),
  LOG_PRETTY: z.preprocess(booleanFromEnvironment, z.boolean().optional()),
  DB_HOST: z.string().optional(),
  DB_PORT: z.preprocess(numberFromEnvironment, z.number().optional()),
  DB_USERNAME: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_DATABASE: z.string().optional(),
  DB_SYNCHRONIZE: z.preprocess(
    booleanFromEnvironment,
    z.boolean().default(false),
  ),
  DB_LOGGING: z.preprocess(booleanFromEnvironment, z.boolean().default(false)),
  DATABASE_URL: z.string().optional(),
  FRONTEND_URLS: z.string().min(1),
  COLLABORA_URL: z.string().optional(),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1),
  AUTODESK_CLIENT_ID: z.string().min(1),
  AUTODESK_CLIENT_SECRET: z.string().min(1),
  AUTODESK_CALLBACK_URL: z.string().min(1),
});
export type EnvironmentVariables = z.infer<typeof environmentSchema>;
export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const result = environmentSchema.safeParse(config);
  if (!result.success)
    throw new Error(
      'Error de validación de configuración: ' +
        result.error.issues
          .map((issue) => issue.path.join('.') + ' no tiene un valor válido')
          .join('; '),
    );
  return result.data;
}
