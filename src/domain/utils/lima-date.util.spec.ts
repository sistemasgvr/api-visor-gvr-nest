import { types } from 'pg';
import { APP_TIME_ZONE, formatLimaDate, limaDateOnly, limaDateTimeInput, parseLimaDate } from './lima-date.util';
import '../../config/lima-timezone';

describe('Contrato de fechas en Lima', () => {
  const originalZone = process.env.TZ;
  afterAll(() => { process.env.TZ = originalZone; });

  it.each(['UTC', 'America/Lima', 'Asia/Tokyo', 'America/Los_Angeles'])(
    'no depende de TZ=%s ni convierte fechas civiles al día anterior', zone => {
      process.env.TZ = zone;
      expect(limaDateOnly('2026-11-21T02:30:00Z')).toBe('2026-11-20');
      expect(limaDateTimeInput('2026-11-20T21:30:00-05:00')).toBe('2026-11-20T21:30:00');
      expect(parseLimaDate('2026-11-20').toISOString()).toBe('2026-11-20T05:00:00.000Z');
      expect(types.getTypeParser(types.builtins.TIMESTAMP)('2026-11-20 21:30:00').toISOString()).toBe('2026-11-21T02:30:00.000Z');
      expect(types.getTypeParser(types.builtins.DATE)('2026-11-20').toISOString()).toBe('2026-11-20T05:00:00.000Z');
      expect(formatLimaDate('2026-11-21T02:30:00Z', 'en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })).toBe('21:30');
    },
  );

  it('rechaza fechas inválidas y acepta precisión de PostgreSQL', () => {
    expect(APP_TIME_ZONE).toBe('America/Lima');
    expect(limaDateOnly('2026-02-30')).toBe('');
    expect(formatLimaDate('invalida')).toBe('—');
    expect(limaDateTimeInput('2026-11-20 12:30:59.123456')).toBe('2026-11-20T12:30:59');
  });
});
