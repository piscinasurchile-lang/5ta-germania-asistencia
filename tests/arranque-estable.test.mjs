import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const update=read('public/legacy/germania-actualizar.js').split('// Resumen independiente')[0];
const flush=async()=>{await new Promise(resolve=>setImmediate(resolve));};
function actualizador({version='nueva',marcador=null,fallaInicial=false,sinStorage=false}={}){
 const events={},timers=[],memoria=new Map(marcador?[['germania:version-aplicada',marcador]]:[]);let llamadas=0,recargas=0,limpiezas=0;
 const document={visibilityState:'visible',activeElement:null,addEventListener:(e,f)=>events[e]=f};
 const c={document,localStorage:{getItem:k=>memoria.get(k),setItem:(k,v)=>{if(sinStorage)throw Error('Sin almacenamiento');memoria.set(k,v);}},fetch:async()=>{llamadas++;if(fallaInicial&&llamadas===1)throw Error('Sin red');return {ok:true,json:async()=>({version:c.version})};},version,window:{top:{location:{reload:()=>recargas++}},caches:{}},caches:{keys:async()=>['germania-static-v11-b5'],delete:async()=>limpiezas++},navigator:{},setInterval:f=>timers.push(f)};
 vm.createContext(c);vm.runInContext(update,c);
 return {c,events,timers,document,memoria,recargas:()=>recargas,llamadas:()=>llamadas,limpiezas:()=>limpiezas};
}
for(const marcador of [null,'antigua','nueva'])test('arranca una sola vez con marcador '+marcador,async()=>{
 const f=actualizador({marcador});await flush();assert.equal(f.recargas(),0);assert.equal(f.limpiezas(),0);assert.equal(f.memoria.get('germania:version-aplicada'),'nueva');
});
test('volver de otra aplicación sin nueva versión conserva la pantalla',async()=>{
 const f=actualizador();await flush();for(let i=0;i<10;i++){f.document.visibilityState='hidden';f.events.visibilitychange();f.document.visibilityState='visible';f.events.visibilitychange();await flush();}
 assert.equal(f.recargas(),0);assert.equal(f.limpiezas(),0);assert.equal(f.llamadas(),11);
});
test('cambio real de versión recarga una sola vez aunque coincidan eventos',async()=>{
 const f=actualizador();await flush();f.c.version='otra';f.events.visibilitychange();f.timers[0]();f.events.visibilitychange();await flush();
 assert.equal(f.recargas(),1);assert.equal(f.limpiezas(),1);assert.equal(f.llamadas(),2);
});
test('no interrumpe un campo activo y aplica actualización al terminar',async()=>{
 const f=actualizador();await flush();f.c.version='otra';f.document.activeElement={tagName:'INPUT'};f.timers[0]();await flush();assert.equal(f.recargas(),0);
 f.document.activeElement=null;f.timers[0]();await flush();assert.equal(f.recargas(),1);
});
test('error inicial de red se recupera sin recarga doble y sigue detectando versiones',async()=>{
 const f=actualizador({fallaInicial:true});await flush();f.timers[0]();await flush();assert.equal(f.llamadas(),2);assert.equal(f.recargas(),0);
 f.c.version='otra';f.timers[0]();await flush();assert.equal(f.recargas(),1);
});
test('almacenamiento bloqueado no provoca bucle de recargas',async()=>{
 const f=actualizador({sinStorage:true});await flush();f.timers[0]();await flush();assert.equal(f.recargas(),0);f.c.version='otra';f.timers[0]();await flush();assert.equal(f.recargas(),1);
});
function arranque({iniciada=true,cargador=true,oculta=false}={}){
 const page=read('app/page.js');let code=page.slice(page.indexOf('export default function Page() {')+'export default function Page() {'.length,page.indexOf('  // La portada se desvanece'));
 const timers=new Map(),efectos=[],states=[],refs=[];let clock=0,id=0;
 const loading={classList:{contains:()=>oculta,add:()=>{throw Error('No ocultar la carga prematuramente');}}};
 const doc={head:{appendChild:()=>{}},createElement:()=>({style:{}}),getElementById:n=>n==='appLoading'?(cargador?loading:null):n==='crestImg'?{getAttribute:()=>iniciada?'data:image/png;base64,a':null}:null};
 const c={useEffect:f=>efectos.push(f),useState:v=>{const i=states.length;states.push(v);return [v,n=>{states[i]=typeof n==='function'?n(states[i]):n;}];},useRef:v=>{const ref={current:v};refs.push(ref);return ref;},Date:{now:()=>clock},setInterval:f=>{timers.set(++id,f);return id;},clearInterval:n=>timers.delete(n)};
 vm.createContext(c);const h=vm.runInContext('(function(){'+code+'return {onFrameLoad,frameRef};})()',c);
 h.frameRef.current={contentDocument:doc,contentWindow:{getComputedStyle:()=>({display:oculta?'none':'block'})}};
 return {h,states,timers,efectos,doc,tick:ms=>{clock=ms;for(const f of [...timers.values()])f();},ocultar:()=>{oculta=true;}};
}
test('conexión lenta no libera portada a los seis segundos; entra al terminar',()=>{
 const f=arranque();f.h.onFrameLoad();f.tick(6500);assert.equal(f.states[0],false);f.tick(12500);assert.equal(f.states[0],false);assert.equal(f.states[3],true);f.ocultar();f.tick(14000);assert.equal(f.states[0],true);assert.equal(f.timers.size,0);
});
test('documento vacío no se presenta como aplicación cargada',()=>{
 const f=arranque({iniciada:false,cargador:false});f.h.onFrameLoad();f.tick(500);assert.equal(f.states[0],false);f.tick(9500);assert.equal(f.states[4],1);assert.equal(f.states[0],false);
});
test('eventos load repetidos conservan una sola vigilancia',()=>{
 const f=arranque();f.h.onFrameLoad();f.h.onFrameLoad();assert.equal(f.timers.size,1);f.ocultar();f.tick(500);assert.equal(f.states[0],true);assert.equal(f.timers.size,0);
});
test('el documento anterior no puede liberar la portada del nuevo',()=>{
 const f=arranque();f.h.onFrameLoad();f.h.frameRef.current.contentDocument={};f.tick(500);assert.equal(f.states[0],false);assert.equal(f.timers.size,0);
});

test('abrir ODD dentro del iframe no se confunde con un inicio fallido',()=>{
 const f=arranque({iniciada:false,cargador:false});f.doc.location={protocol:'https:',pathname:'/odd-maestras'};f.h.onFrameLoad();f.tick(10000);assert.equal(f.states[0],true);assert.equal(f.states[4],0);assert.equal(f.timers.size,0);
});
