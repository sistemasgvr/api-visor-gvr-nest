// Solo la copia local autorizada. No modifica datos de proyectos.
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const root = path.resolve(__dirname, '..');
async function main() {
  const env = fs.readFileSync(path.join(root, '.env'), 'utf8').match(/^DATABASE_URL\s*=\s*["']?([^\r\n"']+)/m)?.[1];
  const url = new URL(process.env.DATABASE_URL || env);
  if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.port !== '5434' || url.pathname !== '/gvr_produccion')
    throw new Error('Solo se permite la copia local 127.0.0.1:5434/gvr_produccion');
  const client = new Client({ connectionString: url.toString(), ssl: false });
  try {
    await client.connect();
    await client.query('BEGIN');
    const source = fs.readFileSync(path.join(root, '../api-visor-gvr-sql/schema/02-functions/planificacion/proyectos/pla_ListarResumenPlanes.sql'), 'utf8');
    await client.query(source.replace(/^BEGIN;\s*$/mi, '').replace(/^COMMIT;\s*$/mi, '').replace('CREATE FUNCTION public.', 'CREATE OR REPLACE FUNCTION public.'));
    const { rows } = await client.query('SELECT publicadopor FROM public.plaplanproyecto WHERE idproyecto=38 AND estado=1');
    if (rows[0]?.publicadopor) {
      const result = await client.query('SELECT public."pla_ListarResumenPlanes"($1,$2) AS resumen', [rows[0].publicadopor, [38]]);
      console.log(JSON.stringify(result.rows[0].resumen));
    }
    await client.query('COMMIT');
    console.log('Función de resumen aplicada solo en la copia local autorizada.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {}); throw error;
  } finally { await client.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
