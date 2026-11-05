import {
  BandejaAmpliacionesDto,
  ResolverAmpliacionDto,
  PrevisualizarAmpliacionDto,
  ReprogramarSaldoAmpliacionDto,
} from './planificacion.dto';

describe('Bandeja de ampliaciones', () => {
  it('aprobar exige fecha civil y la previsualización; rechazar no las necesita', () => {
    const input = {
      minutosAprobados: 120,
      resolucion: 'Reanudar',
      fechaReanudacion: '2026-10-30',
      revisionPlan: 3,
      huella: 'a'.repeat(32),
    };
    expect(ResolverAmpliacionDto.schema.safeParse(input).success).toBe(true);
    for (const campo of ['fechaReanudacion', 'revisionPlan', 'huella']) {
      const invalido = { ...input };
      delete invalido[campo];
      expect(ResolverAmpliacionDto.schema.safeParse(invalido).success).toBe(
        false,
      );
    }
    expect(
      ResolverAmpliacionDto.schema.safeParse({
        ...input,
        fechaReanudacion: '2026-02-30',
      }).success,
    ).toBe(false);
    expect(
      ResolverAmpliacionDto.schema.safeParse({
        minutosAprobados: 0,
        resolucion: 'Rechazar',
      }).success,
    ).toBe(true);
  });
  it('previsualiza y reprograma saldo sin aceptar horas adicionales inyectadas', () => {
    expect(
      PrevisualizarAmpliacionDto.schema.safeParse({
        minutosAprobados: 0,
        fechaReanudacion: '2026-10-30',
      }).success,
    ).toBe(true);
    expect(
      PrevisualizarAmpliacionDto.schema.safeParse({
        minutosAprobados: 120,
        fechaReanudacion: '2026-02-30',
      }).success,
    ).toBe(false);
    const input = {
      fechaReanudacion: '2026-10-30',
      resolucion: 'Solo saldo',
      revisionPlan: 3,
      huella: 'a'.repeat(32),
    };
    expect(ReprogramarSaldoAmpliacionDto.schema.safeParse(input).success).toBe(
      true,
    );
    expect(
      ReprogramarSaldoAmpliacionDto.schema.safeParse({
        ...input,
        minutosAprobados: 120,
      }).success,
    ).toBe(false);
  });
  it('acepta filtros y paginación, normalizando números y búsqueda', () => {
    expect(
      BandejaAmpliacionesDto.schema.parse({
        estado: 'aprobadas',
        busqueda: '  Diseño  ',
        idActividad: '7',
        offset: '10',
        limite: '10',
      }),
    ).toEqual({
      estado: 'aprobadas',
      busqueda: 'Diseño',
      idActividad: 7,
      offset: 10,
      limite: 10,
    });
  });
  it.each([
    { estado: 'desconocido' },
    { limite: 0 },
    { limite: 101 },
    { offset: -1 },
    { offset: 0.5 },
    { idActividad: 0 },
    { busqueda: 'a'.repeat(121) },
  ])('rechaza filtros inválidos %j', (input) => {
    expect(BandejaAmpliacionesDto.schema.safeParse(input).success).toBe(false);
  });
  it('rechazo exige resolución y aprobación exige minutos enteros', () => {
    expect(
      ResolverAmpliacionDto.schema.safeParse({
        minutosAprobados: 0,
        resolucion: '  No corresponde  ',
      }).success,
    ).toBe(true);
    for (const input of [
      { minutosAprobados: 0, resolucion: '   ' },
      { minutosAprobados: -1, resolucion: 'Motivo' },
      { minutosAprobados: 0.5, resolucion: 'Motivo' },
    ])
      expect(ResolverAmpliacionDto.schema.safeParse(input).success).toBe(false);
  });
});
