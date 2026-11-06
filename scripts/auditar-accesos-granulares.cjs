/* Auditoría reproducible de accesos. Solo lee gvr_desarrollo mediante Docker.
 * No inicia AppModule, no llama integraciones ni ejecuta operaciones de negocio.
 * Una definición de catálogo no se contabiliza como autorización implementada.
 */
require('reflect-metadata');
require('ts-node/register/transpile-only');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { Reflector } = require('@nestjs/core');
const { RequestMethod } = require('@nestjs/common');
const {
  PATH_METADATA,
  METHOD_METADATA,
  GUARDS_METADATA,
} = require('@nestjs/common/constants');
const {
  isSessionEndpoint,
} = require('../src/infrastructure/auth/http-authorization-exceptions');
const {
  GranularPermissionGuard,
  GRANULAR_REQUIREMENT,
} = require('../src/infrastructure/auth/granular-permission.guard');
const sql = `BEGIN READ ONLY;
SET LOCAL statement_timeout='30s';
WITH catalog AS (
 SELECT p.id, m.codigo||'.'||o.codigo||'.'||p.accion AS code,
 m.nombre AS module, o.nombre AS option, p.nombre AS name,
 ARRAY(SELECT pa.alcance FROM public.authpermisosalcances pa WHERE pa.idpermiso=p.id AND pa.estado=1 ORDER BY 1) AS scopes
 FROM public.authpermisosgranulares p JOIN public.authopciones o ON o.id=p.idopcion AND o.estado=1
 JOIN public.authmodulos m ON m.id=o.idmodulo AND m.estado=1 WHERE p.estado=1
), roles AS (
 SELECT r.id,r.nombre AS name,
 COALESCE((SELECT jsonb_agg(jsonb_build_object('code',g.code,'scopes',g.scopes) ORDER BY g.code)
 FROM (SELECT c.code,array_agg(DISTINCT rp.alcance ORDER BY rp.alcance) AS scopes
 FROM public.authrolespermisosgranulares rp JOIN catalog c ON c.id=rp.idpermiso
 WHERE rp.idrol=r.id AND rp.estado=1 AND rp.alcance=ANY(c.scopes) GROUP BY c.code) g),'[]'::jsonb) AS grants
 FROM public.authroles r WHERE r.estado=1
), memberships AS (
 SELECT u.id,array_agg(ur.idrol ORDER BY ur.idrol) AS roles FROM public.authusuarios u
 JOIN public.authusuariosroles ur ON ur.idusuario=u.id AND ur.estado=1
 JOIN public.authroles r ON r.id=ur.idrol AND r.estado=1 WHERE u.estado=1 GROUP BY u.id
)
SELECT jsonb_build_object('database',current_database(),'catalog',(SELECT jsonb_agg(c ORDER BY code) FROM catalog c),
 'roles',(SELECT jsonb_agg(r ORDER BY id) FROM roles r),
 'membershipSummary',jsonb_build_object('activeUsers',(SELECT count(*) FROM memberships),'multipleRoles',(SELECT count(*) FROM memberships WHERE cardinality(roles)>1),
 'coordinatorUsers',(SELECT count(*) FROM memberships WHERE 4=ANY(roles)),
 'coordinatorWithOtherRoles',(SELECT count(*) FROM memberships WHERE 4=ANY(roles) AND cardinality(roles)>1)),
 'menus',(SELECT jsonb_agg(jsonb_build_object('id',m.id,'parent',m.idpadre,'name',m.nombre,'url',m.url,'codes',
   ARRAY(SELECT c.code FROM public.genmenupermisosgranulares mp JOIN catalog c ON c.id=mp.idpermiso WHERE mp.idmenu=m.id AND mp.estado=1 ORDER BY c.code)))
   FROM public.genmenurecursivo m WHERE m.estado=1),
 'principals',(SELECT jsonb_agg(jsonb_build_object('roles',memberships.roles,
   'effective',(SELECT jsonb_agg(jsonb_build_object('code',e.codigo,'scopes',e.alcances) ORDER BY e.codigo) FROM public."auth_ObtenerPermisosEfectivos"(memberships.id) e),
   'menus',(SELECT jsonb_agg(jsonb_build_object('id',m.id,'direct',m.accesodirecto,'url',m.url) ORDER BY m.id) FROM public."gen_ResolverMenuGranularUsuario"(memberships.id) m))) FROM memberships))::text;
ROLLBACK;`;
const result = spawnSync(
  'docker',
  [
    'exec',
    '-i',
    'gvr-postgres-local',
    'psql',
    '-U',
    'supabase_admin',
    '-d',
    'gvr_desarrollo',
    '-X',
    '-A',
    '-t',
    '-v',
    'ON_ERROR_STOP=1',
  ],
  { input: sql, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
);
if (result.status !== 0)
  throw Error('No se pudo leer la copia Docker: ' + result.stderr);
const snapshot = JSON.parse(
  result.stdout.split(/\r?\n/).find((line) => line.startsWith('{')),
);
if (snapshot.database !== 'gvr_desarrollo') throw Error('Base no autorizada');
const proposed = JSON.parse(
  fs.readFileSync(
    path.resolve(
      __dirname,
      '../../api-visor-gvr-sql/docs/permisos/auditoria-cobertura.json',
    ),
    'utf8',
  ),
).endpoints;
const reflector = new Reflector();
const routes = [];
const importErrors = [];
const dir = path.resolve(__dirname, '../src/presentation/controllers');
for (const file of fs
  .readdirSync(dir)
  .filter((name) => name.endsWith('.controller.ts'))) {
  let exports;
  try {
    exports = require(path.join(dir, file));
  } catch (error) {
    importErrors.push({ file, error: String(error.message) });
    continue;
  }
  for (const Controller of Object.values(exports)) {
    if (
      typeof Controller !== 'function' ||
      !Reflect.hasMetadata(PATH_METADATA, Controller)
    )
      continue;
    for (const name of Object.getOwnPropertyNames(Controller.prototype)) {
      const handler = Controller.prototype[name];
      if (
        typeof handler !== 'function' ||
        !Reflect.hasMetadata(METHOD_METADATA, handler)
      )
        continue;
      const mapping = proposed.find(
        (e) => e.controlador === Controller.name && e.funcion === name,
      );
      const codes = reflector.getAllAndOverride(GRANULAR_REQUIREMENT, [
        handler,
        Controller,
      ]);
      const guards = [
        ...(Reflect.getMetadata(GUARDS_METADATA, Controller) || []),
        ...(Reflect.getMetadata(GUARDS_METADATA, handler) || []),
      ].map((g) => g.name || g.constructor?.name);
      const item = {
        controller: Controller.name,
        handler: name,
        file,
        method: RequestMethod[Reflect.getMetadata(METHOD_METADATA, handler)],
        path: [
          Reflect.getMetadata(PATH_METADATA, Controller),
          Reflect.getMetadata(PATH_METADATA, handler),
        ]
          .flat()
          .join('/')
          .replace(/\/+/g, '/'),
        category: mapping?.categoria || 'sin_clasificar',
        proposedCodes: mapping?.permisosPropuestos?.map((p) => p.codigo) || [],
        requiredCodes: codes || [],
        hasExplicitRequirement: codes !== undefined,
        otherGuards: guards,
      };
      routes.push({ item, Controller, handler });
    }
  }
}
function expectedMenus(grants) {
  const codes = new Set(grants.map((grant) => grant.code));
  const nodes = snapshot.menus || [];
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const reachable = (id) => {
    const seen = new Set();
    let node = byId.get(id);
    while (node) {
      if (seen.has(node.id)) return false;
      seen.add(node.id);
      if (node.parent === null) return true;
      node = byId.get(node.parent);
    }
    return false;
  };
  const direct = new Set(
    nodes
      .filter(
        (node) =>
          reachable(node.id) &&
          node.url?.trim() &&
          node.codes.some((code) => codes.has(code)),
      )
      .map((node) => node.id),
  );
  const visible = new Set(direct);
  for (const id of direct) {
    let parent = byId.get(id)?.parent;
    while (parent != null && !visible.has(parent)) {
      visible.add(parent);
      parent = byId.get(parent)?.parent;
    }
  }
  return nodes
    .filter((node) => visible.has(node.id))
    .map((node) => ({
      id: node.id,
      direct: direct.has(node.id),
      url: direct.has(node.id) ? node.url : null,
    }))
    .sort((a, b) => a.id - b.id);
}
function normalize(grants) {
  return (grants || [])
    .map((grant) => ({ code: grant.code, scopes: [...grant.scopes].sort() }))
    .sort((a, b) => a.code.localeCompare(b.code));
}
function unionOfRoles(roleIds) {
  const combined = new Map();
  for (const role of snapshot.roles.filter((role) => roleIds.includes(role.id)))
    for (const grant of role.grants) {
      const scopes = combined.get(grant.code) || new Set();
      grant.scopes.forEach((scope) => scopes.add(scope));
      combined.set(grant.code, scopes);
    }
  return [...combined].map(([code, scopes]) => ({ code, scopes: [...scopes] }));
}
function verifyEffectiveAndMenuFunctions() {
  const results = (snapshot.principals || []).map((principal) => {
    const union = unionOfRoles(principal.roles);
    const expected = expectedMenus(union);
    const actual = (principal.menus || [])
      .map((node) => ({ id: node.id, direct: node.direct, url: node.url }))
      .sort((a, b) => a.id - b.id);
    return {
      roleIds: principal.roles,
      grantsMatch:
        JSON.stringify(normalize(union)) ===
        JSON.stringify(normalize(principal.effective)),
      menusMatch: JSON.stringify(expected) === JSON.stringify(actual),
    };
  });
  return {
    principalsChecked: results.length,
    grantsPassed: results.filter((result) => result.grantsMatch).length,
    menusPassed: results.filter((result) => result.menusMatch).length,
    failures: results.filter(
      (result) => !result.grantsMatch || !result.menusMatch,
    ),
  };
}
async function probeOperationalHttp() {
  const { Test } = require('@nestjs/testing');
  const request = require('supertest');
  const { ConfigService } = require('@nestjs/config');
  const { JwtAuthGuard } = require('../src/infrastructure/auth/jwt-auth.guard');
  const {
    ControlOperativoController,
  } = require('../src/presentation/controllers/control-operativo.controller');
  let role;
  let handlerCalls = 0;
  let permissionChecks = 0;
  const jwt = {
    canActivate(context) {
      context.switchToHttp().getRequest().user = {
        sub: 1,
        id: 1,
        roles: [{ id: role.id }],
      };
      return true;
    },
  };
  const dependencies = Reflect.getMetadata(
    'design:paramtypes',
    ControlOperativoController,
  );
  const module = await Test.createTestingModule({
    controllers: [ControlOperativoController],
    providers: dependencies.map((provide) => ({
      provide,
      useValue:
        provide === ConfigService
          ? { get: () => undefined }
          : {
              execute: async () => {
                handlerCalls++;
                return { data: [], pagination: { total: 0 } };
              },
            },
    })),
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(jwt)
    .compile();
  const app = module.createNestApplication({ logger: false });
  app.useGlobalGuards(
    new GranularPermissionGuard(reflector, jwt, {
      can: async () => {
        permissionChecks++;
        return false;
      },
    }),
  );
  await app.init();
  const results = [];
  try {
    for (role of snapshot.roles) {
      const response = await request(app.getHttpServer()).get(
        '/control-operativo/actividades',
      );
      results.push({
        roleId: role.id,
        role: role.name,
        method: 'GET',
        path: '/control-operativo/actividades',
        expected: 403,
        actual: response.status,
        passed: response.status === 403,
      });
    }
  } finally {
    await app.close();
  }
  return {
    identity:
      'Identidad autenticada simulada por rol; cero concesiones. No se usan credenciales ni datos de usuarios.',
    businessData:
      'Use-cases sustituidos por datos vacíos; no se ejecuta la base ni integraciones.',
    handlerCalls,
    permissionChecks,
    results,
  };
}
(async () => {
  const functions = verifyEffectiveAndMenuFunctions();
  const httpProbe = await probeOperationalHttp();
  const negative = [];
  for (const role of snapshot.roles) {
    let calls = 0;
    // Ausencia de concesiones: ni un rol privilegiado en JWT debe autorizar la operación.
    const guard = new GranularPermissionGuard(
      reflector,
      { canActivate: () => true },
      {
        can: async () => {
          calls++;
          return false;
        },
      },
    );
    for (const route of routes) {
      const context = {
        getHandler: () => route.handler,
        getClass: () => route.Controller,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { sub: 1, roles: [{ id: role.id }] },
            params: {
              projectId: '00000000-0000-4000-8000-000000000001',
              issueId: 'issue-prueba',
              id: '1',
            },
          }),
        }),
      };
      let decision;
      try {
        decision = (await guard.canActivate(context))
          ? 'continua_sin_rechazo_granular'
          : 'denegado';
      } catch (error) {
        decision = error.getStatus?.() === 403 ? 'denegado' : 'error';
      }
      const sessionException = isSessionEndpoint(
        route.item.controller,
        route.item.handler,
      );
      negative.push({
        roleId: role.id,
        controller: route.item.controller,
        handler: route.item.handler,
        decision,
        sessionException,
        passed: sessionException
          ? decision === 'continua_sin_rechazo_granular'
          : decision === 'denegado',
      });
    }
  }
  const matrix = snapshot.roles.map((role) => ({
    id: role.id,
    name: role.name,
    actions: snapshot.catalog.map((permission) => ({
      code: permission.code,
      grantedScopes:
        role.grants.find((g) => g.code === permission.code)?.scopes || [],
      routes: routes.filter((r) =>
        r.item.requiredCodes.includes(permission.code),
      ).length,
      proposedRoutes: routes.filter((r) =>
        r.item.proposedCodes.includes(permission.code),
      ).length,
    })),
  }));
  const report = {
    generatedAt: new Date().toISOString(),
    database: snapshot.database,
    productionReady: false,
    limitations: [
      'Las pruebas negativas ejercitan el guard real con identidad autenticada y ninguna concesión. No ejecutan los handlers ni sustituyen pruebas de ACL por recurso.',
      'requiredCodes vacío señala falta de requisito específico: el guard global lo bloquea por defecto. Otros guards y comprobaciones internas no equivalen a una política de acción completa.',
      'La matriz por rol lee concesiones reales de Docker. Un usuario con varios roles recibe la unión de permisos.',
    ],
    summary: {
      businessRoutesWithoutExplicitRequirement: routes.filter(
        (r) =>
          r.item.category === 'operacion_de_negocio' &&
          !r.item.hasExplicitRequirement,
      ).length,
      httpWithoutGrantRejected: httpProbe.results.filter((t) => t.passed)
        .length,
      httpWithoutGrantTotal: httpProbe.results.length,
      roles: snapshot.roles.length,
      permissions: snapshot.catalog.length,
      rolePermissionCombinations: matrix.reduce(
        (n, r) => n + r.actions.length,
        0,
      ),
      routes: routes.length,
      withExplicitRequirement: routes.filter(
        (r) => r.item.hasExplicitRequirement,
      ).length,
      withoutExplicitRequirement: routes.filter(
        (r) => !r.item.hasExplicitRequirement,
      ).length,
      negativeTests: negative.length,
      negativePassed: negative.filter((t) => t.passed).length,
      sessionExceptions: negative.filter((t) => t.sessionException).length,
      negativeDenied: negative.filter((t) => t.decision === 'denegado').length,
      negativeNotDenied: negative.filter(
        (t) => t.decision === 'continua_sin_rechazo_granular',
      ).length,
    },
    membershipSummary: snapshot.membershipSummary,
    functions,
    roleMenus: snapshot.roles.map((role) => ({
      roleId: role.id,
      role: role.name,
      menus: expectedMenus(role.grants),
    })),
    httpProbe,
    importErrors,
    roles: matrix,
    routes: routes.map((r) => r.item),
    negativeTests: negative,
  };
  const output = path.resolve(__dirname, '../.tmp/auditoria-accesos');
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(
    path.join(output, 'resultado.json'),
    JSON.stringify(report, null, 2),
  );
  const cell = (value) => '"' + String(value).replace(/"/g, '""') + '"';
  const csv = [
    'Rol,Permiso,Alcances,RutasConGuard,RutasPropuestas',
    ...matrix.flatMap((role) =>
      role.actions.map((action) =>
        [
          role.name,
          action.code,
          action.grantedScopes.join('|'),
          action.routes,
          action.proposedRoutes,
        ]
          .map(cell)
          .join(','),
      ),
    ),
  ].join('\n');
  fs.writeFileSync(path.join(output, 'roles-permisos.csv'), '\uFEFF' + csv);
  const escape = (value) =>
    String(value).replace(
      /[&<>\"]/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' })[c],
    );
  const rows = report.routes
    .map(
      (r) =>
        `<tr><td>${escape(r.controller + '.' + r.handler)}</td><td>${escape(r.method + ' /' + r.path)}</td><td>${r.hasExplicitRequirement ? 'Requisito granular declarado' : isSessionEndpoint(r.controller, r.handler) ? 'Excepción de sesión/salud' : 'POLÍTICA PENDIENTE · bloqueada'}</td><td>${escape(r.proposedCodes.join(', '))}</td></tr>`,
    )
    .join('');
  const roleRows = matrix
    .map(
      (r) =>
        `<tr><td>${escape(r.name)}</td><td>${r.actions.filter((a) => a.grantedScopes.length).length}</td><td>${r.actions.filter((a) => !a.grantedScopes.length).length}</td></tr>`,
    )
    .join('');
  fs.writeFileSync(
    path.join(output, 'resultado.html'),
    `<!doctype html><html lang="es"><meta charset="utf-8"><title>Auditoría de accesos local</title><style>body{font:15px system-ui;max-width:1500px;margin:30px auto;padding:20px;color:#172033}table{border-collapse:collapse;width:100%;font-size:13px}td,th{border:1px solid #ddd;padding:9px;text-align:left}th{background:#edf3ff}strong{color:#b42318}code{white-space:pre-wrap}</style><h1>Auditoría de accesos · copia local</h1><strong>NO APTO PARA PRODUCCIÓN</strong><p>${report.summary.roles} roles · ${report.summary.permissions} permisos activos · ${report.summary.routes} rutas HTTP · ${report.summary.withExplicitRequirement} requisitos declarados</p><p><b>Prueba HTTP sin concesiones:</b> ${report.httpProbe.results.filter((test) => test.passed).length}/${report.httpProbe.results.length} rechazos correctos. Las rutas pendientes se bloquean por defecto; esto no certifica su funcionamiento con permisos.</p><p><b>Funciones de base local:</b> permisos efectivos ${report.functions.grantsPassed}/${report.functions.principalsChecked}; menú ${report.functions.menusPassed}/${report.functions.principalsChecked}.</p><p>Pruebas negativas del guard, sin ejecutar acciones de negocio. Ver JSON para cada combinación rol × permiso y rol × ruta. Los controles internos y alcances por recurso requieren pruebas adicionales.</p><h2>Roles</h2><table><tr><th>Rol</th><th>Acciones concedidas</th><th>Sin concesión</th></tr>${roleRows}</table><h2>Rutas</h2><table><tr><th>Handler</th><th>Ruta</th><th>Control granular</th><th>Mapeo propuesto (no equivale a autorización)</th></tr>${rows}</table></html>`,
  );
  console.log(
    JSON.stringify(
      {
        summary: report.summary,
        membershipSummary: report.membershipSummary,
        functions,
        httpProbe,
        importErrors,
        output,
      },
      null,
      2,
    ),
  );
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
