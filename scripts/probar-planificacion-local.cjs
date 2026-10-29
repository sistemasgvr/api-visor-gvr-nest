/* Regresión contra la BD local real. Usa los repositorios del backend y las FK reales.
 * Todos los datos de prueba se revierten al terminar; las secuencias pueden avanzar.
 * Ejecutar después de aplicar-planificacion-local.cjs, desde este proyecto. */
require('ts-node/register/transpile-only');
const fs=require('node:fs');const assert=require('node:assert/strict');const {Client}=require('pg');
const {DatabaseFunctionService}=require('../src/infrastructure/database/database-function.service');
const {PlanificacionRepository}=require('../src/infrastructure/repositories/planificacion.repository');
const {ListarCalendariosPublicadosUseCase}=require('../src/application/use-cases/trabajador/listar-calendarios-publicados.use-case');
const {TrabajadorRepository}=require('../src/infrastructure/repositories/trabajador.repository');
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
  etapa='O3 catálogo de calendarios publicados';
  const calendariosPublicados=new ListarCalendariosPublicadosUseCase(new TrabajadorRepository(database,{}));
  const catalogo=await calendariosPublicados.execute();
  check(catalogo.some(c=>c.id===calendar.id && c.nombre===tag && c.numeroversion===1));
  await q('INSERT INTO placalendarioversion(idcalendario,numero,idestado,publicadaen) VALUES($1,2,616,now())',[calendar.id]);
  const versiones=await calendariosPublicados.execute();
  check(versiones.filter(c=>c.id===calendar.id).length===1 && versiones.find(c=>c.id===calendar.id).numeroversion===2);
  const borrador=await one('INSERT INTO placalendario(nombre) VALUES($1) RETURNING id',[tag+'-borrador']);
  await q('INSERT INTO placalendarioversion(idcalendario,numero,idestado) VALUES($1,1,615)',[borrador.id]);
  check(!(await calendariosPublicados.execute()).some(c=>c.id===borrador.id));
  await q('UPDATE placalendario SET estado=0 WHERE id=$1',[calendar.id]);
  check(!(await calendariosPublicados.execute()).some(c=>c.id===calendar.id));
  await q('UPDATE placalendario SET estado=1 WHERE id=$1',[calendar.id]);
  await q('UPDATE placalendarioversion SET estado=0 WHERE idcalendario=$1 AND numero=2',[calendar.id]);
  check((await calendariosPublicados.execute()).find(c=>c.id===calendar.id).numeroversion===1);
  etapa='calendario puntual del colaborador';
  await c.query('SAVEPOINT asignar_calendario');
  try {
    const trabajadores=new TrabajadorRepository(database,{});
    await q('UPDATE tratrabajador SET idcalendario=NULL WHERE id=$1',[worker.id]);
    const antes=await scalar("SELECT to_jsonb(t)-'idcalendario'-'idusuariomodificacion'-'fechamodificacion' FROM tratrabajador t WHERE id=$1",[worker.id]);
    const asignado=await trabajadores.asignarCalendario(actor.id,worker.id,calendar.id,null);
    check(asignado.id===worker.id && asignado.idcalendario===calendar.id);
    assert.deepEqual(await scalar("SELECT to_jsonb(t)-'idcalendario'-'idusuariomodificacion'-'fechamodificacion' FROM tratrabajador t WHERE id=$1",[worker.id]),antes); checks++;
    await fails(()=>trabajadores.asignarCalendario(actor.id,worker.id,borrador.id,null),'conflict');
    check(await scalar('SELECT idcalendario FROM tratrabajador WHERE id=$1',[worker.id])===calendar.id);
    await fails(()=>trabajadores.asignarCalendario(actor.id,worker.id,borrador.id,calendar.id),'unprocessable');
    await q('UPDATE placalendario SET estado=0 WHERE id=$1',[calendar.id]);
    await fails(()=>trabajadores.asignarCalendario(actor.id,worker.id,calendar.id,calendar.id),'unprocessable');
    await q('UPDATE tratrabajador SET estado=0 WHERE id=$1',[worker.id]);
    await fails(()=>trabajadores.asignarCalendario(actor.id,worker.id,calendar.id,calendar.id),'not_found');
    await fails(()=>trabajadores.asignarCalendario(2147483647,approver.id,calendar.id,calendar.id),'forbidden');
  } finally {await c.query('ROLLBACK TO SAVEPOINT asignar_calendario');await c.query('RELEASE SAVEPOINT asignar_calendario');}
  const source=await one('SELECT * FROM proproyecto WHERE estado=1 ORDER BY id LIMIT 1');
  const vigente=await scalar("SELECT id FROM genlistadoopciones WHERE nombre='Vigente' AND estado=1 ORDER BY id LIMIT 1");
  const projectData={nombreProyecto:tag,nroProyecto:tag,idTipoProyecto:source.idtipoproyecto,idPais:source.idpais,fechaInicio:'2026-10-19',fechaFinalizacion:'2027-01-30',idEstadoProyecto:vigente,idCalendario:calendar.id,idUsuarioCreacion:actor.id};
  const created=await projects.crearProyecto(projectData);check(created.success);const id=created.id_proyecto;
  check((await projects.obtenerProyectoPorId(id)).idcalendario===calendar.id);
  await q('INSERT INTO proaccesoproyecto(idproyecto,idusuario,idtrabajador) VALUES($1,$2,$3)',[id,other.id,worker.id]);
  etapa='O1 y O2 lecturas frontend';
  await q('INSERT INTO proproyectocoordinador(idproyecto,idtrabajador) VALUES($1,$2)',[id,approver.id]);
  check((await repo.listarEstadosPlanes(actor.id,[id])).length===0);
  const equipo=await repo.listarEquipoPlan(actor.id,id);
  check(equipo.length===2 && equipo.some(p=>p.idtrabajador===approver.id) && equipo.some(p=>p.idtrabajador===worker.id));
  check(equipo.every(p=>p.tienecalendariopublicado===true && p.idcalendario===calendar.id));
  await q('INSERT INTO proaccesoproyecto(idproyecto,idusuario,idtrabajador) VALUES($1,$2,$3)',[id,actor.id,approver.id]);
  check((await repo.listarEquipoPlan(actor.id,id)).length===2);
  await q('UPDATE tratrabajador SET idcalendario=NULL WHERE id=$1',[worker.id]);
  const sinCalendario=(await repo.listarEquipoPlan(actor.id,id)).find(p=>p.idtrabajador===worker.id);
  check(sinCalendario.idcalendario===null && !sinCalendario.tienecalendariopublicado);
  await q('UPDATE tratrabajador SET idcalendario=$1 WHERE id=$2',[calendar.id,worker.id]);
  await q('UPDATE proaccesoproyecto SET estado=0 WHERE idproyecto=$1 AND idtrabajador=$2',[id,worker.id]);
  check((await repo.listarEquipoPlan(actor.id,id)).length===1);
  await q('UPDATE proaccesoproyecto SET estado=1 WHERE idproyecto=$1 AND idtrabajador=$2',[id,worker.id]);
  const e=await projects.crearEntregableProyecto(id,{idProyecto:id,nombre:'General PRD',color:'#12AB34',idTrabajadoresResponsables:[worker.id]},actor.id);check(e.success);
  const e2=await projects.crearEntregableProyecto(id,{idProyecto:id,nombre:'Temporal PRD',idTrabajadoresResponsables:[worker.id]},actor.id);check(e2.success);
  check(await scalar('SELECT color FROM proentregable WHERE id=$1',[e.id])==='#12ab34');
  check(await scalar('SELECT color FROM proentregable WHERE id=$1',[e2.id])===null);
  await fails(()=>projects.crearEntregableProyecto(id,{idProyecto:id,nombre:'Color inválido',color:'red',idTrabajadoresResponsables:[worker.id]},actor.id),'invalid_input');
  etapa='borrador y pertenencia';
  check((await repo.obtenerPlan(actor.id,{id})).plan===null);
  let plan=await repo.crearPlan(actor.id,{id},{idaprobador:approver.id});const ctx={id,idPlan:plan.id};
  etapa='O4 calendario operativo';
  await c.query('SAVEPOINT calendario_o4');
  try {
    const operativo=await repo.obtenerCalendarioPlan(actor.id,ctx,{desde:'2026-10-19',hasta:'2026-10-25'});
    check(operativo.idcalendario===calendar.id && operativo.idversion===version.id && operativo.nombre===tag);
    check(operativo.dias.length===7 && operativo.dias[0].fecha==='2026-10-19' && operativo.dias.every(d=>d.minutos===480 && d.nombre===null));
    const tipo=await scalar('SELECT id FROM genlistadoopciones WHERE idlista=48 AND estado=1 ORDER BY id LIMIT 1');
    await q("INSERT INTO plaexcepcioncalendario(idversion,fecha,nombre,idtipo,minutosefectivos) VALUES($1,'2026-10-19','Feriado O4',$2,0),($1,'2026-10-20','Jornada reducida O4',$2,180)",[version.id,tipo]);
    const excepciones=await repo.obtenerCalendarioPlan(actor.id,ctx,{desde:'2026-10-19',hasta:'2026-10-20'});
    check(excepciones.dias[0].minutos===0 && excepciones.dias[0].nombre==='Feriado O4');
    check(excepciones.dias[1].minutos===180 && excepciones.dias[1].nombre==='Jornada reducida O4');
    check((await repo.obtenerCalendarioPlan(actor.id,ctx,{desde:'2026-01-01',hasta:'2027-01-01'})).dias.length===366);
    await fails(()=>repo.obtenerCalendarioPlan(actor.id,ctx,{desde:'2026-01-01',hasta:'2027-01-02'}),'invalid_input');
    await fails(()=>repo.obtenerCalendarioPlan(actor.id,ctx,{desde:'2026-10-20',hasta:'2026-10-19'}),'invalid_input');
    await q('UPDATE proproyecto SET idcalendario=NULL WHERE id=$1',[id]);
    await fails(()=>repo.obtenerCalendarioPlan(actor.id,ctx,{desde:'2026-10-19',hasta:'2026-10-19'}),'unprocessable');
  } finally {await c.query('ROLLBACK TO SAVEPOINT calendario_o4');await c.query('RELEASE SAVEPOINT calendario_o4');}
  const rev=async()=>scalar('SELECT revision FROM plaplanproyecto WHERE id=$1',[plan.id]);
  etapa='fechas de proyecto desde cronograma';
  await c.query('SAVEPOINT fechas_cronograma');
  try {
    const cambio=await projects.editarProyecto({...projectData,idProyecto:id,idUsuarioModificacion:actor.id,
      fechaInicio:'2026-10-17',fechaFinalizacion:'2027-02-02',revisionPlan:await rev()});
    assert.ok(cambio.success,cambio.message); checks++;
    const movido=await projects.obtenerProyectoPorId(id);
    const fecha=(value)=>value instanceof Date ? value.toISOString().slice(0,10) : String(value).slice(0,10);
    assert.equal(fecha(movido.fechainicio),'2026-10-17'); checks++;
    assert.equal(fecha(movido.fechafinalizacion),'2027-02-02'); checks++;
    check(movido.idcalendario===calendar.id && movido.nombreproyecto===tag);
  } finally {await c.query('ROLLBACK TO SAVEPOINT fechas_cronograma');await c.query('RELEASE SAVEPOINT fechas_cronograma');}
  await c.query('SAVEPOINT color_borrador');
  try {
   const revision=await rev();
   const nuevo=await projects.crearEntregableProyecto(id,{idProyecto:id,nombre:'Nuevo con color',color:'#465fff',revisionPlan:revision,idTrabajadoresResponsables:[worker.id]},actor.id);
   check(nuevo.success && await rev()===revision+1);
   const cr=await repo.obtenerCronograma(actor.id,ctx);
   check(cr.entregables.some(e=>e.id===nuevo.id&&e.color==='#465fff'));
   await fails(()=>projects.crearEntregableProyecto(id,{idProyecto:id,nombre:'Revisión obsoleta',color:'#465fff',revisionPlan:revision,idTrabajadoresResponsables:[worker.id]},actor.id),'conflict');
   check(await scalar('SELECT count(*)::int FROM proentregable WHERE idproyecto=$1 AND nombre=$2',[id,'Revisión obsoleta'])===0);
   const sinResponsable=await projects.crearEntregableProyecto(id,{idProyecto:id,nombre:'Grupo sin responsable',color:'#7a5af8',revisionPlan:await rev()},actor.id);
   check(sinResponsable.success);
   check(await scalar('SELECT count(*)::int FROM proentregableresponsable WHERE identregable=$1 AND estado=1',[sinResponsable.id])===0);
  } finally {await c.query('ROLLBACK TO SAVEPOINT color_borrador');await c.query('RELEASE SAVEPOINT color_borrador');}
  const arev=async(a)=>scalar('SELECT revision FROM plaactividad WHERE id=$1',[a]);
  const estadosBorrador=await repo.listarEstadosPlanes(actor.id,[id,id]);
  check(estadosBorrador.length===1 && estadosBorrador[0].idplan===plan.id && estadosBorrador[0].publicadoen===null);
  check(plan.idestadoplan===700);await repo.comprobarPertenencia(ctx);
  await fails(async()=>repo.comprobarPertenencia({...ctx,id:id+1}),'not_found');
  await repo.actualizarReglas(actor.id,ctx,{revisionPlan:await rev(),reglas:{bloquearexceso:true,toleranciaporcentaje:0,permitirnoplaneadas:false}});
  await fails(async()=>repo.actualizarReglas(actor.id,ctx,{revisionPlan:1,reglas:{}}),'conflict');
  const a=await repo.crearActividad(actor.id,ctx,{revisionPlan:await rev(),datos:{identregable:e.id,nombre:'Diseño',minutosestimados:1200,asignaciones:[{idtrabajador:worker.id,minutosasignados:1200}]}});
  const b=await repo.crearActividad(actor.id,ctx,{revisionPlan:await rev(),datos:{identregable:e.id,nombre:'Revisión',minutosestimados:60,asignaciones:[{idtrabajador:worker.id,minutosasignados:60}]}});
  etapa='edición completa desde el panel';
  await c.query('SAVEPOINT edicion_panel');
  try {
    const actualizado=await projects.actualizarEntregableProyecto(e.id,{
      nombre:'Entregable editado',descripcion:'Descripción nueva',color:'#ABCDEF',
      fechaEstimada:'2026-11-01',fechaEntrega:'2026-11-03',orden:5,
      revisionPlan:await rev(),idTrabajadoresResponsables:[approver.id],
    },actor.id);
    check(actualizado.success);
    const grupo=await one('SELECT nombre,descripcion,color,orden,fechaestimada::date::text AS fecha FROM proentregable WHERE id=$1',[e.id]);
    check(grupo.nombre==='Entregable editado' && grupo.descripcion==='Descripción nueva' && grupo.color==='#abcdef' && grupo.orden===5 && grupo.fecha==='2026-11-01');
    const revision=await rev(), revisionActividad=await arev(b.id);
    await repo.editarActividad(actor.id,{...ctx,idActividad:b.id},{revisionPlan:revision,revision:revisionActividad,datos:{
      nombre:'Revisión reasignada',minutosestimados:120,fechanoiniciarantes:'2026-10-25',
      asignaciones:[{idtrabajador:approver.id,minutosasignados:120}],
      dependencias:[{idpredecesora:a.id,desfasedias:2}],
    }});
    const detalle=await repo.obtenerActividad(actor.id,{...ctx,idActividad:b.id});
    check(detalle.actividad.nombre==='Revisión reasignada' && detalle.actividad.minutosestimados===120);
    check(detalle.asignaciones.filter(x=>x.estado===1).length===1 && detalle.asignaciones.find(x=>x.estado===1).idtrabajador===approver.id);
    check(detalle.dependencias.some(x=>x.idpredecesora===a.id && x.idsucesora===b.id && x.desfasedias===2));
    await fails(()=>repo.editarActividad(actor.id,{...ctx,idActividad:b.id},{revisionPlan:revision,revision:revisionActividad,datos:{nombre:'Obsoleta'}}),'conflict');
    const antes=await rev();
    await fails(async()=>repo.editarActividad(actor.id,{...ctx,idActividad:a.id},{revisionPlan:await rev(),revision:await arev(a.id),datos:{
      nombre:'No debe guardarse',asignaciones:[{idtrabajador:approver.id,minutosasignados:1200}],
      dependencias:[{idpredecesora:b.id,desfasedias:0}],
    }}),'unprocessable');
    check(await rev()===antes);
    const intacta=await repo.obtenerActividad(actor.id,{...ctx,idActividad:a.id});
    check(intacta.actividad.nombre==='Diseño' && intacta.asignaciones.filter(x=>x.estado===1).every(x=>x.idtrabajador===worker.id));
  } finally {await c.query('ROLLBACK TO SAVEPOINT edicion_panel');await c.query('RELEASE SAVEPOINT edicion_panel');}
  etapa='alta virtual y guardado atómico al minuto';
  await c.query('SAVEPOINT alta_actividad');
  try {
    const datos={identregable:e.id,nombre:'Precisión 61 minutos',orden:2,minutosestimados:61,
      asignaciones:[{idtrabajador:worker.id,minutosasignados:31},{idtrabajador:approver.id,minutosasignados:30}],
      dependencias:[{idpredecesora:a.id,desfasedias:0}]};
    const revision=await rev(), cuenta=await scalar('SELECT count(*)::int FROM plaactividad WHERE idplan=$1',[plan.id]);
    const simulacion=await repo.previsualizar(actor.id,ctx,{cambios:{nuevaActividad:datos}});
    check(await rev()===revision && await scalar('SELECT count(*)::int FROM plaactividad WHERE idplan=$1',[plan.id])===cuenta);
    const virtual=simulacion.despues.find(f=>f.idactividad===-1);
    check(virtual && virtual.asignaciones.reduce((sum,s)=>sum+s.minutos,0)===61);
    const diezHoras=await repo.previsualizar(actor.id,ctx,{cambios:{nuevaActividad:{identregable:e.id,nombre:'Diez horas',minutosestimados:600,asignaciones:[],dependencias:[]}}});
    const diez=diezHoras.despues.find(f=>f.idactividad===-1);
    assert.deepEqual(diez.duracionlaboral,{dias:1,minutos:120}); checks++;
    assert.deepEqual(diez.distribucion.map(d=>d.minutos),[480,120]); checks++;
    const ochoHoras=await repo.previsualizar(actor.id,ctx,{cambios:{nuevaActividad:{identregable:e.id,nombre:'Ocho horas',minutosestimados:480,asignaciones:[],dependencias:[]}}});
    const ocho=ochoHoras.despues.find(f=>f.idactividad===-1);
    check(ocho.inicio===ocho.fin); assert.deepEqual(ocho.duracionlaboral,{dias:1,minutos:0}); checks++;
    await c.query('SAVEPOINT duracion_excepciones');
    try {
      const tipoDuracion=await scalar('SELECT id FROM genlistadoopciones WHERE idlista=48 AND estado=1 ORDER BY id LIMIT 1');
      await q("INSERT INTO plaexcepcioncalendario(idversion,fecha,nombre,idtipo,minutosefectivos) VALUES($1,'2026-10-19','Jornada de tres horas',$2,180)",[version.id,tipoDuracion]);
      const reducida=await repo.previsualizar(actor.id,ctx,{cambios:{nuevaActividad:{identregable:e.id,nombre:'Jornada reducida',minutosestimados:600,asignaciones:[]}}});
      assert.deepEqual(reducida.despues.find(f=>f.idactividad===-1).duracionlaboral,{dias:1,minutos:420}); checks++;
      await q("UPDATE plaexcepcioncalendario SET minutosefectivos=0 WHERE idversion=$1 AND fecha='2026-10-19'",[version.id]);
      const feriado=await repo.previsualizar(actor.id,ctx,{cambios:{nuevaActividad:{identregable:e.id,nombre:'Feriado',minutosestimados:600,asignaciones:[]}}});
      const trasFeriado=feriado.despues.find(f=>f.idactividad===-1);
      check(trasFeriado.inicio==='2026-10-20'); assert.deepEqual(trasFeriado.duracionlaboral,{dias:1,minutos:120}); checks++;
    } finally {await c.query('ROLLBACK TO SAVEPOINT duracion_excepciones');await c.query('RELEASE SAVEPOINT duracion_excepciones');}
    const porRecursos=await repo.previsualizar(actor.id,ctx,{cambios:{nuevaActividad:{identregable:e.id,nombre:'Dos recursos',minutosestimados:600,asignaciones:[{idtrabajador:worker.id,minutosasignados:300},{idtrabajador:approver.id,minutosasignados:300}]}}});
    assert.deepEqual(porRecursos.despues.find(f=>f.idactividad===-1).duracionlaboral,{dias:0,minutos:300}); checks++;
    const creada=await repo.crearActividad(actor.id,ctx,{revisionPlan:revision,datos});
    check(creada.minutosestimados===61);
    const guardada=(await repo.obtenerCronograma(actor.id,ctx)).fechas.find(f=>f.idactividad===creada.id);
    check(guardada.inicio===virtual.inicio && guardada.fin===virtual.fin);
    check(guardada.asignaciones.map(s=>s.minutos).sort().join(',')==='30,31');
    check(await scalar('SELECT count(*)::int FROM pladependenciaactividad WHERE idsucesora=$1 AND estado=1',[creada.id])===1);
    const revAntes=await rev();
    await fails(()=>repo.crearActividad(actor.id,ctx,{revisionPlan:revAntes,datos:{...datos,nombre:'No debe quedar guardada',dependencias:[{idpredecesora:2147483647,desfasedias:0}]}}),'invalid_input');
    check(await rev()===revAntes && await scalar('SELECT count(*)::int FROM plaactividad WHERE idplan=$1',[plan.id])===cuenta+1);
    await fails(()=>repo.crearActividad(actor.id,ctx,{revisionPlan:revision,datos}),'conflict');
    const hito=await repo.previsualizar(actor.id,ctx,{cambios:{nuevaActividad:{identregable:e.id,nombre:'Hito virtual',eshito:true,minutosestimados:0,asignaciones:[],dependencias:[{idpredecesora:a.id,desfasedias:0}]}}});
    check(hito.despues.some(f=>f.idactividad===-1 && f.inicio===f.fin && !f.asignaciones.length));
  } finally {await c.query('ROLLBACK TO SAVEPOINT alta_actividad');await c.query('RELEASE SAVEPOINT alta_actividad');}
  const ac={...ctx,idActividad:a.id};const bc={...ctx,idActividad:b.id};
  await repo.editarActividad(actor.id,ac,{revisionPlan:await rev(),revision:await arev(a.id),datos:{descripcion:'Edición local'}});
  const temp=await repo.crearActividad(actor.id,ctx,{revisionPlan:await rev(),datos:{identregable:e.id,nombre:'Temporal',eshito:true,minutosestimados:0}});
  check(await repo.eliminarActividad(actor.id,{...ctx,idActividad:temp.id},{revisionPlan:await rev(),revision:temp.revision}));
  await repo.guardarAsignaciones(actor.id,ac,{revisionPlan:await rev(),revisionActividad:await arev(a.id),asignaciones:[{idtrabajador:worker.id,minutosasignados:1200}]});
  await repo.guardarDependencias(actor.id,bc,{revisionPlan:await rev(),dependencias:[{idpredecesora:a.id,desfasedias:0}]});
  await fails(async()=>repo.guardarDependencias(actor.id,ac,{revisionPlan:await rev(),dependencias:[{idpredecesora:b.id,desfasedias:0}]}),'unprocessable');
  check(await repo.reordenar(actor.id,ctx,{revisionPlan:await rev(),entregables:[e.id,e2.id],actividades:[a.id,b.id]}));
  etapa='orden y traslado atómico';
  await c.query('SAVEPOINT orden_cronograma');
  try {
   const base={entregables:[e2.id,e.id],actividades:[b.id,a.id]};
   const unchanged=await scalar("SELECT jsonb_build_object('asignaciones',(SELECT jsonb_agg(to_jsonb(s)) FROM plaasignacion s WHERE s.idactividad IN($1,$2)),'dependencias',(SELECT jsonb_agg(to_jsonb(d)) FROM pladependenciaactividad d WHERE d.idsucesora=$2))",[a.id,b.id]);
   const revision=await rev();
   check(await repo.reordenar(actor.id,ctx,{...base,revisionPlan:revision,movimientos:[{idactividad:b.id,identregable:e2.id,revision:await arev(b.id)}]}));
   check(await scalar('SELECT identregable FROM plaactividad WHERE id=$1',[b.id])===e2.id);
   check(await scalar('SELECT orden FROM proentregable WHERE id=$1',[e2.id])===1);
   check(await scalar('SELECT orden FROM plaactividad WHERE id=$1',[b.id])===1);
   check(await rev()===revision+1);
   assert.deepEqual(await scalar("SELECT jsonb_build_object('asignaciones',(SELECT jsonb_agg(to_jsonb(s)) FROM plaasignacion s WHERE s.idactividad IN($1,$2)),'dependencias',(SELECT jsonb_agg(to_jsonb(d)) FROM pladependenciaactividad d WHERE d.idsucesora=$2))",[a.id,b.id]),unchanged);checks++;
   await fails(()=>repo.reordenar(actor.id,ctx,{...base,revisionPlan:revision}),'conflict');
   await fails(async()=>repo.reordenar(actor.id,ctx,{...base,revisionPlan:await rev(),movimientos:[{idactividad:b.id,identregable:e.id,revision:1}]}),'conflict');
   await fails(async()=>repo.reordenar(actor.id,ctx,{...base,revisionPlan:await rev(),actividades:[a.id,a.id]}),'unprocessable');
   await fails(async()=>repo.reordenar(actor.id,ctx,{...base,revisionPlan:await rev(),actividades:[a.id]}),'unprocessable');
   await fails(async()=>repo.reordenar(actor.id,ctx,{...base,revisionPlan:await rev(),movimientos:[{idactividad:b.id,identregable:2147483647,revision:await arev(b.id)}]}),'unprocessable');
   await q("UPDATE plaactividad SET idestadoactividad=706 WHERE id=$1",[b.id]);
   const before=await rev();
   await fails(async()=>repo.reordenar(actor.id,ctx,{...base,revisionPlan:before,movimientos:[{idactividad:b.id,identregable:e.id,revision:await arev(b.id)}]}),'unprocessable');
   check(await rev()===before && await scalar('SELECT identregable FROM plaactividad WHERE id=$1',[b.id])===e2.id);
  }finally{await c.query('ROLLBACK TO SAVEPOINT orden_cronograma');await c.query('RELEASE SAVEPOINT orden_cronograma');}
  const cr=await repo.obtenerCronograma(actor.id,ctx);check(cr.actividades.length===2&&cr.fechas.length===2);
  const responsable=cr.entregables.find(x=>x.id===e.id)?.responsables?.find(r=>r.idtrabajador===worker.id);
  check(!!responsable && typeof responsable.nombretrabajador==='string' && typeof responsable.esprincipal==='boolean');
  const fichaAntes=await scalar('SELECT to_jsonb(e) FROM proentregable e WHERE id=$1',[e.id]);
  await repo.obtenerCronograma(actor.id,ctx);
  assert.deepEqual(await scalar('SELECT to_jsonb(e) FROM proentregable e WHERE id=$1',[e.id]),fichaAntes);checks++;
  await c.query('SAVEPOINT responsable_inactivo');
  try{
   await q('UPDATE proentregableresponsable SET estado=0 WHERE identregable=$1',[e.id]);
   check((await repo.obtenerCronograma(actor.id,ctx)).entregables.find(x=>x.id===e.id).responsables.length===0);
  }finally{await c.query('ROLLBACK TO SAVEPOINT responsable_inactivo');await c.query('RELEASE SAVEPOINT responsable_inactivo');}

  const pre=await repo.previsualizar(actor.id,ctx,{cambios:{idactividad:a.id,fechanoiniciarantes:'2026-11-02'}});check(pre.afectadas.length===2);
  const detail=await repo.obtenerActividad(actor.id,ac);const assignment=detail.asignaciones[0];
  await repo.obtenerTrabajador(other.id);check((await repo.obtenerAsignacionPropia(other.id,assignment.id)).idtrabajador===worker.id);
  etapa='publicación y edición integrada';
  await repo.publicar(actor.id,ctx,{revisionPlan:await rev(),motivo:'Aprobación local'});
  await c.query('SAVEPOINT orden_publicado');
  try {
   const revision=await rev();
   await fails(()=>repo.reordenar(actor.id,ctx,{revisionPlan:revision,entregables:[e2.id,e.id],actividades:[b.id,a.id]}),'unprocessable');
   check(await rev()===revision);
   check(await repo.reordenar(actor.id,ctx,{revisionPlan:revision,entregables:[e2.id,e.id],actividades:[b.id,a.id],movimientos:[{idactividad:b.id,identregable:e2.id,revision:await arev(b.id)}],motivo:'Reorganización local'}));
   check(await scalar("SELECT EXISTS(SELECT 1 FROM plabitacoracambio WHERE idplan=$1 AND motivo='Reorganización local' AND datosnuevos->'movimientos'->0->>'identregable'=$2)",[plan.id,String(e2.id)]));
  }finally{await c.query('ROLLBACK TO SAVEPOINT orden_publicado');await c.query('RELEASE SAVEPOINT orden_publicado');}
  await c.query('SAVEPOINT color_publicado');
  try {
   const nuevo=await projects.crearEntregableProyecto(id,{idProyecto:id,nombre:'Color publicado',color:'#ee46bc',revisionPlan:await rev(),motivo:'Agregar entregable',idTrabajadoresResponsables:[worker.id]},actor.id);
   check(nuevo.success);
   check(await scalar("SELECT EXISTS(SELECT 1 FROM plabitacoracambio WHERE idplan=$1 AND datosnuevos->>'color'='#ee46bc')",[plan.id]));
  } finally {await c.query('ROLLBACK TO SAVEPOINT color_publicado');await c.query('RELEASE SAVEPOINT color_publicado');}
  check(await scalar('SELECT count(*)::int FROM plalineabase WHERE idplan=$1',[plan.id])===1);
  await projects.editarProyecto({...projectData,idProyecto:id,idUsuarioModificacion:actor.id,revisionPlan:await rev(),motivo:'Mantener fechas'});
  check((await projects.actualizarEntregableProyecto(e2.id,{nombre:'Temporal editado',revisionPlan:await rev(),motivo:'Renombrar',orden:1},actor.id)).success);
  check((await projects.eliminarEntregableProyecto(e2.id,actor.id,await rev(),'Retirar temporal')).success);
  const blockedDelete=await projects.eliminarProyecto(id,actor.id);check(blockedDelete.success===false && blockedDelete.message.includes('planificación activa'));
  check(await scalar('SELECT estado FROM proproyecto WHERE id=$1',[id])===1);
  const baseline=await scalar('SELECT jsonb_agg(to_jsonb(b)) FROM plalineabaseactividad b WHERE idlineabase IN(SELECT id FROM plalineabase WHERE idplan=$1)',[plan.id]);
  etapa='arrastrar y ampliar actividad desde el calendario';
  await c.query('SAVEPOINT barras_cronograma');
  try {
    const revision=await rev();
    const antes=await repo.obtenerActividad(actor.id,ac);
    const simulacion=await repo.previsualizar(actor.id,ctx,{cambios:{idactividad:a.id,fechanoiniciarantes:'2026-11-02',fechanofinalizarantes:'2026-11-10'}});
    check(simulacion.revisionplan===revision && await rev()===revision);
    const prevista=simulacion.despues.find(f=>f.idactividad===a.id);
    check(prevista.inicio>='2026-11-02' && prevista.fin>='2026-11-10');
    await repo.reprogramar(actor.id,ac,{revisionPlan:revision,revision:await arev(a.id),fechaNoIniciarAntes:'2026-11-02',fechaNoFinalizarAntes:'2026-11-10',motivo:'Ampliar intervalo desde barra'});
    const despues=await repo.obtenerActividad(actor.id,ac), cr=await repo.obtenerCronograma(actor.id,ctx);
    const principal=cr.fechas.find(f=>f.idactividad===a.id), sucesora=cr.fechas.find(f=>f.idactividad===b.id);
    check(principal.inicio===prevista.inicio && principal.fin===prevista.fin);
    check(sucesora.inicio>principal.fin);
    check(despues.actividad.minutosestimados===antes.actividad.minutosestimados);
    assert.deepEqual(despues.asignaciones,antes.asignaciones);checks++;
  } finally {await c.query('ROLLBACK TO SAVEPOINT barras_cronograma');await c.query('RELEASE SAVEPOINT barras_cronograma');}
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
  // El trabajo real debe registrarse en el intervalo vigente tras la reprogramación.
  await q(`UPDATE conjornada SET fechajornada=(SELECT (f->>'inicio')::date FROM jsonb_array_elements(public."pla_CalcularCronograma"($1)) f WHERE (f->>'idactividad')::integer=$2) WHERE id=$3`,[plan.id,a.id,j.id]);
  const record=await control.crearActividad(registro);check(record.idasignacion===assignment.id&&record.identregable===e.id&&!record.entregableculminado);
  check((await repo.obtenerActividad(actor.id,ac)).asignaciones[0].saldo.minutossaldo===900);
  await c.query('SAVEPOINT traslado_con_registro');
  try{
   await q('UPDATE proentregable SET estado=1 WHERE id=$1',[e2.id]);
   await fails(async()=>repo.reordenar(actor.id,ctx,{revisionPlan:await rev(),entregables:[e.id,e2.id],actividades:[a.id,b.id],movimientos:[{idactividad:a.id,identregable:e2.id,revision:await arev(a.id)}],motivo:'No permitido'}),'unprocessable');
   check(await scalar('SELECT identregable FROM plaactividad WHERE id=$1',[a.id])===e.id);
  }finally{await c.query('ROLLBACK TO SAVEPOINT traslado_con_registro');await c.query('RELEASE SAVEPOINT traslado_con_registro');}
  // El guard de Control Operativo autoriza registrar por terceros; SQL conserva la propiedad de la asignación.
  const porTercero=await control.crearActividad({...registro,idUsuarioCreacion:actor.id,horaInicio:'14:00',horaFin:'14:15'});
  check(porTercero.idasignacion===assignment.id);
  check(await control.eliminarActividad(porTercero.id,actor.id));
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
  console.log(JSON.stringify({comprobaciones:checks,endpointsPlanificacion:28,integracion:'repositorios reales + funciones + restricciones PostgreSQL',resultado:'OK',datosPrueba:'ROLLBACK'}));
}
async function scalarNoTx(sql){return Object.values((await c.query(sql)).rows[0])[0];}
main().catch(e=>{console.error('Prueba local fallida en '+etapa+':',e.kind||e.code||e.name,e.message);process.exitCode=1;});


