import {
  applicationProvider,
  applicationProviderTargets,
} from './application.providers';

describe('Ensamblaje de la aplicación', () => {
  it('construye todos los componentes registrados con sus dependencias explícitas', () => {
    const logger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };
    const dependency = { create: () => logger };
    expect(applicationProviderTargets.length).toBeGreaterThan(400);
    for (const target of applicationProviderTargets) {
      const provider = applicationProvider(target);
      const inject = provider.inject ?? [];
      expect(inject.length).toBe(target.length);
      expect(
        provider.useFactory(...inject.map(() => dependency)),
      ).toBeInstanceOf(target);
    }
  });
});
