/**
 * Normaliza responsables desde el contrato Fase 4.
 * Preferencia: `idTrabajadoresResponsables` si viene en el payload;
 * si no, atajo v1 `idTrabajadorResponsable`.
 */

export type ResolucionResponsables =
  | { tocar: false }
  | { tocar: true; ids: number[] };

function dedupePositivos(ids: number[]): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  for (const raw of ids) {
    const id = Number(raw);
    if (!Number.isFinite(id) || id < 1 || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/**
 * Create/update: determina si hay que sincronizar responsables y con qué ids.
 * - Array presente (aunque vacío) → tocar = true
 * - Solo atajo singular presente → tocar = true
 * - Ninguno → tocar = false (en update: no modificar set en SQL)
 */
export function resolverIdsResponsablesEntrada(data: {
  idTrabajadoresResponsables?: number[] | null;
  idTrabajadorResponsable?: number | null;
}): ResolucionResponsables {
  if (data.idTrabajadoresResponsables !== undefined) {
    const list = Array.isArray(data.idTrabajadoresResponsables)
      ? data.idTrabajadoresResponsables
      : [];
    return { tocar: true, ids: dedupePositivos(list) };
  }
  if (data.idTrabajadorResponsable !== undefined) {
    const id = data.idTrabajadorResponsable;
    if (id != null && Number(id) > 0) {
      return { tocar: true, ids: [Number(id)] };
    }
    return { tocar: true, ids: [] };
  }
  return { tocar: false };
}

/** Ids activos desde detalle/listado (V2). */
export function idsResponsablesDesdeEntregable(entregable: {
  idtrabajadorresponsable?: number | null;
  responsables?: Array<{ idtrabajador?: number | null }> | null;
}): number[] {
  if (Array.isArray(entregable.responsables) && entregable.responsables.length > 0) {
    return dedupePositivos(
      entregable.responsables.map((r) => Number(r.idtrabajador)),
    );
  }
  if (
    entregable.idtrabajadorresponsable != null &&
    Number(entregable.idtrabajadorresponsable) > 0
  ) {
    return [Number(entregable.idtrabajadorresponsable)];
  }
  return [];
}

/** Nuevos respecto al set anterior (para notificar solo altas). */
export function idsResponsablesNuevos(
  anteriores: number[],
  siguientes: number[],
): number[] {
  const prev = new Set(anteriores.map(Number));
  return siguientes.filter((id) => !prev.has(Number(id)));
}
