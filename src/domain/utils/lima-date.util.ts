import { Temporal as TemporalFallback } from "temporal-polyfill";

/** Zona de negocio; nunca depende de la configuración del navegador o servidor. */
export const APP_TIME_ZONE = "America/Lima";
export const APP_LOCALE = "es-PE";
export type DateValue = string | number | Date;
// El fallback síncrono también permite usar estas funciones en SSR, Jest y Safari.
export const AppTemporal =
  (globalThis as typeof globalThis & { Temporal?: typeof TemporalFallback }).Temporal
  ?? TemporalFallback;

/** Un texto sin offset representa hora de Lima; Z/offset representa un instante. */
export function toLimaZonedDateTime(value: DateValue) {
  if (value instanceof Date || typeof value === "number") {
    const ms = value instanceof Date ? value.getTime() : value;
    return AppTemporal.Instant.fromEpochMilliseconds(ms).toZonedDateTimeISO(APP_TIME_ZONE);
  }
  const text = value.trim().replace(" ", "T");
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return AppTemporal.PlainDate.from(text).toZonedDateTime(APP_TIME_ZONE);
  }
  if (/(?:Z|[+-]\d{2}(?::?\d{2})?)(?:\[[^\]]+\])?$/i.test(text)) {
    return AppTemporal.Instant.from(text).toZonedDateTimeISO(APP_TIME_ZONE);
  }
  return AppTemporal.PlainDateTime.from(text).toZonedDateTime(APP_TIME_ZONE, {
    disambiguation: "reject",
  });
}

/** Date solo para interoperar con librerías que lo requieren, conservando el instante. */
export function parseLimaDate(value: DateValue): Date {
  try {
    return new Date(toLimaZonedDateTime(value).epochMilliseconds);
  } catch {
    return new Date(NaN);
  }
}

/** Las fechas civiles YYYY-MM-DD conservan el día; los instantes se proyectan a Lima. */
export function limaDateOnly(value: DateValue = new Date()): string {
  try {
    return toLimaZonedDateTime(value).toPlainDate().toString();
  } catch {
    return "";
  }
}

export function limaDateTimeInput(value: DateValue): string {
  try {
    return toLimaZonedDateTime(value).toPlainDateTime().toString({ smallestUnit: "second" });
  } catch {
    return "";
  }
}

/** Interoperabilidad de calendario: los campos locales representan el día civil de Lima.
 * No usar como instante ni serializar con toISOString().
 */
export function limaCalendarDate(value: DateValue = new Date()): Date {
  const day = toLimaZonedDateTime(value).toPlainDate();
  const time = toLimaZonedDateTime(value);
  return new Date(day.year, day.month - 1, day.day, time.hour, time.minute, time.second, time.millisecond);
}

export function formatLimaDate(
  value: DateValue,
  locales: Intl.LocalesArgument = APP_LOCALE,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = parseLimaDate(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locales, { ...options, timeZone: APP_TIME_ZONE }).format(date);
}

