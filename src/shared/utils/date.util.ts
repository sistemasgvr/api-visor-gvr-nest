/**
 * Fecha de hoy en zona horaria Perú (America/Lima), formato YYYY-MM-DD.
 * Así el cron y la lógica de negocio usan siempre hora Perú aunque el servidor (p. ej. EasyPanel) esté en UTC.
 */
export function getFechaHoy(): string {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Lima',
  });
}
