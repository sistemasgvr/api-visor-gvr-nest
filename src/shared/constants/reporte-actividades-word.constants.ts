/**
 * Política de exportación Word — informe de actividades (detalle por actividad).
 *
 * Por confidencialidad / uso legal, la columna «Horas dedicadas» solo se incluye
 * si el usuario que exporta tiene uno de los roles listados (authroles.id).
 *
 * Mantener alineado con `ROLES_ADMIN_CONTROL_OPERATIVO` en el front
 * (`front-visor-gvr/src/modules/controloperativo/config/roles.constants.ts`).
 * Para ampliar permisos, añadir ids aquí (y revisar el front si aplica).
 */
export const REPORTE_ACTIVIDAD_WORD_ROLES_CON_HORAS_DEDICADAS: readonly number[] =
  [
    1, // Administrador Sistemas
    5, // Gerencia
    11, // Administrador GVR
  ] as const;

function idsRolesUsuario(
  roles: Array<{ id?: number | string | null } | null | undefined> | null | undefined,
): number[] {
  const out: number[] = [];
  for (const r of roles ?? []) {
    const raw = r?.id;
    if (raw == null) continue;
    const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
    if (Number.isFinite(n) && n > 0) out.push(n);
  }
  return out;
}

/** True si el export puede incluir horas dedicadas en el .docx del informe de actividades. */
export function usuarioTieneRolParaVerHorasDedicadasEnExportWordActividades(
  roles: Array<{ id?: number | string | null } | null | undefined> | null | undefined,
): boolean {
  const ids = idsRolesUsuario(roles);
  if (!ids.length) return false;
  return REPORTE_ACTIVIDAD_WORD_ROLES_CON_HORAS_DEDICADAS.some((rid) =>
    ids.includes(rid),
  );
}
