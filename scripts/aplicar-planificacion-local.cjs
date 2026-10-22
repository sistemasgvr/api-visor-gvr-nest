/* Aplica exclusivamente a la copia local autorizada. No acepta hosts remotos.
 * Ejecutar desde api-visor-gvr-nest: node scripts/aplicar-planificacion-local.cjs
 * Usa DATABASE_URL del entorno o .env; nunca imprime credenciales.
 * Seeds y funciones en una transacción. No borra funciones ni datos existentes. */
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const root = path.resolve(__dirname, '..');
const sqlRoot = path.resolve(root, '../api-visor-gvr-sql');
const files = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const unwrap = sql => sql.replace(/^BEGIN;\s*$/mi, '').replace(/^COMMIT;\s*$/mi, '');
async function main() {
 const localEnv = fs.readFileSync(path.join(root, '.env'), 'utf8').match(/^DATABASE_URL\s*=\s*["']?([^\r\n"']+)/m)?.[1];
 const url = new URL(process.env.DATABASE_URL || localEnv);
 if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.port !== '5434' || url.pathname !== '/gvr_produccion') throw Error('Solo se permite 127.0.0.1:5434/gvr_produccion');
 const client = new Client({ connectionString: url.toString(), ssl: false });
 try {
  await client.connect();
  await client.query('BEGIN');
  const all = fs.readFileSync(path.join(sqlRoot, 'seeds/insert_data.sql'), 'utf8');
  const marker = all.indexOf('NUEVOS CATÁLOGOS — Planificación de proyectos');
  if (marker < 0) throw Error('No se encontró el bloque de catálogos');
  const seed = all.slice(all.indexOf('BEGIN;', marker));
  await client.query(unwrap(seed));
  await client.query(unwrap(fs.readFileSync(path.join(sqlRoot, 'seeds/permisos-granulares-planificacion.sql'), 'utf8')));
  const sources = files(path.join(sqlRoot, 'schema/02-functions')).filter(f => f.endsWith('.sql')).map(file => ({ file, sql: fs.readFileSync(file, 'utf8') })).filter(x => x.sql.startsWith('-- PREPARADO LOCALMENTE 2026-10-21.'));
  if (sources.length !== 51) throw Error('Inventario inesperado de funciones');
  let created = 0, unchanged = 0;
  for (const {file, sql} of sources) {
   const name = sql.match(/CREATE FUNCTION public\."([^"]+)"/)?.[1];
   if (!name) throw Error('Función sin nombre: ' + path.basename(file));
   const existing = await client.query('SELECT prosrc FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname=$1 AND proname=$2', ['public', name]);
   if (existing.rows.length) {
    const signature = sql.match(/REVOKE ALL ON FUNCTION (public\."[^"]+"\([^;]+?\)) FROM PUBLIC/)?.[1];
    const exact = signature ? await client.query('SELECT to_regprocedure($1) IS NOT NULL AS existe', [signature]) : null;
    if (!exact?.rows[0].existe) throw Error('Firma local distinta: ' + name);
    const body = sql.match(/AS \$function\$([\s\S]*?)\$function\$/)?.[1];
    if (existing.rows.length !== 1 || existing.rows[0].prosrc.trim() !== body?.trim()) throw Error('Colisión de función local: ' + name + '; revise firma y cuerpo antes de sustituir');
    unchanged++;
   } else { await client.query(unwrap(sql)); created++; }
  }
  const catalogs = await client.query('SELECT count(*)::int AS opciones FROM genlistadoopciones WHERE idlista BETWEEN 49 AND 52 AND estado=1');
  const permissions = await client.query('SELECT count(*)::int AS permisos FROM authpermisosgranulares WHERE id BETWEEN 203 AND 208 AND estado=1');
  if (catalogs.rows[0].opciones !== 22 || permissions.rows[0].permisos !== 6) throw Error('Verificación de seeds fallida');
  const jobs = await client.query("SELECT to_regclass('cron.job') AS jobs");
  const legacyJobs = jobs.rows[0].jobs ? (await client.query("SELECT jobid FROM cron.job WHERE command LIKE '%pro_SincronizarEstadoEntregablesPorFechaEstimada%' AND command NOT LIKE '%pro_SincronizarEstadoEntregablesPorFechaEstimadaV2%'")).rows.length : 0;
  if (legacyJobs) throw Error('Existe un cron local con el sincronizador anterior; migrar explícitamente antes de activar');
  await client.query('COMMIT');
  console.log(JSON.stringify({ base: '127.0.0.1:5434/gvr_produccion', funcionesCreadas: created, funcionesSinCambios: unchanged, opciones: 22, permisos: 6, cronAnterior: legacyJobs }));
 } catch (e) { await client.query('ROLLBACK').catch(() => {}); throw e; } finally { await client.end(); }
}
main().catch(e => { console.error('Aplicación local cancelada:', e.message); process.exitCode = 1; });
