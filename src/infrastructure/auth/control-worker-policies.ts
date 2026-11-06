import type {
  AuthorizationPolicy,
  AuthorizationPolicyRegistry,
  AuthorizationScope,
} from '../../application/ports/authorization.port';
import type { DatabaseFunctionService } from '../database/database-function.service';
import { scopedOnlyPolicies } from './catalog-policies';

export const CONTROL_WORKER_RESOURCE = 'control_worker';
export const CONTROL_JORNADA_RESOURCE = 'control_jornada';
export const CONTROL_ACTIVITY_RESOURCE = 'control_activity';

type WorkerFacts = { owner: number | null; assigned: boolean };

/**
 * Hechos de un trabajador destino activo: propietario (su usuario) y si pertenece al equipo
 * del actor (`con_EquipoTrabajador`, la misma regla que los listados). Sin límite por empresa:
 * «todos» abarca a cualquier trabajador, como antes de los permisos granulares.
 * `sourceSql` resuelve el ID de trabajador a partir del ID del recurso ($2).
 */
function workerPolicy(
  database: DatabaseFunctionService,
  resourceType: string,
  allowedScopes: readonly AuthorizationScope[],
  sourceSql: string,
): AuthorizationPolicy {
  return {
    mode: 'resource',
    resourceType,
    allowedScopes,
    resolve: async (userId, resource) => {
      const id = Number(resource?.id);
      if (!Number.isSafeInteger(id) || id < 1)
        return { resource, activeBoundary: false, businessRulesAllow: false };
      const [facts] = await database.executeQuery<WorkerFacts>(
        `WITH destino AS (${sourceSql}),
        actor AS (SELECT t.id FROM public.tratrabajador t WHERE t.idusuario=$1 AND t.estado=1)
        SELECT w.idusuario AS owner,
          EXISTS (SELECT 1 FROM actor, public."con_EquipoTrabajador"(actor.id) eq
                  WHERE eq.idtrabajador=w.id) AS assigned
        FROM public.tratrabajador w JOIN destino ON destino.idtrabajador=w.id
        WHERE w.estado=1`,
        [userId, id],
      );
      return {
        resource,
        activeBoundary: !!facts,
        businessRulesAllow: !!facts,
        ownerUserId: facts?.owner ?? undefined,
        assignedUserIds: facts?.assigned ? [userId] : [],
      };
    },
  };
}

const ALL_SCOPES = ['propios', 'asignados', 'todos'] as const;

/** El trabajador de la URL nunca acredita su propia pertenencia: se consulta en servidor. */
export function controlWorkerPolicies(
  database: DatabaseFunctionService,
): AuthorizationPolicyRegistry {
  const worker = workerPolicy(
    database,
    CONTROL_WORKER_RESOURCE,
    ALL_SCOPES,
    'SELECT $2::integer AS idtrabajador',
  );
  const jornadaActividad = workerPolicy(
    database,
    CONTROL_JORNADA_RESOURCE,
    ALL_SCOPES,
    'SELECT j.idtrabajador FROM public.conjornada j WHERE j.id=$2 AND j.estado=1',
  );
  const actividad = workerPolicy(
    database,
    CONTROL_ACTIVITY_RESOURCE,
    ALL_SCOPES,
    'SELECT a.idtrabajador FROM public.conactividad a WHERE a.id=$2 AND a.estado=1',
  );
  const scoped = (codes: string[], scopes: readonly AuthorizationScope[]) =>
    Object.fromEntries(codes.map((code) => [code, scopes]));
  return new Map([
    ...['ver', 'crear', 'exportar_word', 'cambiar_estado'].map(
      (action) => [`control_operativo.jornadas.${action}`, worker] as const,
    ),
    // Registrar una actividad es una acción sobre la jornada donde se registra.
    ['control_operativo.actividades.crear', jornadaActividad] as const,
    ...[
      'ver',
      'editar',
      'eliminar',
      'subsanar',
      'adjuntar_evidencias',
      'ver_evidencias',
      'descargar_evidencias',
      'eliminar_evidencias',
    ].map(
      (action) =>
        [`control_operativo.actividades.${action}`, actividad] as const,
    ),
    // Listados y reportes: el guard exige la acción con algún alcance y el caso de uso filtra.
    ...scopedOnlyPolicies({
      ...scoped(
        ['ver', 'aprobar', 'observar', 'rechazar'].map(
          (a) => `control_operativo.validacion.${a}`,
        ),
        ['asignados', 'todos'],
      ),
      ...scoped(
        ['ver', 'crear', 'editar', 'eliminar', 'exportar_excel'].map(
          (a) => `control_operativo.entregables.${a}`,
        ),
        ['asignados', 'todos'],
      ),
      ...scoped(
        [
          'ver_general',
          'ver_horas_mes',
          'exportar_general_excel',
          'exportar_horas_excel',
          'exportar_word_masivo',
        ].map((a) => `control_operativo.reportes.${a}`),
        ['asignados', 'todos'],
      ),
      ...scoped(
        ['ver', 'exportar_excel'].map(
          (a) => `control_operativo.valorizacion.${a}`,
        ),
        ['asignados', 'todos'],
      ),
      ...scoped(
        ['ver', 'exportar_excel'].map(
          (a) => `control_operativo.desempeno.${a}`,
        ),
        ALL_SCOPES,
      ),
    }),
  ]);
}
