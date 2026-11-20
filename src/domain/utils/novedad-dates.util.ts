import { limaDateOnly } from './lima-date.util';
/** Normaliza fechas de novedades: publicación inicio del día, vigencia fin del día. */

function extractDatePart(value: string): string | null {
  return limaDateOnly(value) || null;
}

export function normalizarFechaPublicacionNovedad(
  value?: string | Date | null,
): string | null {
  if (value == null) return null;
  const datePart =
    value instanceof Date
      ? limaDateOnly(value)
      : extractDatePart(String(value));
  return datePart ? `${datePart}T00:00:00` : null;
}

export function normalizarFechaVigenciaNovedad(
  value?: string | Date | null,
): string | null {
  if (value == null) return null;
  const datePart =
    value instanceof Date
      ? limaDateOnly(value)
      : extractDatePart(String(value));
  return datePart ? `${datePart}T23:59:59` : null;
}
