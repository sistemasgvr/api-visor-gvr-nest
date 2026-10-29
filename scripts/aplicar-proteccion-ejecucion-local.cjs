// Aplica funciones únicamente a la copia local autorizada. No modifica datos.
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const root = path.resolve(__dirname, '..');
async function main() {
  const env = fs.readFileSync(path.join(root, '.env'), 'utf8').match(/^DATABASE_URL\s*=\s*["']?([^\r\n"']+)/m)?.[1];
  const url = new URL(process.env.DATABASE_URL || env);
  if (!['127.0.0.1','localhost'].includes(url.hostname) || url.port !== '5434' || url.pathname !== '/gvr_produccion') throw Error('Solo base local autorizada');
  const c = new Client({connectionString:url.toString(),ssl:false});
  try {
    await c.connect(); await c.query('BEGIN');
    for (const file of ['planificacion/apoyos/pla_ValidarFechasProyectoConEjecucion.sql', 'planificacion/apoyos/pla_ValidarEjecucionPlan.sql', 'planificacion/apoyos/pla_RegistrarCambioPlan.sql', 'proyectos/pro_EditarProyectoV2.sql', 'planificacion/proyectos/pla_PrevisualizarCambioCronograma.sql']) {
      const sql = fs.readFileSync(path.join(root,'../api-visor-gvr-sql/schema/02-functions',file),'utf8');
      await c.query(sql.replace(/^BEGIN;\s*$/mi,'').replace(/^COMMIT;\s*$/mi,'').replace('CREATE FUNCTION public.','CREATE OR REPLACE FUNCTION public.'));
    }
    await c.query('COMMIT'); console.log('Protecciones aplicadas en la copia local. Datos conservados.');
  } catch (e) { await c.query('ROLLBACK').catch(()=>{}); throw e; }
  finally { await c.end(); }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
