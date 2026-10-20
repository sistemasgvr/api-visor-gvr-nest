/* Gate de cobertura de todas las rutas HTTP: no usa BD ni ejecuta handlers. */
require('reflect-metadata');
require('ts-node/register/transpile-only');
const fs = require('node:fs');
const path = require('node:path');
const { PATH_METADATA } = require('@nestjs/common/constants');
const {
  inspectHttpAuthorization,
} = require('../src/infrastructure/auth/authorization-readiness.service');
const { controlWorkerPolicies } = require('../src/infrastructure/auth/control-worker-policies');
const {
  catalogGlobalPolicies,
  gvrProjectPolicies,
  selfPolicies,
} = require('../src/infrastructure/auth/catalog-policies');
const {
  securityPolicies,
  projectPolicies,
  issuePolicies,
} = require('../src/composition/modules/platform/authorization.module');
const dir = path.resolve(__dirname, '../src/presentation/controllers');
const controllers = [];
for (const file of fs
  .readdirSync(dir)
  .filter((file) => file.endsWith('.controller.ts'))) {
  for (const type of Object.values(require(path.join(dir, file))))
    if (typeof type === 'function' && Reflect.hasMetadata(PATH_METADATA, type))
      controllers.push(type);
}
// Solo se inspecciona el registro de políticas. No se resuelven recursos ni se llama a proveedores.
const unavailable = new Proxy(
  {},
  {
    get() {
      throw Error('El gate de cobertura no consulta recursos');
    },
  },
);
const policies = new Map([
  ...catalogGlobalPolicies(),
  ...selfPolicies(),
  ...gvrProjectPolicies(unavailable),
  ...securityPolicies(),
  ...projectPolicies(unavailable),
  ...issuePolicies(unavailable, unavailable),
  ...controlWorkerPolicies(unavailable),
]);
const gaps = inspectHttpAuthorization(controllers, policies);
const output = path.resolve(__dirname, '../.tmp/auditoria-accesos');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(
  path.join(output, 'cobertura-produccion.json'),
  JSON.stringify(
    {
      productionReady: false,
      controllers: controllers.length,
      policies: policies.size,
      gaps,
      limitation:
        'La ausencia de huecos declarativos no sustituye las pruebas de alcances y de acceso a recursos ajenos.',
    },
    null,
    2,
  ),
);
if (gaps.length) {
  console.error(
    `AUTHORIZATION_NOT_READY: ${gaps.length} rutas sin requisito granular o con políticas sin implementar. Producción bloqueada.`,
  );
  for (const gap of gaps.slice(0, Number(process.env.GAPS_LIMIT || 16)))
    console.error(`${gap.endpoint}: ${gap.reason} ${gap.codes.join(', ')}`);
  process.exitCode = 1;
} else
  console.log(
    'Cobertura declarativa sin huecos; comprobar además pruebas de recursos, alcances y frontend.',
  );
