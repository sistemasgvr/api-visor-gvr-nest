const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
const { generate } = require('./generate.cjs');
const root = path.resolve(__dirname, '../..');
const { result, registry } = generate();
assert.ok(
  fs
    .readFileSync(
      path.join(root, 'src/presentation/openapi/contracts.generated.json'),
      'utf8',
    )
    .replaceAll('\r\n', '\n') ===
    JSON.stringify(result, null, 2) + '\n',
  'Contratos OpenAPI desactualizados. Ejecute npm run docs:generate.',
);
assert.equal(
  fs
    .readFileSync(
      path.join(root, 'src/presentation/openapi/dto-registry.generated.ts'),
      'utf8',
    )
    .replaceAll('\r\n', '\n'),
  registry,
  'Registro de modelos desactualizado. Ejecute npm run docs:generate.',
);
for (const [id, op] of Object.entries(result.operations)) {
  assert.ok(op.summary, `${id}: falta resumen`);
  assert.ok(
    op.response || op.redirect || op.noContent,
    `${id}: respuesta sin contrato`,
  );
}
console.log(
  `OpenAPI sincronizado: ${Object.keys(result.operations).length} operaciones; solicitudes Zod y modelos de respuesta verificados.`,
);
