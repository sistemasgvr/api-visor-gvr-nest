import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { HabilitarJornadasUsuariosUseCase } from './habilitar-jornadas-usuarios.use-case';
import { ActualizarEstadoJornadaUseCase } from './actualizar-estado-jornada.use-case';

describe('Habilitación temporal de jornadas', () => {
  const habilitarJornadasUsuarios = jest.fn().mockResolvedValue([]);
  const actualizarEstadoJornada = jest.fn().mockResolvedValue(true);
  const repository = {
    habilitarJornadasUsuarios,
    actualizarEstadoJornada,
  } as unknown as IControlOperativoRepository;
  const masivo = new HabilitarJornadasUsuariosUseCase(repository);
  const individual = new ActualizarEstadoJornadaUseCase(repository);
  const params = {
    idTrabajadores: [101, 102],
    fechaInicio: '2026-10-12',
    fechaFin: '2026-10-16',
    duracionMinutos: 120,
    idUsuarioHabilita: 7,
  };

  beforeEach(() => jest.clearAllMocks());

  it('deduplica trabajadores y conserva rango, duración y actor', async () => {
    await masivo.execute({ ...params, idTrabajadores: [101, 102, 101] });
    expect(habilitarJornadasUsuarios).toHaveBeenCalledWith(params);
  });

  it.each([
    { idTrabajadores: [] },
    { idTrabajadores: [0] },
    { idTrabajadores: [1.5] },
    { duracionMinutos: 0 },
    { duracionMinutos: -1 },
    { duracionMinutos: 1.5 },
    { duracionMinutos: 2147483648 },
    { idUsuarioHabilita: 0 },
    { fechaInicio: '2026-02-30' },
    { fechaInicio: '2026-13-01' },
    { fechaInicio: '0000-01-01' },
    { fechaFin: '2026-10-11' },
    { fechaFin: '2026-10-16T00:00:00Z' },
  ])('rechaza entradas inválidas sin invocar la base: %j', (change) => {
    expect(() => masivo.execute({ ...params, ...change })).toThrow(
      InvalidInputError,
    );
    expect(habilitarJornadasUsuarios).not.toHaveBeenCalled();
  });

  it('acepta un rango de un día y el 29 de febrero de un año bisiesto', async () => {
    await masivo.execute({
      ...params,
      fechaInicio: '2028-02-29',
      fechaFin: '2028-02-29',
    });
    expect(habilitarJornadasUsuarios).toHaveBeenCalledTimes(1);
  });

  it('exige duración al abrir una jornada', async () => {
    await expect(
      individual.execute({
        idJornada: 30,
        idEstadoJornada: 372,
        idUsuarioModificacion: 7,
      }),
    ).rejects.toThrow(InvalidInputError);
    expect(actualizarEstadoJornada).not.toHaveBeenCalled();
  });

  it('envía actor y duración de la apertura individual', async () => {
    await individual.execute({
      idJornada: 30,
      idEstadoJornada: 372,
      idUsuarioModificacion: 7,
      duracionMinutos: 60,
    });
    expect(actualizarEstadoJornada).toHaveBeenCalledWith(30, 372, 7, 60);
  });

  it('permite cerrar sin indicar una duración', async () => {
    await individual.execute({
      idJornada: 30,
      idEstadoJornada: 401,
      idUsuarioModificacion: 7,
    });
    expect(actualizarEstadoJornada).toHaveBeenCalledWith(30, 401, 7, undefined);
  });
});
