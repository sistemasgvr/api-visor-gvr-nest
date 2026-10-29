// Pruebas de integración con datos reales como referencia. Todo se revierte.
const fs=require('node:fs'); const assert=require('node:assert/strict'); const {Client}=require('pg');
const url=new URL(process.env.DATABASE_URL||fs.readFileSync('.env','utf8').match(/^DATABASE_URL\s*=\s*["']?([^\r\n"']+)/m)[1]);
if(!['127.0.0.1','localhost'].includes(url.hostname)||url.port!=='5434'||url.pathname!=='/gvr_produccion')throw Error('Solo base local autorizada');
const c=new Client({connectionString:url.toString(),ssl:false}); let checks=0;
async function q(sql,p=[]){await c.query('SAVEPOINT test');try{const r=await c.query(sql,p);await c.query('RELEASE SAVEPOINT test');return r.rows;}catch(e){await c.query('ROLLBACK TO SAVEPOINT test');throw e;}}
const one=async(sql,p)=>(await q(sql,p))[0];
async function clone(table,patch){const source=await one(`SELECT to_jsonb(t) data FROM ${table} t ORDER BY id LIMIT 1`);const {id}=await one(`SELECT max(id)+10000 id FROM ${table}`);return one(`INSERT INTO ${table} OVERRIDING SYSTEM VALUE SELECT (jsonb_populate_record(NULL::${table},$1::jsonb)).* RETURNING *`,[JSON.stringify({...source.data,...patch,id})]);}
const check=v=>{assert.ok(v,`Comprobación ${checks+1}`);checks++;};
async function main(){await c.connect();await c.query('BEGIN');try{
 const plan=await one('SELECT * FROM plaplanproyecto WHERE idproyecto=38 AND estado=1');
 const p=await one('SELECT * FROM proproyecto WHERE id=38');
 await q("UPDATE proproyecto SET fechainicio='2026-09-22' WHERE id=38");
 // Aislar este escenario de registros históricos preexistentes; se revierten al final.
 await q('UPDATE conactividad SET estado=0 WHERE idproyecto=38');
 const a=await one('SELECT a.id,a.revision,s.id assignment,s.idtrabajador FROM plaactividad a JOIN plaasignacion s ON s.idactividad=a.id WHERE a.idplan=$1 AND a.estado=1 AND s.estado=1 ORDER BY a.id DESC LIMIT 1',[plan.id]);
 const j=(await one("SELECT * FROM conjornada WHERE idtrabajador=$1 AND fechajornada='2026-09-22'",[a.idtrabajador]))||await clone('conjornada',{idtrabajador:a.idtrabajador,fechajornada:'2026-09-22'});
 const pending=await one(`SELECT public."pla_ResolverOpcion"('Estado Actividad','Por aprobar') id`);
 const rec=await clone('conactividad',{idjornada:j.id,idproyecto:38,idtrabajador:a.idtrabajador,idasignacion:a.assignment,estado:1,horasdedicadas:4,idestadoactividad:pending.id,horainicio:'08:00',horafin:'12:00'});
 const snapshot=()=>one('SELECT to_jsonb(p) proyecto,(SELECT to_jsonb(x) FROM plaplanproyecto x WHERE x.id=$1) plan,(SELECT jsonb_agg(to_jsonb(a) ORDER BY id) FROM plaactividad a WHERE idplan=$1) actividades,(SELECT count(*) FROM plabitacoracambio WHERE idplan=$1) cambios,(SELECT jsonb_agg(to_jsonb(b)) FROM plalineabase b WHERE idplan=$1) bases FROM proproyecto p WHERE id=38',[plan.id]);
 const before=await snapshot();
 const edit=async(inicio,fin=p.fechafinalizacion)=>one('SELECT * FROM public."pro_EditarProyectoV2"(p_idproyecto=>38,p_nombreproyecto=>$1,p_nroproyecto=>$2,p_idtipoproyecto=>$3,p_idpais=>$4,p_fechainicio=>$5::date,p_fechafinalizacion=>$6::date,p_idusuariomodificacion=>$7,p_idcalendario=>$8,p_revisionplan=>$9,p_motivo=>$10)',[p.nombreproyecto,p.nroproyecto,p.idtipoproyecto,p.idpais,inicio,fin,plan.publicadopor,p.idcalendario,plan.revision,'Prueba de protección']);
 let r=await edit('2026-09-25');check(!r.success&&/22\/09\/2026/.test(r.message));assert.deepEqual(await snapshot(),before);checks++;
 r=await edit('2026-09-19','2026-09-21');check(!r.success&&/fin del proyecto/.test(r.message));assert.deepEqual(await snapshot(),before);checks++;
 r=await edit(null);check(!r.success&&/vacío/.test(r.message));
 await assert.rejects(()=>q('SELECT public."pla_ValidarEjecucionPlan"($1,$2::jsonb)',[plan.id,JSON.stringify([{idactividad:a.id,inicio:'2026-09-25',fin:'2026-10-09'}])]),/trabajo registrado/);checks++;
 await q('SELECT public."pla_ValidarEjecucionPlan"($1,$2::jsonb)',[plan.id,JSON.stringify([{idactividad:a.id,inicio:'2026-09-22',fin:'2026-09-22'}])]);checks++;
 await assert.rejects(()=>q('SELECT public."pla_PrevisualizarCambioCronograma"($1,$2,$3::jsonb)',[plan.publicadopor,plan.id,JSON.stringify({idactividad:a.id,fechanoiniciarantes:'2026-09-25'})]),/trabajo registrado/);checks++;
 await assert.rejects(()=>q('SELECT public."pla_ReprogramarActividad"($1,$2,$3,$4,$5::date,NULL,$6)',[plan.publicadopor,a.id,plan.revision,a.revision,'2026-09-25','Prueba de protección']),/trabajo registrado/);checks++;
 assert.deepEqual(await snapshot(),before);checks++;
 // Los registros anteriores a la planificación también protegen los límites del proyecto.
 await q('UPDATE conactividad SET idasignacion=NULL WHERE id=$1',[rec.id]);
 r=await edit('2026-09-25');check(!r.success&&/22\/09\/2026/.test(r.message));
 await q('SELECT public."pla_ValidarEjecucionPlan"($1,$2::jsonb)',[plan.id,'[]']);checks++;
 // Rechazados o eliminados no consumen ni anclan fechas.
 await q(`UPDATE conactividad SET idestadoactividad=public."pla_ResolverOpcion"('Estado Actividad','Rechazado') WHERE id=$1`,[rec.id]);
 await q('SELECT public."pla_ValidarFechasProyectoConEjecucion"(38,$1::date,$2::date)',['2026-09-25','2026-10-09']);checks++;
 await q('UPDATE conactividad SET estado=0,idestadoactividad=$2 WHERE id=$1',[rec.id,pending.id]);
 await q('SELECT public."pla_ValidarFechasProyectoConEjecucion"(38,$1::date,$2::date)',['2026-09-25','2026-10-09']);checks++;
 console.log(JSON.stringify({resultado:'OK',comprobaciones:checks,datosPrueba:'ROLLBACK'}));
 }finally{await c.query('ROLLBACK');await c.end();}}
main().catch(e=>{console.error('Comprobaciones previas:',checks,e.message);process.exitCode=1;});
