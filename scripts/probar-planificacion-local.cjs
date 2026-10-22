/* Regresión contra la BD local real. Usa los repositorios del backend y las FK reales.
 * Todos los datos de prueba se revierten al terminar; las secuencias pueden avanzar.
 * Ejecutar después de aplicar-planificacion-local.cjs, desde este proyecto. */
require('ts-node/register/transpile-only');
const fs=require('node:fs');const assert=require('node:assert/strict');const {Client}=require('pg');
const {DatabaseFunctionService}=require('../src/infrastructure/database/database-function.service');
const {PlanificacionRepository}=require('../src/infrastructure/repositories/planificacion.repository');
const {ProyectoRepository}=require('../src/infrastructure/repositories/proyecto.repository');
const {ControlOperativoRepository}=require('../src/infrastructure/repositories/control-operativo.repository');
const url=new URL(process.env.DATABASE_URL||fs.readFileSync('.env','utf8').match(/^DATABASE_URL\s*=\s*["']?([^\r\n"']+)/m)[1]);
if(!['127.0.0.1','localhost'].includes(url.hostname)||url.port!=='5434'||url.pathname!=='/gvr_produccion')throw Error('Solo base local autorizada');
const c=new Client({connectionString:url.toString(),ssl:false});let checks=0;let etapa='conexión';
async function q(sql,params=[]){await c.query('SAVEPOINT prueba');try{const result=await c.query(sql,params);await c.query('RELEASE SAVEPOINT prueba');return result.rows}catch(e){await c.query('ROLLBACK TO SAVEPOINT prueba');await c.query('RELEASE SAVEPOINT prueba');throw e;}}
const one=async(sql,p=[])=>(await q(sql,p))[0];
const scalar=async(sql,p=[])=>Object.values(await one(sql,p))[0];
const check=(value)=>{assert.ok(value);checks++;};
const fails=async(fn,kind)=>{await assert.rejects(fn,e=>e.kind===kind);checks++;};
async function clone(table,patch){const row=await one(`SELECT to_jsonb(t) AS data FROM public.${table} t ORDER BY id LIMIT 1`);if(!row)throw Error('Sin referencia: '+table);const id=await scalar(`SELECT coalesce(max(id),0)+10000 FROM public.${table}`);return one(`INSERT INTO public.${table} OVERRIDING SYSTEM VALUE SELECT (jsonb_populate_record(NULL::public.${table},$1::jsonb)).* RETURNING *`,[JSON.stringify({...row.data,...patch,id})]);}
async function main(){
 await c.connect();await c.query('BEGIN');await c.query("SET LOCAL timezone='America/Lima'");
 const before=await scalar('SELECT count(*) FROM plaplanproyecto');
 try{
  etapa='fixtures con claves reales';
  const tag='PRD-local-'+Date.now();
  const actor=await clone('authusuarios',{nombre:'Prueba PRD',correo:tag+'@example.invalid',contrasena:'prueba-sin-login',estado:1});
  const other=await clone('authusuarios',{nombre:'Colaborador PRD',correo:tag+'-persona@example.invalid',contrasena:'prueba-sin-login',estado:1});
  const calendar=await one('INSERT INTO placalendario(nombre,idusuariocreacion) VALUES($1,$2) RETURNING id',[tag,actor.id]);
  const version=await one('INSERT INTO placalendarioversion(idcalendario,numero,idestado,publicadaen,idusuariocreacion) VALUES($1,1,616,now(),$2) RETURNING id',[calendar.id,actor.id]);
  await q("INSERT INTO placalendariosemana(idversion,diasemana,laborable,horaentrada,horasalida,minutosrefrigerio) SELECT $1,d,true,'08:00','17:00',60 FROM generate_series(1,7) d",[version.id]);
  const approver=await clone('tratrabajador',{nombres:'Aprobador PRD',idusuario:actor.id,idcalendario:calendar.id,nrodocumento:'PRD'+actor.id,estado:1});
  const worker=await clone('tratrabajador',{nombres:'Colaborador PRD',idusuario:other.id,idcalendario:calendar.id,nrodocumento:'PRD'+other.id,estado:1});
  const database=new DatabaseFunctionService({query:q});const repo=new PlanificacionRepository(database);const projects=new ProyectoRepository(database,{});const control=new ControlOperativoRepository(database,{query:q},{});
  const source=await one('SELECT * FROM proproyecto WHERE estado=1 ORDER BY id LIMIT 1');
  const vigente=await scalar("SELECT id FROM genlistadoopciones WHERE nombre='Vigente' AND estado=1 ORDER BY id LIMIT 1");
  const projectData={nombreProyecto:tag,nroProyecto:tag,idTipoProyecto:source.idtipoproyecto,idPais:source.idpais,fechaInicio:'2026-10-19',fechaFinalizacion:'2027-01-30',idEstadoProyecto:vigente,idCalendario:calendar.id,idUsuarioCreacion:actor.id};
  const created=await projects.crearProyecto(projectData);check(created.success);const id=created.id_proyecto;
  check((await projects.obtenerProyectoPorId(id)).idcalendario===calendar.id);
  await q('INSERT INTO proaccesoproyecto(idproyecto,idusuario,idtrabajador) VALUES($1,$2,$3)',[id,other.id,worker.id]);
  const e=await projects.crearEntregableProyecto(id,{idProyecto:id,nombre:'General PRD',idTrabajadoresResponsables:[worker.id]},actor.id);check(e.success);
  const e2=await projects.crearEntregableProyecto(id,{idProyecto:id,nombre:'Temporal PRD',idTrabajadoresResponsables:[worker.id]},actor.id);check(e2.success);
  etapa='borrador y pertenencia';
  check((await repo.obtenerPlan(actor.id,{id})).plan===null);
  let plan=await repo.crearPlan(actor.id,{id},{idaprobador:approver.id});const ctx={id,idPlan:plan.id};
  const rev=async()=>scalar('SELECT revision FROM plaplanproyecto WHERE id=$1',[plan.id]);
  const arev=async(a)=>scalar('SELECT revision FROM plaactividad WHERE id=$1',[a]);
  check(plan.idestadoplan===700);await repo.comprobarPertenencia(ctx);
  await fails(async()=>repo.comprobarPertenencia({...ctx,id:id+1}),'not_found');
  await repo.actualizarReglas(actor.id,ctx,{revisionPlan:await rev(),reglas:{bloquearexceso:true,toleranciaporcentaje:0,permitirnoplaneadas:false}});
  await fails(async()=>repo.actualizarReglas(actor.id,ctx,{revisionPlan:1,reglas:{}}),'conflict');
  const a=await repo.crearActividad(actor.id,ctx,{revisionPlan:await rev(),datos:{identregable:e.id,nombre:'Diseño',minutosestimados:1200,asignaciones:[{idtrabajador:worker.id,minutosasignados:1200}]}});
  const b=await repo.crearActividad(actor.id,ctx,{revisionPlan:await rev(),datos:{identregable:e.id,nombre:'Revisión',minutosestimados:60,asignaciones:[{idtrabajador:worker.id,minutosasignados:60}]}});
  const ac={...ctx,idActividad:a.id};const bc={...ctx,idActividad:b.id};
  await repo.editarActividad(actor.id,ac,{revisionPlan:await rev(),revision:await arev(a.id),datos:{descripcion:'Edición local'}});
  const temp=await repo.crearActividad(actor.id,ctx,{revisionPlan:await rev(),datos:{identregable:e.id,nombre:'Temporal',eshito:true,minutosestimados:0}});
  check(await repo.eliminarActividad(actor.id,{...ctx,idActividad:temp.id},{revisionPlan:await rev(),revision:temp.revision}));
  await repo.guardarAsignaciones(actor.id,ac,{revisionPlan:await rev(),revisionActividad:await arev(a.id),asignaciones:[{idtrabajador:worker.id,minutosasignados:1200}]});
  await repo.guardarDependencias(actor.id,bc,{revisionPlan:await rev(),dependencias:[{idpredecesora:a.id,desfasedias:0}]});
  await fails(async()=>repo.guardarDependencias(actor.id,ac,{revisionPlan:await rev(),dependencias:[{idpredecesora:b.id,desfasedias:0}]}),'unprocessable');
  check(await repo.reordenar(actor.id,ctx,{revisionPlan:await rev(),entregables:[e.id,e2.id],actividades:[a.id,b.id]}));
  const cr=await repo.obtenerCronograma(actor.id,ctx);check(cr.actividades.length===2&&cr.fechas.length===2);
  const pre=await repo.previsualizar(actor.id,ctx,{cambios:{idactividad:a.id,fechanoiniciarantes:'2026-11-02'}});check(pre.afectadas.length===2);
  const detail=await repo.obtenerActividad(actor.id,ac);const assignment=detail.asignaciones[0];
  await repo.obtenerTrabajador(other.id);check((await repo.obtenerAsignacionPropia(other.id,assignment.id)).idtrabajador===worker.id);
  etapa='publicación y edición integrada';
  await repo.publicar(actor.id,ctx,{revisionPlan:await rev(),motivo:'Aprobación local'});
  check(await scalar('SELECT count(*)::int FROM plalineabase WHERE idplan=$1',[plan.id])===1);
  await projects.editarProyecto({...projectData,idProyecto:id,idUsuarioModificacion:actor.id,revisionPlan:await rev(),motivo:'Mantener fechas'});
  check((await projects.actualizarEntregableProyecto(e2.id,{nombre:'Temporal editado',revisionPlan:await rev(),motivo:'Renombrar',orden:1},actor.id)).success);
  check((await projects.eliminarEntregableProyecto(e2.id,actor.id,await rev(),'Retirar temporal')).success);
  const blockedDelete=await projects.eliminarProyecto(id,actor.id);check(blockedDelete.success===false && blockedDelete.message.includes('planificación activa'));
  check(await scalar('SELECT estado FROM proproyecto WHERE id=$1',[id])===1);
  const baseline=await scalar('SELECT jsonb_agg(to_jsonb(b)) FROM plalineabaseactividad b WHERE idlineabase IN(SELECT id FROM plalineabase WHERE idplan=$1)',[plan.id]);
  await repo.reprogramar(actor.id,ac,{revisionPlan:await rev(),revision:await arev(a.id),fechaNoIniciarAntes:'2026-11-02',fechaNoFinalizarAntes:null,motivo:'Demora justificada'});
  assert.deepEqual(await scalar('SELECT jsonb_agg(to_jsonb(b)) FROM plalineabaseactividad b WHERE idlineabase IN(SELECT id FROM plalineabase WHERE idplan=$1)',[plan.id]),baseline);checks++;
  await repo.lineaBase(actor.id,ctx,{revisionPlan:await rev(),nombre:'Segunda aprobación',motivo:'Nueva referencia'});
  const baselines=await repo.historial(actor.id,ctx,{tipo:'lineasbase'});check(baselines.length===2);
  check((await repo.historial(actor.id,ctx,{tipo:'detallelineabase',idLineaBase:baselines[0].id})).actividades.length===2);
  const hist=await repo.historial(actor.id,ctx,{tipo:'cambios'});check(hist.length>0);
  etapa='registro real, consumo y ampliación';
  const oldJ=await one('SELECT idconfiguracionjornada FROM conjornada ORDER BY id LIMIT 1');
  const open=await scalar("SELECT id FROM genlistadoopciones WHERE idlista=15 AND nombre='Abierta' AND estado=1");
  const j=await one("INSERT INTO conjornada(idtrabajador,idconfiguracionjornada,fechajornada,idestadojornada,habilitaciondesde,habilitacionhasta) VALUES($1,$2,'2026-10-19',$3,now()-interval '1 hour',now()+interval '1 hour') RETURNING id",[worker.id,oldJ.idconfiguracionjornada,open]);
  const type=await scalar('SELECT idtipoactividad FROM conactividad WHERE idtipoactividad IS NOT NULL LIMIT 1');
  const registro={idJornada:j.id,idProyecto:id,idTrabajador:worker.id,idCoordinador:approver.id,idTipoActividad:type,nombreActividad:'Trabajo PRD',horaInicio:'08:00',horaFin:'13:00',idUsuarioCreacion:other.id,idAsignacion:assignment.id,entregableCulminado:true};
  const record=await control.crearActividad(registro);check(record.idasignacion===assignment.id&&record.identregable===e.id&&!record.entregableculminado);
  check((await repo.obtenerActividad(actor.id,ac)).asignaciones[0].saldo.minutossaldo===900);
  const update={...registro,idActividad:record.id,idUsuarioModificacion:other.id};await control.actualizarActividad(update);
  check((await control.obtenerActividad(record.id)).idasignacion===assignment.id);
  check((await control.listarActividades({idJornada:j.id})).data[0].idasignacion===assignment.id);
  await fails(async()=>control.crearActividad({...registro,horaInicio:'05:00',horaFin:'23:59'}),'unprocessable');
  check((await repo.misAsignaciones(other.id,worker.id,{fecha:'2026-10-22',idProyecto:id})).length===2);
  const request=await repo.solicitarAmpliacion(other.id,assignment.id,{minutos:120,motivo:'Trabajo adicional'});
  await fails(async()=>repo.solicitarAmpliacion(other.id,assignment.id,{minutos:60,motivo:'Duplicada'}),'unprocessable');
  check((await repo.ampliaciones(actor.id,ctx,{})).length===1);
  check((await repo.misAmpliaciones(other.id,{idPlan:plan.id})).length===1);
  await fails(async()=>repo.resolverAmpliacion(other.id,{...ctx,idAmpliacion:request.id},{minutosAprobados:60,resolucion:'Ajena'}),'unprocessable');
  await repo.resolverAmpliacion(actor.id,{...ctx,idAmpliacion:request.id},{minutosAprobados:60,resolucion:'Parcial'});
  check(await scalar('SELECT minutosasignados FROM plaasignacion WHERE id=$1',[assignment.id])===1260);
  await fails(async()=>repo.resolverAmpliacion(actor.id,{...ctx,idAmpliacion:request.id},{minutosAprobados:60,resolucion:'Repetida'}),'unprocessable');
  // Validación respeta el alcance calculado por el backend; aquí se concede explícitamente todos.
  await control.validarActividad({idActividad:record.id,idEstadoActividad:375,idCoordinadorRevisor:approver.id,idUsuarioModificacion:actor.id,esAdminTotalValidacion:true});
  etapa='estados, cierre y reapertura';
  await fails(async()=>repo.estadoPlan(actor.id,ctx,{revisionPlan:await rev(),idEstadoDestino:702,motivo:'Prematuro'}),'unprocessable');
  for(const activity of [a,b]){
   const d=await repo.obtenerActividad(actor.id,{...ctx,idActividad:activity.id});const s=d.asignaciones[0];
   await repo.estadoActividad(actor.id,{...ctx,idActividad:activity.id},{revisionPlan:await rev(),revision:await arev(activity.id),idEstadoDestino:704,motivo:'Inicio'});
   await repo.estadoParte(other.id,s.id,{revision:s.revision,idEstadoDestino:704,motivo:'Inicio propio'});
   const sr=await scalar('SELECT revision FROM plaasignacion WHERE id=$1',[s.id]);
   await repo.estadoParte(other.id,s.id,{revision:sr,idEstadoDestino:706,motivo:'Parte terminada'});
   await repo.estadoActividad(actor.id,{...ctx,idActividad:activity.id},{revisionPlan:await rev(),revision:await arev(activity.id),idEstadoDestino:706,motivo:'Conformidad'});
  }
  await repo.estadoPlan(actor.id,ctx,{revisionPlan:await rev(),idEstadoDestino:702,motivo:'Cierre'});
  await fails(async()=>control.actualizarActividad(update),'unprocessable');
  await repo.estadoPlan(actor.id,ctx,{revisionPlan:await rev(),idEstadoDestino:701,motivo:'Reapertura'});
  // Un registro adicional por aprobar permite comprobar el actor de la baja V3.
  await repo.estadoActividad(actor.id,ac,{revisionPlan:await rev(),revision:await arev(a.id),idEstadoDestino:704,motivo:'Reabrir actividad'});
  const sr=await scalar('SELECT revision FROM plaasignacion WHERE id=$1',[assignment.id]);await repo.estadoParte(other.id,assignment.id,{revision:sr,idEstadoDestino:704,motivo:'Reabrir parte'});
  const extra=await control.crearActividad({...registro,horaInicio:'14:00',horaFin:'14:30'});check(await control.eliminarActividad(extra.id,other.id));
  check((await repo.historial(actor.id,ctx,{tipo:'movimientos'})).length>0);
  etapa='proyecto sin plan';
  const unplanned=await projects.crearProyecto({...projectData,nombreProyecto:tag+'-sin-plan',nroProyecto:tag+'-sin-plan'});check(unplanned.success);const legacyRecord=await control.crearActividad({...registro,idProyecto:unplanned.id_proyecto,idAsignacion:null,idEntregable:null,horaInicio:'18:00',horaFin:'18:30'});check(legacyRecord.idasignacion===null);check(await control.eliminarActividad(legacyRecord.id,other.id));check((await projects.eliminarProyecto(unplanned.id_proyecto,actor.id)).success);

 } finally {await c.query('ROLLBACK');check(await scalarNoTx('SELECT count(*) FROM plaplanproyecto')===before);await c.end();}
  console.log(JSON.stringify({comprobaciones:checks,endpointsPlanificacion:24,integracion:'repositorios reales + funciones + restricciones PostgreSQL',resultado:'OK',datosPrueba:'ROLLBACK'}));
}
async function scalarNoTx(sql){return Object.values((await c.query(sql)).rows[0])[0];}
main().catch(e=>{console.error('Prueba local fallida en '+etapa+':',e.kind||e.code||e.name,e.message);process.exitCode=1;});


