/* Extrae solo firmas de retorno y campos de tablas. No ejecuta SQL ni lee conexiones. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
function readSqlContracts() {
  const unknown = {
    description:
      'Contenido JSON de estructura variable definido por el proveedor o la consulta de esta operación.',
    'x-dynamic-json': true,
  };
  const rowModels = new Map();
  const sqlShapes = new Map();
  const sqlDir = path.resolve(root, '../api-visor-gvr-sql/schema/02-functions');
  function sqlFiles(dir) {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .flatMap((e) =>
        e.isDirectory()
          ? sqlFiles(path.join(dir, e.name))
          : [path.join(dir, e.name)],
      );
  }
  for (const file of fs.existsSync(sqlDir) ? sqlFiles(sqlDir) : []) {
    if (!file.endsWith('.sql')) continue;
    const sql = fs.readFileSync(file, 'utf8');
    const match = sql.match(
      /CREATE (?:OR REPLACE )?FUNCTION (?:public\.)?"?([^"\s(]+)"?[\s\S]+?RETURNS TABLE\s*\(([\s\S]*?)\)\s*(?:LANGUAGE|AS)/i,
    );
    if (!match) continue;
    const properties = {};
    for (const col of match[2].split(/,(?![^()]*\))/)) {
      const m = col.trim().match(/^"?([^"\s]+)"?\s+(.+)$/);
      if (!m) continue;
      const type = m[2].toLowerCase();
      properties[m[1]] =
        /^(?:smallint|integer|bigint|int\d*|numeric|decimal|real|double)/.test(
          type,
        )
          ? { type: 'number' }
          : /^bool/.test(type)
            ? { type: 'boolean' }
            : /^date/.test(type)
              ? { type: 'string', format: 'date' }
              : /^timestamp/.test(type)
                ? { type: 'string', format: 'date-time' }
                : /^(?:character|varchar|text|time|uuid)/.test(type)
                  ? { type: 'string' }
                  : { ...unknown };
    }
    if (Object.keys(properties).length)
      sqlShapes.set(match[1], { type: 'object', properties });
  }
  const rowTables = {
    PlanProyecto: 'proyectos/plaplanproyecto',
    ActividadPlan: 'actividades/plaactividad',
    AsignacionPlan: 'actividades/plaasignacion',
    AsignacionColaboradorPlan: 'actividades/plaasignacion',
    DependenciaActividadPlan: 'actividades/pladependenciaactividad',
    AmpliacionPlan: 'ejecucion/plaampliacion',
  };
  for (const [model, rel] of Object.entries(rowTables)) {
    const file = path.resolve(
      root,
      '../api-visor-gvr-sql/schema/01-tables/planificacion/' + rel + '.sql',
    );
    if (!fs.existsSync(file)) continue;
    const sql = fs.readFileSync(file, 'utf8');
    const fields = {};
    for (const line of sql.split('\n')) {
      const col = line
        .trim()
        .match(
          /^([a-z][a-z0-9_]*) (integer|smallint|numeric|boolean|varchar\([^)]*\)|text|date|timestamptz|timestamp without time zone)(.*)$/,
        );
      if (!col) continue;
      const type = col[2];
      const shape = /^(?:integer|smallint|numeric)/.test(type)
        ? { type: 'number' }
        : type === 'boolean'
          ? { type: 'boolean' }
          : type === 'date'
            ? { type: 'string', format: 'date' }
            : type.startsWith('timestamp')
              ? { type: 'string', format: 'date-time' }
              : { type: 'string' };
      if (!col[3].includes('NOT NULL') && !col[3].includes('PRIMARY KEY'))
        shape.nullable = true;
      fields[col[1]] = shape;
    }
    rowModels.set(model, fields);
  }
  return {
    version: 1,
    functions: Object.fromEntries(sqlShapes),
    tables: Object.fromEntries(rowModels),
  };
}
module.exports = { readSqlContracts };
if (require.main === module) {
  if (!fs.existsSync(path.resolve(root, '../api-visor-gvr-sql/schema')))
    throw Error(
      'Para actualizar las firmas se necesita api-visor-gvr-sql junto al backend. La generación normal usa el snapshot versionado.',
    );
  const contracts = readSqlContracts();
  fs.writeFileSync(
    path.join(__dirname, 'sql-contracts.snapshot.json'),
    JSON.stringify(contracts, null, 2) + '\n',
  );
  console.log(
    'Snapshot SQL actualizado: ' +
      Object.keys(contracts.functions).length +
      ' funciones, ' +
      Object.keys(contracts.tables).length +
      ' modelos de fila. Sin conexión a base de datos.',
  );
}
