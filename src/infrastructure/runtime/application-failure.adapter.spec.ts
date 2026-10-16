import { BadRequestException, HttpException } from '@nestjs/common';
import { InvalidInputError } from '../../application/errors/application.error';
import {
  applicationDependency,
  originalTransportFailure,
} from './application-failure.adapter';

describe('Límite de errores de los adaptadores', () => {
  it('conserva el receptor y los valores de métodos síncronos y asíncronos', async () => {
    const implementation = {
      value: 7,
      read() {
        return this.value;
      },
      async load() {
        return this.value;
      },
    };
    const adapter = applicationDependency(implementation);
    expect(adapter.read()).toBe(7);
    await expect(adapter.load()).resolves.toBe(7);
  });

  it('traduce un rechazo de infraestructura a un error de aplicación conservando el código', async () => {
    const original = new BadRequestException({
      message: 'Flujo inválido',
      code: 'FLOW_INVALID',
    });
    const adapter = applicationDependency({
      async execute() {
        throw original;
      },
    });
    try {
      await adapter.execute();
      throw new Error('Debía fallar');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidInputError);
      expect((error as InvalidInputError).details).toEqual({
        message: 'Flujo inválido',
        code: 'FLOW_INVALID',
      });
      expect(originalTransportFailure(error as InvalidInputError)).toBe(
        original,
      );
    }
  });

  it('preserva también estados externos que no son categorías propias de la aplicación', () => {
    const original = new HttpException('Rate limit', 429);
    const adapter = applicationDependency({
      read() {
        throw original;
      },
    });
    try {
      adapter.read();
      throw new Error('Debía fallar');
    } catch (error) {
      expect(
        originalTransportFailure(error as InvalidInputError)?.getStatus(),
      ).toBe(429);
    }
  });
});
