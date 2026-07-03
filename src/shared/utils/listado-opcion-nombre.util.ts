/** genListado.id — Tipo de actividad (control operativo). */
export const ID_LISTA_TIPO_ACTIVIDAD = 17;

/** Trim; en tipos de actividad, primera letra en mayúscula. */
export function normalizeNombreOpcionLista(
  nombre: string,
  idLista?: number,
): string {
  const trimmed = nombre.trim();
  if (!trimmed) return trimmed;
  if (idLista === ID_LISTA_TIPO_ACTIVIDAD) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }
  return trimmed;
}
