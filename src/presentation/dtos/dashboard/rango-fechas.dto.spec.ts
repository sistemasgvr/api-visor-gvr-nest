import { RangoFechasDashboardDto } from './rango-fechas.dto';

describe('Rango de fechas del dashboard', () => {
  const valido = (consulta: unknown) =>
    RangoFechasDashboardDto.schema.safeParse(consulta).success;

  it('admite el periodo completo y también ninguna fecha', () => {
    expect(valido({ fechaInicio: '2026-10-01', fechaFin: '2026-10-31' })).toBe(
      true,
    );
    expect(valido({})).toBe(true);
    expect(valido({ fechaInicio: '2026-10-01' })).toBe(true);
  });

  it.each(['no-es-fecha', '2026-13-01', '2026-02-30', '01/10/2026'])(
    'rechaza la fecha %s',
    (fecha) => {
      expect(valido({ fechaInicio: fecha })).toBe(false);
      expect(valido({ fechaFin: fecha })).toBe(false);
    },
  );

  it('rechaza parámetros desconocidos', () => {
    expect(valido({ fechaInicio: '2026-10-01', otro: '1' })).toBe(false);
  });
});
