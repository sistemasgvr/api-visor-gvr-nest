import type {
  AuthorizationPolicy,
  AuthorizationPolicyRegistry,
} from '../../application/ports/authorization.port';
import type { DatabaseFunctionService } from '../database/database-function.service';
import { SELF_RESOURCE } from './granular-permission.guard';

/** Acciones del catálogo cuyo único alcance es `global` (administrativas, sin recurso). */
export const GLOBAL_ACTIONS: Record<string, readonly string[]> = {
  'comunicaciones.envios_correo': [
    'ver',
    'ver_logs',
    'reenviar',
    'reenviar_pendientes',
  ],
  'comunicaciones.novedades': [
    'ver',
    'crear',
    'editar',
    'eliminar',
    'asignar_roles',
    'crear_tarjetas',
    'editar_tarjetas',
    'eliminar_tarjetas',
    'subir_contenido',
  ],
  'comunicaciones.plantillas_correo': [
    'ver',
    'crear',
    'editar',
    'eliminar',
    'cambiar_estado',
    'editar_variables_prueba',
    'enviar_prueba',
    'previsualizar',
    'restaurar_sistema',
    'ver_historial',
    'eliminar_historial',
  ],
  'configuracion.calendarios': [
    'ver',
    'crear',
    'editar',
    'duplicar',
    'cambiar_estado',
    'crear_version',
    'editar_semana',
    'crear_excepcion',
    'editar_excepcion',
    'eliminar_excepcion',
    'publicar',
    'consultar_disponibilidad',
  ],
  'configuracion.catalogos': ['crear_opciones'],
  'configuracion.feriados': ['ver', 'crear', 'editar', 'eliminar'],
  'empresas.empresas': ['ver', 'crear', 'editar', 'eliminar', 'subir_logo'],
  'gestion_bim.almacenamiento_acc': ['ver', 'crear', 'eliminar'],
  'gestion_bim.empresas_acc': [
    'ver',
    'crear',
    'editar',
    'editar_imagen',
    'importar',
  ],
  'gestion_bim.recursos_acc_legacy': ['ver', 'crear', 'editar'],
  'gestion_bim.recursos_acc': [
    'ver',
    'ver_permisos',
    'asignar_permisos_rol',
    'asignar_permisos_usuario',
  ],
  'gestion_bim.unidades_negocio_acc': ['ver', 'gestionar'],
  'gestion_bim.usuarios_cuenta_acc': ['ver', 'crear', 'editar', 'importar'],
  'inicio.indicadores': [
    'ver',
    'ver_proyectos_vigentes',
    'ver_trabajadores_activos',
    'ver_actividades_pendientes',
    'ver_actividades_observadas',
    'ver_actividades_rechazadas',
    'ver_trabajadores_por_proyecto',
    'ver_jornadas_completas',
    'ver_ranking_horas',
    'ver_usuarios_conectados',
    'ver_horas_esperadas_registradas',
    'ver_progreso_proyectos',
    'ver_estadisticas_usuarios',
    'ver_sin_actividades',
    'ver_sin_jornada',
  ],
  'proyectos.proyectos': ['crear', 'exportar_excel'],
  'seguridad.auditoria': [
    'ver',
    'ver_estadisticas',
    'ver_historial_entidad',
    'ver_historial_usuario',
  ],
  'usuarios.contratos': ['ver', 'crear', 'editar', 'eliminar'],
  'usuarios.credenciales': ['editar', 'restablecer_contrasena'],
  'usuarios.roles_usuario': ['ver', 'asignar'],
  'usuarios.trabajadores': [
    'ver',
    'crear',
    'editar',
    'activar',
    'desactivar',
    'exportar_excel',
    'ver_firma',
    'ver_foto',
  ],
};

/** Acciones personales: sólo alcance `propios` sobre la propia identidad. */
export const SELF_ACTIONS: Record<string, readonly string[]> = {
  'comunicaciones.notificaciones': [
    'ver',
    'eliminar',
    'eliminar_todas',
    'marcar_entregadas',
  ],
  'comunicaciones.novedades': ['marcar_vista'],
  'configuracion.autodesk': ['vincular_cuenta', 'revocar_vinculo'],
  'inicio.perfil': [
    'ver',
    'cambiar_contrasena',
    'cerrar_sesiones',
    'editar_firma',
    'editar_foto',
  ],
};

const codesOf = (groups: Record<string, readonly string[]>) =>
  Object.entries(groups).flatMap(([option, actions]) =>
    actions.map((action) => `${option}.${action}`),
  );

const globalPolicy: AuthorizationPolicy = {
  mode: 'global',
  allowedScopes: ['global'],
  resolve: () =>
    Promise.resolve({
      resource: null,
      activeBoundary: true,
      businessRulesAllow: true,
    }),
};

export function catalogGlobalPolicies(): AuthorizationPolicyRegistry {
  return new Map(codesOf(GLOBAL_ACTIONS).map((code) => [code, globalPolicy]));
}

/** El recurso `self` es el propio actor: el guard lo fija con el ID del JWT, nunca con datos de la petición. */
export function selfPolicies(): AuthorizationPolicyRegistry {
  const policy: AuthorizationPolicy = {
    mode: 'resource',
    resourceType: SELF_RESOURCE,
    allowedScopes: ['propios'],
    resolve: (userId, resource) =>
      Promise.resolve({
        resource,
        activeBoundary: resource?.id === String(userId),
        businessRulesAllow: true,
        ownerUserId: resource?.id === String(userId) ? userId : undefined,
      }),
  };
  return new Map(codesOf(SELF_ACTIONS).map((code) => [code, policy]));
}

/**
 * Acciones que sólo se usan para filtrar listados por alcance (`RequireScopedPermission`):
 * no autorizan un recurso concreto por sí solas.
 */
export function scopedOnlyPolicies(
  entries: Record<string, AuthorizationPolicy['allowedScopes']>,
): AuthorizationPolicyRegistry {
  return new Map(
    Object.entries(entries).map(([code, allowedScopes]) => [
      code,
      {
        mode: 'resource' as const,
        resourceType: 'scoped_listing',
        allowedScopes,
        resolve: (_userId: number, resource) =>
          Promise.resolve({
            resource,
            activeBoundary: false,
            businessRulesAllow: false,
          }),
      },
    ]),
  );
}

export const GVR_PROJECT_RESOURCE = 'gvr_project';
export const GVR_PROJECT_ACTIONS: Record<string, readonly string[]> = {
  'proyectos.proyectos': ['ver', 'editar', 'eliminar', 'configurar'],
  'proyectos.accesos': ['ver', 'asignar', 'cambiar_nivel', 'retirar'],
  'proyectos.coordinadores': ['ver', 'asignar', 'gestionar_equipo'],
  'proyectos.documentos': ['ver', 'crear', 'editar', 'eliminar'],
};

/**
 * Proyectos de empresa (proproyecto). «asignados» = la persona tiene acceso activo
 * al proyecto (proaccesoproyecto) o es su coordinador; «todos» = cualquier proyecto activo.
 */
export function gvrProjectPolicies(
  database: DatabaseFunctionService,
): AuthorizationPolicyRegistry {
  const policy: AuthorizationPolicy = {
    mode: 'resource',
    resourceType: GVR_PROJECT_RESOURCE,
    allowedScopes: ['asignados', 'todos'],
    resolve: async (userId, resource) => {
      const id = Number(resource?.id);
      if (!Number.isSafeInteger(id) || id < 1)
        return { resource, activeBoundary: false, businessRulesAllow: false };
      const [facts] = await database.executeQuery<{
        exists: boolean;
        assigned: boolean;
      }>(
        `SELECT EXISTS (SELECT 1 FROM public.proproyecto p WHERE p.id=$2 AND p.estado=1) AS exists,
          (EXISTS (SELECT 1 FROM public.proaccesoproyecto ap
             WHERE ap.idproyecto=$2 AND ap.idusuario=$1 AND ap.estado=1)
           OR EXISTS (SELECT 1 FROM public.proproyectocoordinador pc
             JOIN public.tratrabajador t ON t.id=pc.idtrabajador AND t.estado=1
             WHERE pc.idproyecto=$2 AND pc.estado=1 AND t.idusuario=$1)) AS assigned`,
        [userId, id],
      );
      return {
        resource,
        activeBoundary: facts?.exists === true,
        businessRulesAllow: true,
        assignedUserIds: facts?.assigned ? [userId] : [],
      };
    },
  };
  return new Map(codesOf(GVR_PROJECT_ACTIONS).map((code) => [code, policy]));
}

/** IDs de proyectos de empresa asignados a la persona (para filtrar listados con «asignados»). */
export async function assignedGvrProjectIds(
  database: DatabaseFunctionService,
  userId: number,
): Promise<number[]> {
  const rows = await database.executeQuery<{ id: number }>(
    `SELECT DISTINCT p.id FROM public.proproyecto p
     WHERE p.estado=1 AND (
       EXISTS (SELECT 1 FROM public.proaccesoproyecto ap WHERE ap.idproyecto=p.id AND ap.idusuario=$1 AND ap.estado=1)
       OR EXISTS (SELECT 1 FROM public.proproyectocoordinador pc
         JOIN public.tratrabajador t ON t.id=pc.idtrabajador AND t.estado=1
         WHERE pc.idproyecto=p.id AND pc.estado=1 AND t.idusuario=$1))`,
    [userId],
  );
  return rows.map((row) => Number(row.id));
}
