import type {
  ICalendariosRepository,
  GuardarSemanaCalendarioData,
} from '../../../../domain/repositories/calendarios.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';
import { GuardarSemanaCalendarioUseCase } from './guardar-semana-calendario.use-case';
import { ObtenerDisponibilidadCalendarioUseCase } from './obtener-disponibilidad-calendario.use-case';

const semana = (): GuardarSemanaCalendarioData => ({
  revision: 2,
  zonahoraria: 'America/Lima',
  semana: Array.from({ length: 7 }, (_, i) => ({
    diasemana: i + 1,
    laborable: i < 5,
    horaentrada: i < 5 ? '08:00' : null,
    horasalida: i < 5 ? '17:00' : null,
    minutosrefrigerio: i < 5 ? 60 : 0,
  })),
});

describe('Reglas de entrada de calendarios', () => {
  const guardarSemana = jest.fn().mockResolvedValue({ minutossemanales: 2400 });
  const disponibilidad = jest.fn().mockResolvedValue({ dias: [] });
  const repository = {
    guardarSemana,
    disponibilidad,
  } as unknown as ICalendariosRepository;
  const guardar = new GuardarSemanaCalendarioUseCase(repository);
  const consultar = new ObtenerDisponibilidadCalendarioUseCase(repository);
  beforeEach(() => jest.clearAllMocks());

  it('acepta el patrón ISO completo sin imponer un número fijo de horas semanales', async () => {
    const data = semana();
    await guardar.execute(23, 5, data);
    expect(guardarSemana).toHaveBeenCalledWith(23, 5, data);
    data.semana.forEach((dia) => {
      dia.laborable = false;
      dia.horaentrada = null;
      dia.horasalida = null;
      dia.minutosrefrigerio = 0;
    });
    await guardar.execute(23, 5, data); // Un borrador puede prepararse sin días laborables.
    expect(guardarSemana).toHaveBeenCalledTimes(2);
  });

  it.each([
    [
      'día repetido',
      (data: GuardarSemanaCalendarioData) => {
        data.semana[6].diasemana = 1;
      },
    ],
    [
      'semana incompleta',
      (data: GuardarSemanaCalendarioData) => {
        data.semana.pop();
      },
    ],
    [
      'domingo cero del prototipo',
      (data: GuardarSemanaCalendarioData) => {
        data.semana[6].diasemana = 0;
      },
    ],
    [
      'salida anterior',
      (data: GuardarSemanaCalendarioData) => {
        data.semana[0].horasalida = '07:00';
      },
    ],
    [
      'pausa igual al intervalo',
      (data: GuardarSemanaCalendarioData) => {
        data.semana[0].minutosrefrigerio = 540;
      },
    ],
    [
      'hora fuera de formato',
      (data: GuardarSemanaCalendarioData) => {
        data.semana[0].horaentrada = '25:00';
      },
    ],
    [
      'horario en día libre',
      (data: GuardarSemanaCalendarioData) => {
        data.semana[6].horaentrada = '08:00';
      },
    ],
    [
      'refrigerio en día libre',
      (data: GuardarSemanaCalendarioData) => {
        data.semana[6].minutosrefrigerio = 30;
      },
    ],
  ])('rechaza %s antes de consultar SQL', (_name, mutate) => {
    const data = semana();
    mutate(data);
    expect(() => guardar.execute(23, 5, data)).toThrow(InvalidInputError);
    expect(guardarSemana).not.toHaveBeenCalled();
  });

  it('acepta 366 días inclusivos y una fecha bisiesta real', async () => {
    await consultar.execute(23, 5, '2024-01-01', '2024-12-31');
    expect(disponibilidad).toHaveBeenCalledWith(
      23,
      5,
      '2024-01-01',
      '2024-12-31',
    );
    await consultar.execute(23, 5, '2024-02-29', '2024-02-29');
  });

  it.each([
    ['2025-02-29', '2025-03-01'],
    ['2026-02-30', '2026-03-01'],
    ['2026-01-02', '2026-01-01'],
    ['2024-01-01', '2025-01-01'],
    ['2026-01-01T00:00:00Z', '2026-01-02'],
    ['0000-01-01', '0000-01-02'],
  ])(
    'rechaza rango inválido %s / %s antes de consultar SQL',
    (desde, hasta) => {
      expect(() => consultar.execute(23, 5, desde, hasta)).toThrow(
        InvalidInputError,
      );
      expect(disponibilidad).not.toHaveBeenCalled();
    },
  );
});
