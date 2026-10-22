import { validate } from './env.validation';
const required = {
  FRONTEND_URLS: 'https://example.invalid',
  JWT_SECRET: 'test-only',
  JWT_EXPIRES_IN: '1h',
  AUTODESK_CLIENT_ID: 'test',
  AUTODESK_CLIENT_SECRET: 'test',
  AUTODESK_CALLBACK_URL: 'https://example.invalid/callback',
};
describe('Configuración del proceso validada con Zod', () => {
  it('conserva defaults y convierte números y booleanos del entorno', () => {
    expect(validate(required)).toMatchObject({
      PORT: 4001,
      HOST: '0.0.0.0',
      NODE_ENV: 'development',
      DB_SYNCHRONIZE: false,
      DB_LOGGING: false,
    });
    expect(
      validate({
        ...required,
        PORT: '4010',
        DB_PORT: '5434',
        DB_LOGGING: 'TRUE',
        DB_SYNCHRONIZE: 'false',
      }),
    ).toMatchObject({
      PORT: 4010,
      DB_PORT: 5434,
      DB_LOGGING: true,
      DB_SYNCHRONIZE: false,
    });
  });
  it('rechaza valores inválidos sin imprimir contraseñas o tokens', () => {
    expect(() =>
      validate({ ...required, PORT: 'credencial-no-publicar' }),
    ).toThrow(/PORT/);
    expect(() =>
      validate({ ...required, PORT: 'credencial-no-publicar' }),
    ).not.toThrow(/credencial-no-publicar/);
    expect(() => validate({ ...required, DB_LOGGING: '1' })).toThrow();
  });
  it('permite otras variables y campos de conexión opcionales vacíos', () => {
    expect(
      validate({
        ...required,
        DATABASE_URL: '',
        DB_HOST: '',
        CUSTOM_VALUE: 'ok',
      }),
    ).toMatchObject({ DATABASE_URL: '', DB_HOST: '', CUSTOM_VALUE: 'ok' });
  });
});
