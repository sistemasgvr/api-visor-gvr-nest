import { PlanificacionRepository } from './planificacion.repository';
import { DatabaseFunctionService } from '../database/database-function.service';
import { ejecutarPlanificacion } from './planificacion-errors';
import {
  ConflictError,
  ForbiddenError,
  InternalError,
  InvalidInputError,
  NotFoundError,
  UnprocessableError,
} from '../../application/errors/application.error';

describe('Planificación: contratos SQL y aislamiento de errores', () => {
  const database = { callFunctionSingle: jest.fn(), executeQuery: jest.fn() };
  const repository = new PlanificacionRepository(
    database as unknown as DatabaseFunctionService,
  );
  beforeEach(() => jest.resetAllMocks());
  it.each([
    ['42501', ForbiddenError],
    ['P0002', NotFoundError],
    ['40001', ConflictError],
    ['40P01', ConflictError],
    ['23505', ConflictError],
    ...[
      '22023',
      '22P02',
      '22007',
      '22008',
      '22003',
      '23502',
      '23503',
      '23514',
    ].map((code) => [code, InvalidInputError]),
    ['XX000', InternalError],
  ])('traduce %s sin exponer el driver', async (code, expected) => {
    const error = await ejecutarPlanificacion(() =>
      Promise.reject({
        driverError: { code, message: 'SELECT secreto; password' },
      }),
    ).catch((e) => e);
    expect(error).toBeInstanceOf(expected as typeof InternalError);
    expect(error.message).not.toContain('secreto');
  });
  it('expone únicamente el mensaje de negocio P0001', async () => {
    await expect(
      ejecutarPlanificacion(() =>
        Promise.reject({
          code: 'P0001',
          message: 'Las dependencias forman un ciclo',
        }),
      ),
    ).rejects.toMatchObject({
      kind: 'unprocessable',
      message: 'Las dependencias forman un ciclo',
    });
  });
  it('detecta catálogo incompleto como fallo de configuración', async () => {
    await expect(
      ejecutarPlanificacion(() =>
        Promise.reject({
          code: '22023',
          message: 'Se requiere una opción única y activa: Estado del plan',
        }),
      ),
    ).rejects.toMatchObject({
      kind: 'internal',
      details: { code: 'PLANIFICACION_CATALOGO_INCOMPLETO' },
    });
  });
  it('preserva fallos de aplicación', async () => {
    const error = new UnprocessableError('Regla');
    await expect(
      ejecutarPlanificacion(() => Promise.reject(error)),
    ).rejects.toBe(error);
  });
  it('serializa alta y reparto en una única llamada sin transformar las fechas', async () => {
    database.callFunctionSingle.mockResolvedValue({
      pla_GuardarActividad: { id: 9, fechanoiniciarantes: '2026-11-01' },
    });
    const datos = {
      identregable: 7,
      nombre: 'Actividad',
      minutosestimados: 60,
      fechanoiniciarantes: '2026-11-01',
      asignaciones: [{ idtrabajador: 3, minutosasignados: 60 }],
    };
    expect(
      await repository.crearActividad(
        23,
        { id: 1, idPlan: 2 },
        { revisionPlan: 4, datos },
      ),
    ).toMatchObject({ fechanoiniciarantes: '2026-11-01' });
    expect(database.callFunctionSingle).toHaveBeenCalledTimes(1);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_GuardarActividad',
      [23, 2, 4, JSON.stringify(datos), null, null, null],
    );
  });
  it('acepta booleanos false y arreglos sin confundirlos con respuesta ausente', async () => {
    database.callFunctionSingle
      .mockResolvedValueOnce({ pla_ReordenarCronograma: false })
      .mockResolvedValueOnce({ pla_ListarAmpliaciones: [] });
    expect(
      await repository.reordenar(
        23,
        { id: 1, idPlan: 2 },
        { revisionPlan: 3, entregables: [8], actividades: [9] },
      ),
    ).toBe(false);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'pla_ReordenarCronograma',
      [23, 2, 3, [8], [9], null],
    );
    expect(await repository.ampliaciones(23, { id: 1, idPlan: 2 }, {})).toEqual(
      [],
    );
  });
  it('comprueba juntos proyecto, plan, actividad y ampliación con parámetros', async () => {
    database.executeQuery.mockResolvedValue([]);
    await expect(
      repository.comprobarPertenencia({
        id: 1,
        idPlan: 2,
        idActividad: 3,
        idAmpliacion: 4,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(database.executeQuery).toHaveBeenCalledWith(
      expect.stringContaining('a.idproyecto=p.idproyecto'),
      [2, 1, 3, 4],
    );
  });
  it('resuelve la persona exclusivamente desde el actor activo', async () => {
    database.executeQuery.mockResolvedValue([{ id: 8 }]);
    expect(await repository.obtenerTrabajador(23)).toBe(8);
    expect(database.executeQuery).toHaveBeenCalledWith(
      expect.stringContaining('idusuario=$1 AND estado=1'),
      [23],
    );
  });
});
