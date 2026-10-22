import type { DataSource } from 'typeorm';
import { ControlOperativoRepository } from './control-operativo.repository';
import type { DatabaseFunctionService } from '../database/database-function.service';
import type { MinioStorageService } from '../storage/minio-storage.service';
import {
  ForbiddenError,
  InvalidInputError,
} from '../../application/errors/application.error';

describe('Contrato PostgreSQL de jornadas versionadas', () => {
  const callFunction = jest.fn();
  const callFunctionSingle = jest.fn();
  const query = jest.fn();
  const repository = new ControlOperativoRepository(
    { callFunction, callFunctionSingle } as unknown as DatabaseFunctionService,
    { query } as unknown as DataSource,
    {} as MinioStorageService,
  );
  const params = {
    idTrabajadores: [101, 102],
    fechaInicio: '2026-10-12',
    fechaFin: '2026-10-16',
    duracionMinutos: 120,
    idUsuarioHabilita: 7,
  };
  beforeEach(() => {
    callFunction.mockReset().mockResolvedValue([]);
    callFunctionSingle.mockReset().mockResolvedValue(null);
    query.mockReset().mockResolvedValue([]);
  });

  it('envía el lote con el orden exacto de argumentos SQL', async () => {
    const rows = [
      {
        idtrabajador: 101,
        jornadas_habilitadas: 0,
        habilitaciondesde: '2026-10-16T14:00:00Z',
        habilitacionhasta: '2026-10-16T16:00:00Z',
      },
    ];
    callFunction.mockResolvedValue(rows);
    expect(await repository.habilitarJornadasUsuarios(params)).toEqual(rows);
    expect(callFunction).toHaveBeenCalledWith(
      'con_HabilitarJornadasUsuariosV2',
      [[101, 102], '2026-10-12', '2026-10-16', 120, 7],
    );
  });

  it('conserva el vencimiento y el estado efectivo que devuelve el listado V2', async () => {
    callFunction.mockResolvedValue([
      {
        idjornada: 30,
        fecha: '2026-10-12',
        idestadojornada: 399,
        habilitaciondesde: '2026-10-16T14:00:00Z',
        habilitacionhasta: '2026-10-16T16:00:00Z',
        total_count: '1',
      },
    ]);
    const result = await repository.listarJornadasTrabajador({
      idTrabajador: 101,
      fechaInicio: '2026-10-12',
      fechaFin: '2026-10-16',
    });
    expect(callFunction).toHaveBeenCalledWith(
      'con_ListarJornadasTrabajadorV2',
      [101, '2026-10-12', '2026-10-16', 10, 0],
    );
    expect(result).toMatchObject({
      totalCount: 1,
      data: [
        { idEstadoJornada: 399, habilitacionhasta: '2026-10-16T16:00:00Z' },
      ],
    });
    expect(result.data[0]).not.toHaveProperty('total_count');
  });

  it('usa la nueva versión para crear jornadas', async () => {
    await repository.crearJornada({
      idTrabajador: 101,
      fechaJornada: '2026-10-12',
    });
    expect(callFunctionSingle).toHaveBeenCalledWith(
      'con_CrearJornadaV2',
      expect.any(Array),
    );
  });

  it('envía actor y duración a la función individual V2 y lee su booleano', async () => {
    callFunctionSingle.mockResolvedValue({
      con_ActualizarEstadoJornadaV2: true,
    });
    expect(await repository.actualizarEstadoJornada(30, 372, 7, 60)).toBe(true);
    expect(callFunctionSingle).toHaveBeenCalledWith(
      'con_ActualizarEstadoJornadaV2',
      [30, 372, 7, 60],
    );
  });

  it.each([false, true])(
    'muestra el cierre efectivo en detalle de actividades, incluso con filas: %s',
    async (conFilas) => {
      query.mockResolvedValue([
        {
          diajornada: '2026-10-12',
          horasesperadas: 8,
          idestadojornada: 401,
          estadojornada: 'Culminado',
        },
      ]);
      callFunction.mockResolvedValue(
        conFilas
          ? [
              {
                id: 40,
                idjornada: 30,
                idestadojornada: 372,
                estadojornada: 'Abierta',
                evidencias: [],
              },
            ]
          : [],
      );
      const result = await repository.listarActividades({ idJornada: 30 });
      expect(result).toMatchObject({
        idestadojornada: 401,
        estadojornada: 'Culminado',
      });
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('con_EstadoJornadaVigenteV2'),
        [30],
      );
    },
  );

  it.each([true, false])(
    'lee correctamente el booleano %s de eliminación V2',
    async (value) => {
      callFunctionSingle.mockResolvedValue({ con_EliminarActividadV3: value });
      expect(await repository.eliminarActividad(30, 23)).toBe(value);
      expect(callFunctionSingle).toHaveBeenCalledWith(
        'con_EliminarActividadV3',
        [30, 23],
      );
    },
  );

  it('crea y actualiza actividades con V3 preservando sus argumentos', async () => {
    const base = {
      idProyecto: 1,
      idTrabajador: 101,
      idCoordinador: 7,
      idTipoActividad: 10,
      nombreActividad: 'Actividad',
    };
    await repository.crearActividad({ ...base, idJornada: 30 });
    expect(callFunction).toHaveBeenLastCalledWith('con_CrearActividadV4', [
      30,
      1,
      101,
      7,
      10,
      'Actividad',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      false,
      null,
    ]);
    await repository.actualizarActividad({
      ...base,
      idActividad: 40,
      corregirObservacion: true,
    });
    expect(callFunction).toHaveBeenLastCalledWith('con_ActualizarActividadV4', [
      40,
      1,
      101,
      7,
      10,
      'Actividad',
      null,
      null,
      null,
      null,
      null,
      null,
      true,
      null,
      null,
      false,
      null,
    ]);
  });

  it('ejecuta el cron V2 y el cierre específico sin fecha simulada', async () => {
    await repository.ejecutarCronCierreJornadas('2026-10-16');
    expect(callFunction).toHaveBeenCalledWith('con_CronCierreJornadasV2', [
      '2026-10-16',
    ]);
    callFunctionSingle.mockResolvedValue({
      pasados_culminado: '2',
      pasados_incompleto: '3',
    });
    expect(await repository.cerrarHabilitacionesVencidas()).toEqual({
      pasados_culminado: 2,
      pasados_incompleto: 3,
    });
    expect(callFunctionSingle).toHaveBeenCalledWith(
      'con_CerrarHabilitacionesVencidasV2',
      [],
    );
  });

  it.each([
    [{ code: '42501', message: 'permiso' }, ForbiddenError],
    [
      {
        driverError: { code: 'P0001', message: 'Trabajador sin configuración' },
      },
      InvalidInputError,
    ],
  ])('traduce los errores de negocio del lote', async (error, expected) => {
    callFunction.mockRejectedValue(error);
    await expect(
      repository.habilitarJornadasUsuarios(params),
    ).rejects.toBeInstanceOf(expected);
  });

  it('preserva fallos de conexión para no presentarlos como datos inválidos', async () => {
    const error = new Error('Connection lost');
    callFunction.mockRejectedValue(error);
    await expect(repository.habilitarJornadasUsuarios(params)).rejects.toBe(
      error,
    );
  });
});
