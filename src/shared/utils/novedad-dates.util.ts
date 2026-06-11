/** Normaliza fechas de novedades: publicación inicio del día, vigencia fin del día. */

function extractDatePart(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(' ', 'T');
  const datePart = normalized.split('T')[0]?.slice(0, 10) ?? '';
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : null;
}

export function normalizarFechaPublicacionNovedad(
  value?: string | Date | null,
): string | null {
  if (value == null) return null;
  const datePart =
    value instanceof Date
      ? value.toISOString().slice(0, 10)
      : extractDatePart(String(value));
  return datePart ? `${datePart}T00:00:00` : null;
}

export function normalizarFechaVigenciaNovedad(
  value?: string | Date | null,
): string | null {
  if (value == null) return null;
  const datePart =
    value instanceof Date
      ? value.toISOString().slice(0, 10)
      : extractDatePart(String(value));
  return datePart ? `${datePart}T23:59:59` : null;
}
