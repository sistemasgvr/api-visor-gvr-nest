// Regresión real: fixtures y cambios dentro de una transacción que siempre se revierte.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { Client } = require('pg');
const env = fs.readFileSync('.env', 'utf8').match(/^DATABASE_URL\s*=\s*["']?([^\r\n"']+)/m)?.[1];
const url = new URL(process.env.DATABASE_URL || env);
if (!['127.0.0.1','localhost'].includes(url.hostname) || url.port !== '5434' || url.pathname !== '/gvr_produccion') throw Error('Solo base local autorizada');
const client = new Client({ connectionString: url.toString(), ssl: false });
let checks = 0;
function equal(actual, expected) { assert.deepEqual(actual, expected); checks++; }
async function main() {
  await client.connect(); await client.query('BEGIN');
  try {
    const q = async (sql, params = []) => (await client.query(sql, params)).rows;
    const [plan] = await q('SELECT id,publicadopor FROM plaplanproyecto WHERE idproyecto=38 AND estado=1');
    assert.ok(plan?.publicadopor, 'requiere el plan publicado de la verificación de navegador');
    const summary = async (ids = [38]) => (await q('SELECT public."pla_ListarResumenPlanes"($1,$2) AS r', [plan.publicadopor, ids]))[0].r;
    const [before] = await summary();
    equal(before.idestadoplan, 701);
    equal(before.metricas.minutosplanificados, Number((await q('SELECT sum(minutosestimados) total FROM plaactividad WHERE idplan=$1 AND estado=1', [plan.id]))[0].total));
    equal(before.metricas.minutosregistrados, Number((await q('SELECT coalesce(sum(public."pla_ObtenerConsumoAsignacion"(s.id)),0) total FROM plaasignacion s JOIN plaactividad a ON a.id=s.idactividad WHERE a.idplan=$1 AND a.estado=1', [plan.id]))[0].total));
    equal(before.metricas.aviso, null);
    equal((await summary([38,38])).length, 1);
    equal(await summary([]), []);
    equal(await summary([2147483647]), []);
    await client.query('SAVEPOINT estados');
    await q('UPDATE plaactividad SET idestadoactividad=706 WHERE idplan=$1 AND estado=1', [plan.id]);
    // Una culminada requiere su movimiento real en el motor; las métricas de estado siguen siendo medibles.
    const [completed] = await summary(); equal(completed.metricas.avancereal, 100);
    await client.query('ROLLBACK TO SAVEPOINT estados');
    await q('UPDATE plaactividad SET idestadoactividad=703 WHERE idplan=$1 AND estado=1', [plan.id]);
    equal((await summary())[0].metricas.avancereal, 0);
    await client.query('ROLLBACK TO SAVEPOINT estados');

    const [cal] = await q('INSERT INTO placalendario(nombre,idusuariocreacion) VALUES($1,$2) RETURNING id', ['QA resumen rollback',plan.publicadopor]);
    const [version] = await q('INSERT INTO placalendarioversion(idcalendario,numero,idestado,publicadaen,idusuariocreacion) VALUES($1,1,public."pla_ResolverOpcion"(\'pla_calendario_version_estado\',\'Publicada\'),now(),$2) RETURNING id', [cal.id,plan.publicadopor]);
    await q("INSERT INTO placalendariosemana(idversion,diasemana,laborable,horaentrada,horasalida,minutosrefrigerio) SELECT $1,d,true,'08:00','17:00',60 FROM generate_series(1,7) d", [version.id]);
    await q(`UPDATE plalineabaseasignacion SET idversioncalendario=$2,
      fechainicioaprobada=(now() AT TIME ZONE 'America/Lima')::date-1,
      fechafinaprobada=(now() AT TIME ZONE 'America/Lima')::date
      WHERE idlineabase=(SELECT id FROM plalineabase WHERE idplan=$1 AND estado=1 ORDER BY numero DESC LIMIT 1)`, [plan.id,version.id]);
    equal((await summary())[0].metricas.avanceplan, 50);
    await q(`UPDATE plalineabaseasignacion SET fechainicioaprobada=fechainicioaprobada-2,fechafinaprobada=fechafinaprobada-2
      WHERE idlineabase=(SELECT id FROM plalineabase WHERE idplan=$1 AND estado=1 ORDER BY numero DESC LIMIT 1)`, [plan.id]);
    equal((await summary())[0].metricas.avanceplan, 100);

    await q('UPDATE plaactividad SET idestadoactividad=704 WHERE idplan=$1 AND estado=1', [plan.id]);
    const [assignment] = await q('SELECT s.id,s.idtrabajador,a.identregable FROM plaasignacion s JOIN plaactividad a ON a.id=s.idactividad WHERE a.idplan=$1 AND a.estado=1 AND s.estado=1 ORDER BY a.minutosestimados DESC LIMIT 1', [plan.id]);
    for (const estado of ['Por aprobar','Aprobado','Observado','Rechazado']) {
      await q(`INSERT INTO conactividad(idjornada,idproyecto,idtrabajador,idcoordinador,idtipoactividad,nombreactividad,
        horainicio,horafin,horasdedicadas,idestadoactividad,estado,idasignacion,identregable,idusuariocreacion)
        SELECT c.idjornada,38,$1,p.idaprobador,c.idtipoactividad,'QA resumen rollback',c.horainicio,c.horafin,1.5,
        public."pla_ResolverOpcion"('Estado Actividad',$2),1,$3,$4,p.publicadopor
        FROM conactividad c CROSS JOIN plaplanproyecto p WHERE p.id=$5 ORDER BY c.id LIMIT 1`,
        [assignment.idtrabajador,estado,assignment.id,assignment.identregable,plan.id]);
    }
    const metricas = (await summary())[0].metricas;
    equal(metricas.minutosregistrados, before.metricas.minutosregistrados + 270);
    equal(metricas.avancereal, 11.25);
    await q('UPDATE plaasignacion SET estado=0 WHERE id=$1', [assignment.id]);
    equal((await summary())[0].metricas.minutosregistrados, metricas.minutosregistrados);
    await client.query('SAVEPOINT invalido');
    await assert.rejects(summary([0]), e => e.code === '22023'); checks++;
    await client.query('ROLLBACK TO SAVEPOINT invalido');
    await assert.rejects(q('SELECT public."pla_ListarResumenPlanes"(NULL,ARRAY[38])'), e => e.code === '42501'); checks++;
    console.log(`${checks} comprobaciones PostgreSQL: datos reales, consumo, estados, rechazo, retirada, base proporcional/inmutable, IDs y actor. ROLLBACK.`);
  } finally { await client.query('ROLLBACK'); await client.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
