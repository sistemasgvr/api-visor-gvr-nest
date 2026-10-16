/**
 * Fecha de hoy en zona horaria Perú (America/Lima), formato YYYY-MM-DD.
 * Así el cron y la lógica de negocio usan siempre hora Perú aunque el servidor (p. ej. EasyPanel) esté en UTC.
 */
export function getFechaHoy(): string {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Lima',
  });
}

/**
 * Convierte valores típicos de `DATE` desde PostgreSQL/node-pg (`Date`, `YYYY-MM-DD`, ISO con `T`,
 * o `Date.prototype.toString()` en inglés) a `YYYY-MM-DD` estable para reportes y UI.
 */
export function normalizeStoredValueToYmd(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const ds = String(value).trim();
  if (!ds) return null;
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(ds);
  if (ymd) {
    return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;
  }
  const parsed = Date.parse(ds);
  if (Number.isNaN(parsed)) return null;
  const dt = new Date(parsed);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
