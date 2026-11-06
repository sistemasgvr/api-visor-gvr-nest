/**
 * Alcance de Control operativo resuelto en el controlador a partir del permiso granular.
 * `null` significa «todos»; una lista vacía, que no hay proyectos/trabajadores en su ámbito.
 */
export type IdsPermitidos = number[] | null;

/** ID que no existe: deja vacío un filtro SQL sin cambiar la forma del resultado. */
const NINGUNO = -1;

/** Restringe los IDs pedidos al ámbito permitido (sin filtro pedido = todo el ámbito). */
export function restringirIds(
  solicitados: number[] | null | undefined,
  permitidos: IdsPermitidos,
): number[] | null {
  if (permitidos === null) return solicitados?.length ? solicitados : null;
  const ambito = new Set(permitidos);
  const ids = solicitados?.length
    ? solicitados.filter((id) => ambito.has(Number(id)))
    : [...ambito];
  return ids.length ? ids : [NINGUNO];
}

export function incluido(id: number, permitidos: IdsPermitidos): boolean {
  return permitidos === null || permitidos.includes(Number(id));
}
