// Respaldo consistente y ensayo sobre una copia nueva. Sólo modifica producción con
// --aplicar-produccion, y únicamente después de verificar archivo, restauración y SQL local.
// Conexión: referencia DATABASE_URL comentada en .env; nunca imprime credenciales.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { Client } = require('pg');
const root = path.resolve(__dirname,'..');
const sqlRoot = path.resolve(root,'../api-visor-gvr-sql');
const stamp = new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,17);
const container = 'gvr-postgres-local';
const copyDb = 'gvr_prod_copia_'+stamp;
const directory = path.join(root,'backups','produccion',stamp);
const archive = path.join(directory,'antes-permisos-granulares.dump');
const remoteArchive = '/tmp/gvr-respaldo-'+stamp+'.dump';
const applyProduction = process.argv.includes('--aplicar-produccion');
const files = ['2026-10-17-permisos-granulares.sql','2026-10-20-permisos-granulares-alcances.sql'];
const reverse = ['2026-10-20-permisos-granulares-alcances-reversion.sql','2026-10-17-permisos-granulares-reversion.sql'];
const migration = file => fs.readFileSync(path.join(sqlRoot,'schema/migrations',file),'utf8');
const digest = text => crypto.createHash('sha256').update(text).digest('hex');
const ident = value => '"'+value.replaceAll('"','""')+'"';
const literal = value => "'"+value.replaceAll("'","''")+"'";
const output = data => console.log(JSON.stringify(data));
fs.mkdirSync(directory,{recursive:true});
const manifest = {inicioUTC:new Date().toISOString(),modo:applyProduction?'respaldo-ensayo-y-migracion-produccion':'respaldo-y-ensayo',
  copiaLocal:copyDb,archivo:path.basename(archive),migraciones:{},pasos:[],produccionModificada:false};
const save = () => fs.writeFileSync(path.join(directory,'manifiesto.json'),JSON.stringify(manifest,null,2)+'\n');
function step(name, details={}) { manifest.pasos.push({paso:name,fechaUTC:new Date().toISOString(),...details});save();output({paso:name,...details}); }
function docker(args, input, label='docker') {
  const r=spawnSync('docker',args,{input,encoding:'utf8',timeout:600000,maxBuffer:64*1024*1024});
  if(r.status!==0){fs.writeFileSync(path.join(directory,label+'.private.log'),(r.stderr||'')+(r.stdout||''));throw Error('Falló '+label+'; consultar registro privado del respaldo.');}
  return r.stdout.trim();
}
function local(db,query,label='sql-local') {return docker(['exec','-i',container,'psql','-X','-U','supabase_admin','-d',db,'-At','-v','ON_ERROR_STOP=1'],query,label);}
const metricsSql = `SELECT json_build_object(
  'acciones',(SELECT count(*) FROM public.authpermisosgranulares),
  'alcances',(SELECT count(*) FROM public.authpermisosalcances),
  'rolesConPermisos',(SELECT count(DISTINCT idrol) FROM public.authrolespermisosgranulares WHERE estado=1),
  'accionesAdministrador',(SELECT count(DISTINCT idpermiso) FROM public.authrolespermisosgranulares WHERE idrol=1 AND estado=1),
  'concesionesCompatibilidad',(SELECT count(*) FROM public.authrolespermisosgranulares g
    JOIN public.authpermisosgranulares p ON p.id=g.idpermiso JOIN public.authopciones o ON o.id=p.idopcion
    JOIN public.authmodulos m ON m.id=o.idmodulo WHERE g.idrol IN (3,9) AND g.estado=1 AND g.alcance='asignados'
    AND m.codigo='gestion_bim' AND o.codigo='incidencias' AND p.accion IN ('exportar','eliminar_adjuntos')),
  'clonarRol',(to_regprocedure('public."auth_ClonarRolV2"(integer,integer,text,text)') IS NOT NULL));`;
const expectedMetrics={acciones:202,alcances:279,rolesConPermisos:10,accionesAdministrador:202,concesionesCompatibilidad:4,clonarRol:true};
const policyStateSql=`SELECT json_build_object(
  'roles',(SELECT json_agg(row_to_json(x) ORDER BY id) FROM (SELECT id,nombre,estado FROM public.authroles) x),
  'usuariosRoles',(SELECT json_agg(row_to_json(x) ORDER BY id) FROM (SELECT id,idusuario,idrol,estado FROM public.authusuariosroles) x),
  'menuRoles',(SELECT json_agg(row_to_json(x) ORDER BY id) FROM (SELECT id,idrol,idmenu,estado FROM public.genmenuroles) x),
  'menus',(SELECT json_agg(row_to_json(x) ORDER BY id) FROM (SELECT id,idpadre,nombre,url,orden,estado FROM public.genmenurecursivo) x));`;
const readConnection=()=>{
  const env=fs.readFileSync(path.join(root,'.env'),'utf8');
  const value=process.env.PROD_DATABASE_URL||env.match(/^#\s*DATABASE_URL\s*=\s*(postgres(?:ql)?:\/\/[^\r\n]+supabase\.com[^\r\n]*)$/m)?.[1];
  if(!value)throw Error('Falta la referencia privada de producción.');
  const url=new URL(value);
  assert(url.hostname.endsWith('.supabase.com'),'El destino debe ser Supabase producción');
  if(url.port==='6543')url.port='5432';
  return url;
};
const connect=url=>new Client({connectionString:url.toString(),ssl:{rejectUnauthorized:false},
  application_name:'gvr_respaldo_migracion_autorizada',connectionTimeoutMillis:20000});
async function main(){
  const url=readConnection();
  const verified=JSON.parse(fs.readFileSync(path.join(sqlRoot,'docs/permisos/ensayo-migracion-2026-10-20.json'),'utf8'));
  for(const file of [...files,...reverse]) { const hash=digest(migration(file));assert.equal(hash,verified.sha256[file],'SQL cambió desde el ensayo: '+file);manifest.migraciones[file]=hash; }
  assert.equal(local('postgres','SHOW cron.launch_active_jobs;'),'off','Cron local debe estar desactivado');
  const source=connect(url);await source.connect();
  let tables,counts,roles,snapshot,policyHash,version;
  try{
    await source.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    await source.query("SET LOCAL statement_timeout='120s'");
    assert.equal((await source.query("SHOW transaction_read_only")).rows[0].transaction_read_only,'on');
    assert.equal((await source.query("SELECT to_regclass('public.authpermisosgranulares') IS NULL AS no_instalado")).rows[0].no_instalado,true,'La migración ya está instalada');
    version=(await source.query('SHOW server_version')).rows[0].server_version;
    snapshot=(await source.query('SELECT pg_export_snapshot() AS snapshot')).rows[0].snapshot;
    policyHash=digest(JSON.stringify((await source.query(policyStateSql)).rows[0]));
    tables=(await source.query(`SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relkind IN ('r','p') ORDER BY c.relname`)).rows.map(r=>r.relname);
    const countSql=tables.map(t=>`SELECT ${literal(t)} AS tabla,count(*)::text AS filas FROM public.${ident(t)}`).join(' UNION ALL ');
    counts=(await source.query(countSql)).rows;
    roles=(await source.query('SELECT rolname FROM pg_roles ORDER BY rolname')).rows.map(r=>r.rolname);
    step('snapshot de producción abierto en solo lectura',{version,tablasPublicas:tables.length});
    const values=[url.hostname,url.port,decodeURIComponent(url.username),decodeURIComponent(url.password),decodeURIComponent(url.pathname.slice(1)),snapshot];
    assert(values.every(v=>!/[\r\n]/.test(v)));
    const command=`IFS= read -r PGHOST; IFS= read -r PGPORT; IFS= read -r PGUSER; IFS= read -r PGPASSWORD; IFS= read -r PGDATABASE; IFS= read -r SNAPSHOT;
export PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE;
export PGSSLMODE=require; export PGOPTIONS='-c default_transaction_read_only=on';
exec pg_dump --no-password --format=custom --compress=6 --snapshot="$SNAPSHOT" --file=${remoteArchive}`;
    docker(['exec','-i',container,'sh','-c',command],values.join('\n')+'\n','pg-dump-produccion');
    docker(['cp',container+':'+remoteArchive,archive],undefined,'copiar-respaldo');
    const listing=docker(['exec',container,'pg_restore','--list',remoteArchive],undefined,'validar-archivo');
    assert(listing.includes('TABLE DATA'),'El respaldo no contiene datos');
    manifest.respaldo={version,sha256:digest(fs.readFileSync(archive)),bytes:fs.statSync(archive).size,
      snapshotSoloLectura:true,tablasPublicas:tables.length,conteos:counts,politicasSHA256:policyHash};
    fs.writeFileSync(path.join(directory,'contenido-archivo.txt'),listing);
    step('respaldo completo creado y archivo verificado',{bytes:manifest.respaldo.bytes,sha256:manifest.respaldo.sha256});
  }finally{await source.query('ROLLBACK').catch(()=>{});await source.end();}
  assert.equal(local('postgres',`SELECT count(*) FROM pg_database WHERE datname=${literal(copyDb)};`),'0');
  const missing=roles.filter(r=>!r.startsWith('pg_')).map(r=>`IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname=${literal(r)}) THEN CREATE ROLE ${ident(r)} NOLOGIN; END IF;`).join('\n');
  local('postgres',`DO $roles$ BEGIN ${missing} END $roles$;`,'roles-locales');
  local('postgres',`CREATE DATABASE ${ident(copyDb)} WITH TEMPLATE template0 OWNER supabase_admin;`,'crear-copia');
  docker(['exec',container,'pg_restore','-U','supabase_admin','--dbname='+copyDb,'--single-transaction','--exit-on-error','--no-owner','--no-privileges',remoteArchive],undefined,'restaurar-copia');
  local(copyDb,`DO $cron$ BEGIN IF to_regclass('cron.job') IS NOT NULL THEN UPDATE cron.job SET active=false WHERE active; END IF; END $cron$;`,'desactivar-cron-copia');
  for(const row of counts)assert.equal(local(copyDb,`SELECT count(*) FROM public.${ident(row.tabla)};`),row.filas,'Diferencia al restaurar '+row.tabla);
  step('copia nueva restaurada y conteos verificados',{base:copyDb,tablas:tables.length});
  for(const file of files)local(copyDb,migration(file),'ensayo-'+file);
  assert.deepEqual(JSON.parse(local(copyDb,metricsSql)),expectedMetrics);
  step('ambas migraciones pasan en la copia nueva',{catalogo:expectedMetrics});
  for(const file of reverse)local(copyDb,migration(file),'reversion-'+file);
  assert.equal(local(copyDb,"SELECT to_regclass('public.authpermisosgranulares') IS NULL;"),'t');
  for(const file of files)local(copyDb,migration(file),'reaplicacion-'+file);
  assert.deepEqual(JSON.parse(local(copyDb,metricsSql)),expectedMetrics);
  manifest.ensayo={aplicacion:'ok',reversion:'ok',reaplicacion:'ok'};
  step('reversión y reaplicación verificadas en la copia');
  // La copia se conserva migrada y sin procesos de aplicación/cron que ejecuten integraciones.
  if(applyProduction){
    const target=connect(url);await target.connect();
    try{
      await target.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const nowHash=digest(JSON.stringify((await target.query(policyStateSql)).rows[0]));
      assert.equal(nowHash,policyHash,'Cambiaron roles o menús desde el respaldo; detener y revisar');
      assert.equal((await target.query("SELECT to_regclass('public.authpermisosgranulares') IS NULL AS no_instalado")).rows[0].no_instalado,true);
      await target.query('ROLLBACK');
      await target.query("SET lock_timeout='5s'");
      await target.query("SET statement_timeout='180s'");
      for(const file of files){
        assert.equal(digest(migration(file)),manifest.migraciones[file]);
        await target.query(migration(file));
        manifest.produccionModificada=true;
        step('migración confirmada en producción',{archivo:file});
      }
      const result=(await target.query(metricsSql)).rows[0].json_build_object;
      assert.deepEqual(result,expectedMetrics);
      manifest.resultadoProduccion=result;
      step('verificación final de producción correcta',{catalogo:result});
    }finally{await target.query('ROLLBACK').catch(()=>{});await target.end();}
  }
  manifest.finUTC=new Date().toISOString();save();
  output({terminado:true,produccionModificada:manifest.produccionModificada,respaldo:archive,copiaLocal:copyDb});
  docker(['exec',container,'rm','-f',remoteArchive],undefined,'retirar-archivo-contenedor');
}
main().catch(error=>{manifest.error=error.message;manifest.finUTC=new Date().toISOString();save();
  console.error(JSON.stringify({error:error.message,respaldo:directory,produccionModificada:manifest.produccionModificada}));process.exitCode=1;});
