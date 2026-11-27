import {
  ConflictError,
  ForbiddenError,
  InternalError,
  InvalidInputError,
  NotFoundError,
} from '../../application/errors/application.error';
import type { DatabaseFunctionService } from '../database/database-function.service';
import { ControlAsistenciaRepository } from './control-asistencia.repository';

function crear(callFunctionSingle: jest.Mock) {
  return new ControlAsistenciaRepository({
    callFunctionSingle,
  } as unknown as DatabaseFunctionService);
}

function errorDriver(code: string, message: string) {
  return Object.assign(new Error('query failed'), {
    driverError: { code, message },
  });
}

describe('ControlAsistenciaRepository', () => {
  it('llama las funciones con sus parámetros en orden y devuelve su JSON', async () => {
    const call = jest
      .fn()
      .mockResolvedValue({ con_MarcarAsistencia: { habilitado: true } });
    const repo = crear(call);
    await expect(repo.marcar(3, 'salida', 'Falla de internet')).resolves.toEqual({
      habilitado: true,
    });
    expect(call).toHaveBeenCalledWith('con_MarcarAsistencia', [
      3,
      'salida',
      'Falla de internet',
    ]);

    call.mockResolvedValue({ con_ListarAsistenciaMes: { dias: [] } });
    await repo.listarMes(3, null, 2026, 11);
    expect(call).toHaveBeenLastCalledWith('con_ListarAsistenciaMes', [
      3,
      null,
      2026,
      11,
    ]);
  });

  it('rechaza una respuesta sin JSON', async () => {
    const repo = crear(jest.fn().mockResolvedValue(null));
    await expect(repo.obtenerEstado(3)).rejects.toBeInstanceOf(InternalError);
  });

  it.each([
    ['55000', 'El ingreso se habilita a las 09:00', ConflictError, 'El ingreso se habilita a las 09:00'],
    ['22023', 'Indica el motivo para registrar la salida del 24/11/2026', InvalidInputError, 'Indica el motivo para registrar la salida del 24/11/2026'],
    ['P0002', 'No existe un colaborador activo para este usuario', NotFoundError, 'No existe un colaborador activo para este usuario'],
  ])('traduce %s conservando el mensaje escrito en SQL', async (code, message, tipo, esperado) => {
    const repo = crear(jest.fn().mockRejectedValue(errorDriver(code, message)));
    const error = await repo.marcar(3, 'ingreso', null).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(tipo);
    expect((error as Error).message).toBe(esperado);
  });

  it('no expone el texto del driver en errores de privilegios ni internos', async () => {
    const privilegio = crear(
      jest.fn().mockRejectedValue(errorDriver('42501', 'permission denied for table conasistencia')),
    );
    const error = await privilegio.obtenerEstado(3).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ForbiddenError);
    expect((error as Error).message).not.toContain('conasistencia');

    const interno = crear(
      jest.fn().mockRejectedValue(errorDriver('XX000', 'SELECT * FROM secreto')),
    );
    const otro = await interno.obtenerEstado(3).catch((e: unknown) => e);
    expect(otro).toBeInstanceOf(InternalError);
    expect((otro as Error).message).not.toContain('secreto');
  });
});
