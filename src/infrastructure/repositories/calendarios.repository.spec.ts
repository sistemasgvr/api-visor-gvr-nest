import { CalendariosRepository } from './calendarios.repository';
import type { DatabaseFunctionService } from '../database/database-function.service';
import {
  ApplicationFailure,
  InternalError,
} from '../../application/errors/application.error';

describe('Contrato PostgreSQL de calendarios', () => {
  const result = { marcador: 'jsonb directo' };
  const callFunctionSingle = jest.fn();
  const repository = new CalendariosRepository({
    callFunctionSingle,
  } as unknown as DatabaseFunctionService);
  beforeEach(() => {
    callFunctionSingle.mockReset();
    callFunctionSingle.mockImplementation((name: string) =>
      Promise.resolve({ [name]: result }),
    );
  });

  const cases: Array<
    [string, (r: CalendariosRepository) => Promise<unknown>, unknown[]]
  > = [
    [
      'pla_ListarCalendarios',
      (r) => r.listar(23, { estado: 0 }),
      [23, '', 0, 20, 0],
    ],
    ['pla_ObtenerCalendario', (r) => r.obtener(23, 6), [23, 6, null]],
    [
      'pla_CrearCalendario',
      (r) => r.crear(23, { nombre: ' Remoto ' }),
      [23, 'Remoto', '', 'America/Lima'],
    ],
    [
      'pla_ActualizarCalendario',
      (r) =>
        r.actualizar(23, 6, {
          revision: 4,
          nombre: ' Presencial ',
          descripcion: 'Equipo',
        }),
      [23, 6, 4, 'Presencial', 'Equipo'],
    ],
    [
      'pla_DuplicarCalendario',
      (r) => r.duplicar(23, 9, ' Copia '),
      [23, 9, 'Copia'],
    ],
    ['pla_CrearVersionCalendario', (r) => r.crearVersion(23, 9), [23, 9]],
    [
      'pla_GuardarJornadaSemanal',
      (r) =>
        r.guardarSemana(23, 9, {
          revision: 4,
          zonahoraria: 'America/Lima',
          semana: [],
        }),
      [23, 9, 4, 'America/Lima', '[]'],
    ],
    [
      'pla_GuardarExcepcionCalendario',
      (r) =>
        r.guardarExcepcion(23, 9, {
          revision: 4,
          fecha: '2026-12-24',
          nombre: ' Especial ',
          idtipo: 619,
          minutosefectivos: 240,
        }),
      [23, 9, 4, '2026-12-24', 'Especial', 619, 240, true, null],
    ],
    [
      'pla_GuardarExcepcionCalendario',
      (r) =>
        r.guardarExcepcion(
          23,
          9,
          {
            revision: 4,
            fecha: '2026-12-24',
            nombre: 'Especial',
            idtipo: 619,
            minutosefectivos: 0,
            activo: false,
          },
          15,
        ),
      [23, 9, 4, '2026-12-24', 'Especial', 619, 0, false, 15],
    ],
    [
      'pla_EliminarExcepcionCalendario',
      (r) => r.eliminarExcepcion(23, 9, 4, 15),
      [23, 9, 4, 15],
    ],
    [
      'pla_PublicarVersionCalendario',
      (r) => r.publicarVersion(23, 9, 4),
      [23, 9, 4],
    ],
    [
      'pla_CambiarEstadoCalendario',
      (r) => r.cambiarEstado(23, 6, 4, 0),
      [23, 6, 4, 0],
    ],
    [
      'pla_ObtenerDisponibilidadCalendario',
      (r) => r.disponibilidad(23, 9, '2026-10-01', '2026-10-31'),
      [23, 9, '2026-10-01', '2026-10-31'],
    ],
  ];
  it.each(cases)(
    'conserva firma y JSON de %s',
    async (name, invoke, params) => {
      expect(await invoke(repository)).toBe(result);
      expect(callFunctionSingle).toHaveBeenCalledTimes(1);
      expect(callFunctionSingle).toHaveBeenCalledWith(name, params);
    },
  );

  it('consulta una versión histórica explícita y serializa la semana como JSONB', async () => {
    await repository.obtener(23, 6, 2);
    expect(callFunctionSingle).toHaveBeenLastCalledWith(
      'pla_ObtenerCalendario',
      [23, 6, 2],
    );
    const semana = [
      {
        diasemana: 7,
        laborable: false,
        horaentrada: null,
        horasalida: null,
        minutosrefrigerio: 0,
      },
    ];
    await repository.guardarSemana(23, 9, {
      revision: 4,
      zonahoraria: 'America/Lima',
      semana,
    });
    expect(callFunctionSingle).toHaveBeenLastCalledWith(
      'pla_GuardarJornadaSemanal',
      [23, 9, 4, 'America/Lima', JSON.stringify(semana)],
    );
  });

  it.each([
    ['42501', 'forbidden'],
    ['P0002', 'not_found'],
    ['23505', 'conflict'],
    ['40001', 'conflict'],
    ['40P01', 'conflict'],
    ['55000', 'conflict'],
    ['22023', 'invalid_input'],
    ['23514', 'invalid_input'],
    ['23503', 'invalid_input'],
    ['22P02', 'invalid_input'],
    ['42883', 'internal'],
  ])('traduce SQLSTATE %s sin exponer datos del driver', async (code, kind) => {
    callFunctionSingle.mockRejectedValueOnce({
      driverError: { code },
      message: 'SQL con información interna',
    });
    try {
      await repository.listar(23, {});
      throw new Error('Se esperaba un error de aplicación');
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationFailure);
      expect((error as ApplicationFailure).kind).toBe(kind);
      expect((error as Error).message).not.toContain('información interna');
    }
  });

  it('reconoce el código directo de pg y rechaza respuestas JSONB ausentes', async () => {
    callFunctionSingle.mockRejectedValueOnce({ code: '40001' });
    await expect(repository.obtener(23, 6)).rejects.toMatchObject({
      kind: 'conflict',
    });
    callFunctionSingle.mockResolvedValueOnce(null);
    await expect(repository.obtener(23, 6)).rejects.toBeInstanceOf(
      InternalError,
    );
  });
});
