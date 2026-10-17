import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database.config';

describe('Conexión de base de datos por entorno', () => {
  const configuration = (values: Record<string, unknown>) => {
    const service = new ConfigService();
    jest.spyOn(service, 'get').mockImplementation((key: string) => values[key]);
    return service;
  };
  it('usa PostgreSQL local sin SSL y no interpreta false como verdadero', () => {
    const options = getDatabaseConfig(
      configuration({
        DATABASE_URL:
          'postgresql://local:fixture@127.0.0.1:5434/gvr_desarrollo',
        DB_SSL: 'false',
        DB_SYNCHRONIZE: 'false',
        DB_LOGGING: 'false',
      }),
    );
    expect(options).toMatchObject({
      ssl: false,
      synchronize: false,
      logging: false,
    });
  });

  it('conserva SSL por defecto para la conexión remota', () => {
    const options = getDatabaseConfig(
      configuration({
        DATABASE_URL: 'postgresql://remote:fixture@database.example/test',
      }),
    );
    expect(options).toMatchObject({
      ssl: { rejectUnauthorized: false },
      synchronize: false,
      logging: false,
    });
  });

  it('admite booleanos y conexión por campos individuales', () => {
    const options = getDatabaseConfig(
      configuration({
        DB_HOST: '127.0.0.1',
        DB_PORT: 5434,
        DB_DATABASE: 'gvr_desarrollo',
        DB_SSL: false,
        DB_SYNCHRONIZE: false,
        DB_LOGGING: true,
      }),
    );
    expect(options).toMatchObject({
      host: '127.0.0.1',
      port: 5434,
      ssl: false,
      synchronize: false,
      logging: true,
    });
  });
});
