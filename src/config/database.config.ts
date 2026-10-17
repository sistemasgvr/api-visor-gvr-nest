import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const enabled = (key: string) => {
    const value = configService.get<string | boolean>(key);
    return value === true || value === 'true';
  };
  const sslSetting = configService.get<string | boolean>('DB_SSL');
  const ssl =
    sslSetting === false || sslSetting === 'false'
      ? false
      : { rejectUnauthorized: false };

  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: enabled('DB_SYNCHRONIZE'),
      logging: enabled('DB_LOGGING'),
      ssl,
      extra: {
        connectionTimeoutMillis: 10000,
        /** Fechas CURRENT_* y casts timestamp en funciones SQL alineadas a Perú. */
        options: '-c timezone=America/Lima',
      },
      retryAttempts: 5,
      retryDelay: 3000,
    };
  }

  // Fallback a configuración individual
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: enabled('DB_SYNCHRONIZE'),
    logging: enabled('DB_LOGGING'),
    ssl,
    extra: {
      connectionTimeoutMillis: 10000,
      family: 4,
      options: '-c timezone=America/Lima',
    },
    retryAttempts: 5,
    retryDelay: 3000,
  };
};
