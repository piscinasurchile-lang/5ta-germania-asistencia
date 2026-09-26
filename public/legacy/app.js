
/* ============ DATOS BASE ============ */
const LOGO_B64="data:image/png;base64,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";
const FUNDACION_BRIGADA = "2023-06-21";   // fundada como Brigada
const FUNDACION_COMPANIA = "2025-11-05";  // elevada a Compañía
const FOUNDING_DATE = FUNDACION_BRIGADA;  // antiguedad de los fundadores
const SEED = [
  // Orden del Día 010/2026 - Listado de Compañía y Claves (25 de enero de 2026)
  // {clave, cargo, nombre, apPat, apMat, rut, telefono, operativo, formaIngreso, origen}
  {clave:"75", cargo:"Director", nombre:"Karam", ap:"Puali", am:"López", rut:"15.243.920-2", tel:"+56 9 9638 8991", op:true},
  {clave:"45", cargo:"Capitán", nombre:"Fernando", ap:"Jerez", am:"Pantoja", rut:"15.590.310-4", tel:"+56 9 4213 8558", op:true, forma:"Traslado", origen:"Por confirmar"},
  {clave:"9",  cargo:"Tesorero General", nombre:"Fernando", ap:"Ortega", am:"Gutiérrez", rut:"10.234.287-9", tel:"+56 9 9706 6611", op:true},
  {clave:"501",cargo:"Teniente 1", nombre:"Tomás", ap:"Lara", am:"Jeffs", rut:"14.118.272-2", tel:"+56 9 9840 6864", op:true, forma:"Traslado", origen:"Por confirmar"},
  {clave:"502",cargo:"Teniente 2", nombre:"Matías", ap:"Corvalán", am:"Garrido", rut:"20.256.703-7", tel:"+56 9 8890 9899", op:true, forma:"Traslado", origen:"Compañía Alemana (por confirmar)"},
  {clave:"503",cargo:"Teniente 3", nombre:"Andrés", ap:"Herrera", am:"Santander", rut:"16.711.219-6", tel:"+56 9 9771 2130", op:true},
  {clave:"504",cargo:"Ayudante", nombre:"Francisco", ap:"Vega", am:"Lara", rut:"15.911.631-K", tel:"+56 9 9860 9638", op:true, forma:"Traslado", origen:"Compañía Alemana (por confirmar)"},
  {clave:"505",cargo:"Jefe de Máquinas", nombre:"Diego", ap:"Lozano", am:"González", rut:"13.829.491-9", tel:"+56 9 5611 0725", op:true, conductor:true},
  {clave:"506",cargo:"Secretario", nombre:"Susumu", ap:"Sugiura", am:"Aguilar", rut:"14.413.688-8", tel:"+56 9 9237 9959"},
  {clave:"507",cargo:"Tesorero", nombre:"Mathias", ap:"Von Leyser", am:"Jux", rut:"8.905.167-3", tel:"+56 9 9230 4753"},
  {clave:"508",cargo:"Voluntario", nombre:"Pablo", ap:"Arellano", am:"Graell", rut:"16.369.672-K", tel:"+56 9 9229 1516"},
  {clave:"509",cargo:"Voluntario", nombre:"María Paz", ap:"Solo de Zaldívar", am:"Lavanchy", rut:"18.024.584-7", tel:"+56 9 8923 0949"},
  {clave:"510",cargo:"Voluntario", nombre:"Ludwig", ap:"Von Plessing", am:"Cea", rut:"17.045.065-5", tel:"+56 9 8899 4179"},
  {clave:"513",cargo:"Voluntario", nombre:"José", ap:"Álvarez", am:"Álvarez", rut:"25.659.614-8", tel:"+56 9 9570 0000"},
  {clave:"514",cargo:"Voluntario", nombre:"Juan Pablo", ap:"Orlandini", am:"Retamal", rut:"8.338.250-3", tel:"+56 9 9419 2551"},
  {clave:"515",cargo:"Voluntario", nombre:"Luis", ap:"Bustos", am:"Rivera", rut:"12.929.761-1", tel:"+56 9 9937 7438"},
  {clave:"516",cargo:"Voluntario", nombre:"Cristóbal", ap:"Rascheya", am:"Travini", rut:"21.907.445-K", tel:"+56 9 8723 7392"},
  {clave:"517",cargo:"Voluntario", nombre:"Christian", ap:"Vergara", am:"Sandoval", rut:"10.566.726-4", tel:"+56 9 9693 1320"},
  {clave:"518",cargo:"Voluntario", nombre:"César", ap:"Ilarre", am:"Castro", rut:"16.682.842-2", tel:"+56 9 9982 5055"},
  {clave:"519",cargo:"Voluntario", nombre:"León", ap:"Campino", am:"Del Villar", rut:"22.167.254-2", tel:"+56 9 6394 8973"},
  {clave:"520",cargo:"Voluntario", nombre:"Natalia", ap:"Yáñez", am:"Navarrete", rut:"19.608.304-9", tel:"+56 9 4117 1255"},
  {clave:"521",cargo:"Voluntario", nombre:"Rodolfo", ap:"Maldonado", am:"Avendaño", rut:"19.272.472-4", tel:"+56 9 7763 8309"},
  {clave:"522",cargo:"Voluntario", nombre:"Manuel", ap:"Moller", am:"Henríquez", rut:"10.188.589-5", tel:"+56 9 9646 8660"},
  {clave:"523",cargo:"Voluntario", nombre:"Joaquín", ap:"Bustos", am:"Guzmán", rut:"20.644.799-0", tel:"+56 9 4562 1346"},
  {clave:"524",cargo:"Voluntario", nombre:"María Paz", ap:"Ortega", am:"González", rut:"21.020.125-4", tel:"+56 9 5906 2829"},
  {clave:"525",cargo:"Voluntario", nombre:"Gustavo", ap:"Jerez", am:"Pantoja", rut:"13.105.415-7", tel:"+56 9 7685 8145"}
];

/* Integrantes retirados. Conservan su ficha e historial, sin numero de lista. */
const SEED_BAJAS = [
  // Solo figuran aqui integrantes de la lista oficial (ODD 010/2026) que se retiraron.
  {clave:"511", nombre:"Vaslav", ap:"Rubeska", am:"Becerra", rut:"19.305.936-8", tel:"+56 9 8369 6928", motivo:"Renuncia"},
  {clave:"512", nombre:"Magdalena", ap:"Cortés", am:"García", rut:"17.983.201-1", tel:"+56 9 9340 0000", motivo:"Renuncia"}
];

/* Malla curricular ANB 2025-2028 */
const MALLA = [
  {nivel:"Nivel Inicial", cursos:[
    "Introducción a la Historia y Funcionamiento de Bomberos de Chile",
    "Introducción a Equipos de Protección Personal y Primera Respuesta"
  ]},
  {nivel:"Nivel Básico", cursos:[
    "Herramientas y Equipos Bomberiles",
    "Comportamiento Humano en Emergencias",
    "Equipos de Protección Personal para Bomberos",
    "Fuego y Tácticas",
    "Reanimación Cardiopulmonar para Bomberos",
    "Control de Incendios Forestales"
  ]},
  {nivel:"Nivel Intermedio", cursos:[
    "Escalas y Cuerdas para el Control de Incendios",
    "Búsqueda y Rescate en Incendios Estructurales",
    "Sobrevivencia en Incendios Estructurales",
    "Riesgos Eléctricos",
    "Soporte Vital Básico (SVB)",
    "Incendios Estructurales",
    "Introductorio CRIMAP",
    "Curso Básico Sistema de Comando de Incidentes (2026)"
  ]},
  {nivel:"Nivel Avanzado", cursos:[
    "Control de Incendios Estructurales",
    "Oficial de Seguridad del Incidente",
    "Mandos Superiores",
    "Primera Respuesta a Incidentes con Materiales Peligrosos (CRIMAP) (2026)"
  ]},
  {nivel:"Especialidades", cursos:[
    "Rescate en Desnivel",
    "Rescate Agreste",
    "Rescate en Espacios Confinados",
    "Abastecimiento",
    "Introducción al Sistema Nacional de Operaciones y SENAPRED",
    "Rescate Minero",
    "GERSA",
    "Búsqueda en Estructuras Colapsadas",
    "Técnico Hazmat (Contención y Análisis de Riesgos)",
    "Operador de Cuerpo Bomba"
  ]},
  {nivel:"Cursos complementarios", cursos:[
    "Primera Respuesta en Rescate Técnico para No Especialistas",
    "Promoción de la Cultura de la Equidad",
    "Lengua de Señas Chilena con Perspectiva de Emergencias"
  ]}
];
const NIVELES_OBLIGATORIOS = ["Nivel Inicial","Nivel Básico","Nivel Intermedio"];

/* Captura de errores: si algo falla, se muestra en pantalla en vez de dejar
   la aplicación sin responder. */
window.addEventListener("error",function(ev){
  try{
    let c=document.getElementById("errorGlobal");
    if(!c){
      c=document.createElement("div"); c.id="errorGlobal";
      c.style.cssText="position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;background:#4a1f1c;"+
        "border:1px solid #b3241c;color:#f4d9d6;border-radius:8px;padding:12px 14px;font:12px/1.45 sans-serif;";
      document.body.appendChild(c);
    }
    c.innerHTML='<b>Se produjo un error</b><br>'+(ev.message||"")+
      '<br><span style="opacity:.75">'+((ev.filename||"")+" línea "+(ev.lineno||"?"))+'</span>'+
      '<br><button onclick="this.parentNode.remove()" style="margin-top:8px;background:none;border:1px solid #b3241c;'+
      'color:#f4d9d6;padding:6px 12px;border-radius:5px;">Cerrar</button>';
  }catch(e){}
});

/* Conexión de botones a prueba de elementos ausentes */
function on(id,evento,fn){
  const el=document.getElementById(id);
  if(el) el.addEventListener(evento,fn);
  return el;
}

/* Las pestañas se conectan de inmediato: aunque algo falle más abajo,
   la navegación entre secciones siempre responde. */
(function conectarPestanas(){
  function mostrar(nombre){
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
    const tb=document.querySelector('.tab[data-tab="'+nombre+'"]');
    const pn=document.getElementById("panel-"+nombre);
    if(tb) tb.classList.add("active");
    if(pn) pn.classList.add("active");
    window.scrollTo(0,0);
    try{ if(typeof switchTabExtra==="function") switchTabExtra(nombre); }catch(e){ console.error(e); }
  }
  window.__mostrarPestana=mostrar;
  document.querySelectorAll(".tab").forEach(t=>{
    t.addEventListener("click",function(){ mostrar(t.dataset.tab); });
  });
  document.querySelectorAll(".subtab").forEach(s=>{
    s.addEventListener("click",function(){
      if(!s.dataset.sub) return; /* enlaces a otras pestañas principales: Guardia, Historial, Informe */
      document.querySelectorAll(".subtab").forEach(x=>x.classList.remove("active"));
      document.querySelectorAll(".subpanel").forEach(x=>x.classList.remove("active"));
      s.classList.add("active");
      const sp=document.getElementById("sub-"+s.dataset.sub);
      if(sp) sp.classList.add("active");
      if(s.dataset.sub==="oficialidad" && typeof loadOficialidadYear==="function") loadOficialidadYear();
    });
  });
})();

const HISTORICO_2026 = {"gente":[{"nom":"José","ap":"Álvarez","am":"Álvarez"},{"nom":"Pablo","ap":"Arellano","am":"Graell"},{"nom":"Joaquín","ap":"Bustos","am":"Guzmán"},{"nom":"Luis","ap":"Bustos","am":"Rivera"},{"nom":"León","ap":"Campino","am":"Del Villar"},{"nom":"Magdalena","ap":"Cortés","am":"García"},{"nom":"Matías","ap":"Corvalán","am":"Garrido"},{"nom":"Andrés","ap":"Herrera","am":"Santander"},{"nom":"César","ap":"Ilarre","am":"Castro"},{"nom":"Fernando","ap":"Jerez","am":"Pantoja"},{"nom":"Gustavo","ap":"Jerez","am":"Pantoja"},{"nom":"Tomás","ap":"Lara","am":"Jeffs"},{"nom":"Diego","ap":"Lozano","am":"González"},{"nom":"Rodolfo","ap":"Maldonado","am":"Avendaño"},{"nom":"Manuel","ap":"Moller","am":"Henríquez"},{"nom":"Juan Pablo","ap":"Orlandini","am":"Retamal"},{"nom":"María Paz","ap":"Ortega","am":"González"},{"nom":"Fernando","ap":"Ortega","am":"Gutiérrez"},{"nom":"Karam","ap":"Puali","am":"López"},{"nom":"Cristóbal","ap":"Rascheya","am":"Travini"},{"nom":"Vaslav","ap":"Rubeska","am":"Becerra"},{"nom":"María Paz","ap":"Solo de Zaldívar","am":"Lavanchy"},{"nom":"Susumu","ap":"Sugiura","am":"Aguilar"},{"nom":"Francisco","ap":"Vega","am":"Lara"},{"nom":"Christian","ap":"Vergara","am":"Sandoval"},{"nom":"Mathías","ap":"Von Leyser","am":"Jux"},{"nom":"Ludwig","ap":"Von Plessing","am":"Cea"},{"nom":"Natalia","ap":"Yáñez","am":"Navarrete"}],"acts":[{"t":"Compañía","f":"2026-01-03","n":"Academia Piscina","m":"AFFFFFAFFAFFFFFFFFFAFFAAFFAF"},{"t":"Emergencia","f":"2026-01-07","n":"Fuego En Vivienda","m":"FFFFAFFFFAFFFFFFFFAFFFFFFFFF"},{"t":"Comandancia","f":"2026-01-07","n":"Traspaso De Mando","m":"FAFFFFAAFAFFFFAFFAAFFFFAFFFA"},{"t":"Emergencia","f":"2026-01-11","n":"Inflamacion De Estufa","m":"FAFFFFFAFAFFFAAFFFAAFAFAFFAA"},{"t":"Emergencia","f":"2026-01-14","n":"Quema De Pastizales","m":"FAFFFFFFFAFFAAAFFFAAFFAAFAFA"},{"t":"Emergencia","f":"2026-01-14","n":"Quema De Pastizales","m":"FFFFFFFFFAFFFAFFFFAFFFFAFFFA"},{"t":"Compañía","f":"2026-01-14","n":"Academia Rcp","m":"FFFFFFAFAAFFFAAFFFFAFFAAFAFA"},{"t":"Compañía","f":"2026-01-15","n":"Reunion De Compañía","m":"AAAAAFAAFAAAAAAFAAAAFAAAFAAA"},{"t":"Emergencia","f":"2026-01-16","n":"Quema De Pastizales","m":"FAFFFFFFFFFFAFFFFFAAFFFFFFFF"},{"t":"Emergencia","f":"2026-01-18","n":"Quema De Pastizales","m":"FFFAFFAFFAFFFFAFFFFFFFAFFAFA"},{"t":"Emergencia","f":"2026-01-19","n":"Quema De Pastizales","m":"FAFFFFFFFAFFAFFFFFAFFFFFFFFF"},{"t":"Compañía","f":"2026-01-22","n":"Limpieza Contenedor","m":"FFFFFFFAFFFFFFAFFFFFFFFFFFFF"},{"t":"Emergencia","f":"2026-01-23","n":"Quema Plantacion De Pinos","m":"FFFFFFFFFFFFAAAFFFFFFFFFFFFA"},{"t":"Emergencia","f":"2026-01-24","n":"Guardia Club Aereo","m":"AFFFFFAAFAAFFFFFFFFAFFAAFFFA"},{"t":"Emergencia","f":"2026-01-24","n":"Quema Plantacion De Pinos","m":"AFFFFFAAFAFFFFFFFFFAFFAAFFFA"},{"t":"Compañía","f":"2026-01-28","n":"Academia Online","m":"AAAAAFAAFAAAAAAAAAAAFAAAFAAA"},{"t":"Compañía","f":"2026-02-02","n":"Reunion Extraordinaria","m":"AAAAFFAAAAAFFAAFFFAFFFAAFAAA"},{"t":"Emergencia","f":"2026-02-04","n":"Fuego En Vehiculo","m":"AFFFFFAAFFFFAAAFFFFAFFAFFFFA"},{"t":"Compañía","f":"2026-02-04","n":"Academia Equipos Era","m":"FFAFFFFAFAFFFAAFFAFAFFAAFAFA"},{"t":"Emergencia","f":"2026-02-06","n":"Quema De Pastizales","m":"FFFFFFFFFAFFFFFFFAAFFFFAFFFF"},{"t":"Comandancia","f":"2026-02-07","n":"Citacion De Comandancia","m":"FFFAFFFFFAAFFAFFAAAFFFAAFFFA"},{"t":"Emergencia","f":"2026-02-09","n":"Olor Indeterminado En Ambiente","m":"FFFFFFFFFAFFFFFFFFAFFFAAFFFF"},{"t":"Emergencia","f":"2026-02-09","n":"Alarma De Incendio","m":"FAAAFFFAFAFAFAFFFFAAFFAAFAFA"},{"t":"Emergencia","f":"2026-02-11","n":"Humo En Casa Habitacion","m":"FFFAFFFAFAFFAFFFFFFFFFAAFAFF"},{"t":"Compañía","f":"2026-02-11","n":"Academia Intro May Day","m":"FFFFFFFAFAAFFAFFFFFFFFAAFAAA"},{"t":"Compañía","f":"2026-02-18","n":"Ejercicio May Day & Rit","m":"FFFAAFAAFAAFFAFFFFAAFFAAFAAA"},{"t":"Emergencia","f":"2026-02-23","n":"Arbol Que Cae Sobre Tendido Electrico","m":"FFFFFFFFFAFFFAFFFFFFFFAAFFFA"},{"t":"Compañía","f":"2026-02-25","n":"Ejercicio Equipos Era","m":"FFFFFFAAFAAFAAAFFFAFFFAAFAAA"},{"t":"Comandancia","f":"2026-03-04","n":"Citacion De Comandancia","m":"FAAAFFAFFAAFAAAFFFAFFFFAFAFA"},{"t":"Compañía","f":"2026-03-11","n":"Entrenamiento Estandar Anb","m":"FFFFFFAAFFFAFFFFFFFFFFFFFAFF"},{"t":"Compañía","f":"2026-03-18","n":"Ejercicio Busqueda Primaria","m":"FFAFFFAAFAAAAFAFFFFAFFAAFFFF"},{"t":"Emergencia","f":"2026-03-19","n":"Incendio En 3 Viviendas","m":"FFAAFFFAFAFAFAFFFFFAFFAAFFAA"},{"t":"Compañía","f":"2026-03-25","n":"Ejercicio Tecnicas Rit","m":"FAAAFFAAFAAAAAFFAAFAFFAAFAAA"},{"t":"Compañía","f":"2026-04-01","n":"Ejercicio Despliegue De Armadas","m":"FFAAFFFAFAAAFFAFAAFFFFFAFFFF"},{"t":"Emergencia","f":"2026-04-01","n":"Fuga De Gas Desde Cilindro","m":"FFAFFFAAFAFAFFFFFFFAFFFAFFAF"},{"t":"Emergencia","f":"2026-04-03","n":"Incendio En Vivienda","m":"FFAAAFFAFAFAFFFFFFAAFFFFFFAF"},{"t":"Emergencia","f":"2026-04-03","n":"Incendio En Vivienda","m":"FFFAAFFFFAFAFFFFFFFFFFFFFAFF"},{"t":"Emergencia","f":"2026-04-08","n":"Quema De Pastizales","m":"FFFFFFFFFFAAAFFFFFFFFFFFFAFA"},{"t":"Compañía","f":"2026-04-15","n":"Entrenamiento Estandar Anb","m":"FFAAFFFAFAAAFAFFAAFAFFFAFAFA"},{"t":"Emergencia","f":"2026-04-26","n":"Fuego En Vivienda","m":"FFAFFFFFFAAFFAFFAAFFFFFFFFFA"},{"t":"Compañía","f":"2026-04-28","n":"Academia Svb | Anatomia","m":"FAFFFFAFAAAAFAAFAFFAFFFFFAFA"},{"t":"Emergencia","f":"2026-04-29","n":"Principio De Incendio Origen Electrico","m":"AFFFFFFFFFFFAFFFFFAAFFAFFAAF"},{"t":"Emergencia","f":"2026-05-02","n":"Fuego En Vivienda","m":"FAAAFFFFFAAAAFAFAAFFFFAAFFAA"},{"t":"Compañía","f":"2026-05-03","n":"Guardia Diurna Y Capacitacion","m":"FFFFFFAFAAAFFFFFFFFAFFFAFFFF"},{"t":"Emergencia","f":"2026-05-03","n":"Fuego En Vivienda","m":"FAAAAFFFFAFFAFFFFAAFFFFFFFAA"},{"t":"Emergencia","f":"2026-05-05","n":"Fuego En Supermercado","m":"FFFFAFFFFAFAAAFFFFAAFFAFFAFA"},{"t":"Compañía","f":"2026-05-06","n":"Academia Svb | Trauma Y Cinematica","m":"FFAAAFAFFAAAAAAFFFFAFFAAFAFF"},{"t":"Emergencia","f":"2026-05-13","n":"Humo En Entretecho","m":"FFFFFFFFFFFAAAFFFFFFFFAFFFFF"},{"t":"Compañía","f":"2026-05-13","n":"Reunion Ordinaria","m":"FFAAFFAAAAAAAFAFFAAAFAAAFAAF"},{"t":"Emergencia","f":"2026-05-16","n":"Fuego En Vivienda","m":"FFFFFFFFFAFAFFFFFFFFFFFAFAFF"},{"t":"Emergencia","f":"2026-05-20","n":"Fuego En Vivienda","m":"FFAAFFFFFAFAAAFFFFFAFFAFFFAA"},{"t":"Compañía","f":"2026-05-20","n":"Entrenamiento Estandar Anb","m":"FFAAFFAFFAFAFAFFFFAAFFAAFFAA"},{"t":"Emergencia","f":"2026-05-20","n":"Quema De Pastizales","m":"FFAAFFAFFAFAFAFFFFAAFFAAFFAA"},{"t":"Emergencia","f":"2026-05-22","n":"Fuego En Entretecho","m":"FFFFFFFFFFFFFAFFFFAFFFFAFFFF"},{"t":"Emergencia","f":"2026-05-24","n":"Fuego En Vivienda","m":"FFFFFFAFFAFAFAFFFFAFFFFFFFFF"},{"t":"Emergencia","f":"2026-05-26","n":"Quema De Pastizales","m":"FFFFFFFFFFFFAAFFFFFFFFFAFFFA"},{"t":"Emergencia","f":"2026-05-26","n":"Quema De Pastizales","m":"FFFFFFFFFAFAAFFFFFAFFFFFFFFF"},{"t":"Emergencia","f":"2026-05-27","n":"Incendio De Buses","m":"FFAFFFFAFAFAAAAFFFFAFFFAFFFF"},{"t":"Emergencia","f":"2026-05-28","n":"Humo En Entretecho","m":"FFAFFFFAFFFAAAFFFFFAFFFFFFFF"},{"t":"Emergencia","f":"2026-05-29","n":"Inflamacion Estufa A Pellet","m":"FFFAFFFFAAFFFAFFFFFAFFFAFFFF"},{"t":"Emergencia","f":"2026-05-30","n":"Fuego En Vivienda","m":"FFAFFFFAFAFAFFFFFAAAFFFFAFFF"},{"t":"Emergencia","f":"2026-06-03","n":"Fuego En Vivienda","m":"FFAFFFFAFAFAFFFFFAFAFFAFAFFF"},{"t":"Compañía","f":"2026-06-06","n":"Fuego En Vivienda Con Atrapados","m":"FAFAFFFAFAAAFFAFAFFAFAAAFFAF"},{"t":"Compañía","f":"2026-06-10","n":"Academia Svb | Xabc","m":"FFAAFFFFFAAAFAFFAAAFFFFAFFAA"},{"t":"Comandancia","f":"2026-06-13","n":"Simulacro General Cbv","m":"FAFFFFFFFAFAFFFFFFFFFFFFFFFA"},{"t":"Compañía","f":"2026-06-17","n":"Academia Svb | Evaluacion Secundaria","m":"FAAAFFFFAFFAFFAFFFFAFFAAFAFF"},{"t":"Emergencia","f":"2026-06-18","n":"Olor Indeterminado En Jardin Infantil","m":"FFFFFFFFFFFAFFFFFAFFFFFFFAAF"}]};

const DEFAULT_TIPOS = ["Citación de Compañía","Instrucción","Ejercicio","Curso práctico","Capacitación","Sesión ordinaria","Otro"];
const DEFAULT_CARGOS = ["Director","Secretario","Tesorero","Tesorero General","Capitán","Teniente 1","Teniente 2","Teniente 3","Ayudante","Jefe de Máquinas","Conductor"];
const LEADER_KEYWORDS = ["director","secretari","tesorer","capit","teniente","ayudante","jefe de m","conductor"];

const ROSTER_KEY="roster:v8", TIPOS_KEY="tipos:v2", INDEX_KEY="partes:index:v1", CARGOS_KEY="cargos:v2";
/* La numeracion se corre: al retirarse un voluntario, los siguientes suben un lugar.
   El numero se recalcula por antiguedad sobre los integrantes activos. */
function renumerar(){
  const activos = ROSTER.filter(m=>m.activo!==false).slice().sort((a,b)=>{
    const fa=a.fechaIngreso||FOUNDING_DATE, fb=b.fechaIngreso||FOUNDING_DATE;
    if(fa!==fb) return fa<fb?-1:1;
    return (a.n||9999)-(b.n||9999);
  });
  activos.forEach((m,i)=>{ m.n = i+1; });
  ROSTER.filter(m=>m.activo===false).forEach(m=>{ m.n=null; });
}
async function renumerarYGuardar(){ renumerar(); await saveRoster(); }

let ROSTER=[], TIPOS=[], CARGOS=[], currentRecord={}, currentPartClave=null;

/* ============ UTILIDADES ============ */
function uid(){ return (window.crypto&&crypto.randomUUID)?crypto.randomUUID():'id-'+Math.random().toString(36).slice(2)+Date.now(); }
function todayISO(){ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function fmtDateLong(iso){ if(!iso) return ""; const [y,m,d]=iso.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long",year:"numeric"}); }
function slug(s){ return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"-").toLowerCase(); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function cargoPriority(c){
  c=(c||"").toLowerCase();
  if(c.includes("tesorer")) return c.includes("general")||c.includes("gral") ? 2.5 : 2;
  for(let i=0;i<LEADER_KEYWORDS.length;i++){ if(c.includes(LEADER_KEYWORDS[i])) return i; }
  return 99;
}
function cargoNumero(c){ const m=(c||"").match(/(\d+)/); return m?parseInt(m[1],10):9999; }

/* Acrónimo del cargo para identificar oficiales en la lista */
const ACRONIMOS=[["director","DIR"],["secretari","SEC"],["tesorer","TES"],["capit","CAP"],["ayudante","AYU"],["conductor","COND"]];
function acronimoCargo(p){
  const c=(p.cargo||"").toLowerCase();
  if(c.includes("tesorer")) return (c.includes("general")||c.includes("gral")) ? "TES GRAL" : "TES";
  if(c.includes("jefe de m")) return "JEFE MQ";
  if(c.includes("teniente")){
    const tenientes=ROSTER.filter(m=>(m.cargo||"").toLowerCase().includes("teniente"))
      .sort((a,b)=>cargoNumero(a.cargo)-cargoNumero(b.cargo));
    const i=tenientes.findIndex(m=>m.id===p.id);
    return i>=0 ? "TTE "+(i+1) : "TTE";
  }
  for(const [k,a] of ACRONIMOS){ if(c.includes(k)) return a; }
  return "";
}
function nombreCompleto(p){ return [p.nombre,p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(" "); }

/* Almacenamiento: navegador (localStorage) con respaldo en memoria.
   No se usa el almacenamiento del visor porque genera errores en algunos entornos. */
const MEM={};
let STORAGE_MODE="pendiente";
function lsAvailable(){
  try{ const k="__t"; window.localStorage.setItem(k,"1"); window.localStorage.removeItem(k); return true; }
  catch(e){ return false; }
}
async function sGet(k,f){
  try{
    const r=await fetch("/api/state/"+encodeURIComponent(k),{cache:"no-store"});
    if(r.ok){ const data=await r.json(); if(data.value!==null && data.value!==undefined){ MEM[k]=JSON.stringify(data.value); STORAGE_MODE="servidor"; return data.value; } }
  }catch(e){}
  if(lsAvailable()){
    try{ const v=window.localStorage.getItem(k); if(v!=null) return JSON.parse(v); }catch(e){}
  }
  if(Object.prototype.hasOwnProperty.call(MEM,k)){
    try{ return JSON.parse(MEM[k]); }catch(e){}
  }
  return f;
}
async function sSet(k,v){
  const s=JSON.stringify(v);
  MEM[k]=s;
  if(lsAvailable()){ try{ window.localStorage.setItem(k,s); }catch(e){} }
  try{
    const r=await fetch("/api/state/"+encodeURIComponent(k),{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({value:v})});
    if(r.ok){ STORAGE_MODE="servidor"; actualizarAvisoAlmacenamiento(); return true; }
  }catch(e){}
  STORAGE_MODE=lsAvailable()?"navegador":"memoria";
  actualizarAvisoAlmacenamiento();
  return true;
}
function actualizarAvisoAlmacenamiento(){
  const el=document.getElementById("storageWarn");
  if(!el) return;
  if(STORAGE_MODE==="memoria"){
    el.style.display="block";
    el.innerHTML = esIOS()
      ? 'Este iPhone o iPad no permite guardar datos cuando el archivo se abre desde el propio equipo. '+
        'Puedes usar la aplicación y generar documentos, pero <b>lo que registres se perderá al cerrarla</b>. '+
        'Para que los datos queden guardados, la aplicación debe estar publicada en internet.'
      : 'Vista previa: aquí los datos no se guardan al cerrar. Descarga el archivo y ábrelo en Chrome o Safari para que queden guardados.';
  } else {
    el.style.display="none";
  }
}

/* ============ CARGA ============ */
async function loadAll(){
  let r = await sGet(ROSTER_KEY,null);
  // Una base nueva, una respuesta vacía o un dato inválido nunca debe
  // dejar la aplicación sin nómina. En esos casos se inicializa desde
  // la nómina oficial incluida en la aplicación y se persiste en Neon.
  if(!Array.isArray(r) || r.length===0){
    r = SEED.map((s,i)=>({
      id:uid(), n:i+1, clave:s.clave, cargo:s.cargo,
      nombre:s.nombre, apellidoPaterno:s.ap, apellidoMaterno:s.am, rut:s.rut,
      fechaNacimiento:"", fechaIngreso:FOUNDING_DATE, categoria:"Operativo",
      formaIngreso:s.forma||"Ingreso directo", origen:s.origen||"", especialidad:"",
      telefono:s.tel||"", operativoRadio:!!s.op, conductor:!!s.conductor,
      activo:true, cursos:{}, anotaciones:[]
    })).concat(SEED_BAJAS.map(s=>({
      id:uid(), n:null, clave:s.clave, cargo:"Voluntario",
      nombre:s.nombre, apellidoPaterno:s.ap, apellidoMaterno:s.am, rut:s.rut,
      fechaNacimiento:"", fechaIngreso:FOUNDING_DATE, categoria:"Operativo",
      formaIngreso:"Ingreso directo", origen:"", especialidad:"",
      telefono:s.tel||"", operativoRadio:false,
      activo:false, motivoBaja:s.motivo, fechaBaja:"", obsBaja:"", cursos:{}, anotaciones:[]
    })));
    await sSet(ROSTER_KEY,r);
  }
  r.forEach(m=>{ if(!m.cursos) m.cursos={}; });
  ROSTER=r;
  TIPOS = await sGet(TIPOS_KEY,null) || DEFAULT_TIPOS.slice();
  CARGOS = await sGet(CARGOS_KEY,null) || DEFAULT_CARGOS.slice();
  SV_TIPOS = await sGet(SV_TIPOS_KEY,null) || DEFAULT_SV_TIPOS.slice();
  ORDEN_MODO = await sGet("orden:v1",null) || "oficialidad";
  renumerar();
}
async function saveRoster(){ await sSet(ROSTER_KEY,ROSTER); }
async function saveTipos(){ await sSet(TIPOS_KEY,TIPOS); }
async function saveCargos(){ await sSet(CARGOS_KEY,CARGOS); }

async function getIndex(){ return await sGet(INDEX_KEY,[]); }
async function getParte(c){ return await sGet("parte:"+c,null); }
async function setParte(c,d){
  const ok = await sSet("parte:"+c,d);
  if(ok){ const idx=await getIndex(); if(!idx.find(i=>i.clave===c)){ idx.push({clave:c,date:d.date,tipo:d.tipo}); await sSet(INDEX_KEY,idx); } }
  return ok;
}

let ORDEN_MODO = "oficialidad"; // "antiguedad" | "oficialidad"
function sortedRoster(incInactive){
  return ROSTER.filter(m=>incInactive||m.activo!==false).slice().sort((a,b)=>{
    if(ORDEN_MODO==="oficialidad"){
      const pa=cargoPriority(a.cargo), pb=cargoPriority(b.cargo);
      if(pa!==pb) return pa-pb;
      if(pa!==99){
        const na=cargoNumero(a.cargo), nb=cargoNumero(b.cargo);
        if(na!==nb) return na-nb;
      }
    }
    const fa=a.fechaIngreso||FOUNDING_DATE, fb=b.fechaIngreso||FOUNDING_DATE;
    if(fa!==fb) return fa<fb?-1:1;
    return (a.n||9999)-(b.n||9999);
  });
}

/* ============ PASAR LISTA ============ */
function renderTipoSelect(){
  document.getElementById("tipoSelect").innerHTML = TIPOS.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join("");
}
function renderRegistradoPorOptions(){
  document.getElementById("registradoPorOptions").innerHTML =
    sortedRoster(false).map(p=>`<option value="${esc(nombreCompleto(p))}"></option>`).join("");
}
let parteBloqueado=false;
function renderListaRows(){
  const body=document.getElementById("listaBody"); body.innerHTML="";
  sortedRoster(false).forEach(p=>{
    const st=currentRecord[p.id]||"ausente";
    const ac=acronimoCargo(p);
    const tr=document.createElement("tr");
    tr.innerHTML=`<td class="n-col">${p.n||""}</td>
      <td class="cargo-col">${esc(p.cargo)}</td>
      <td class="name-col">${p.clave?`<span class="clv">${esc(p.clave)}</span> `:""}${ac?`<span class="ac">${esc(ac)}</span> `:""}${p.conductor?`<span class="cnd">COND</span> `:""}${esc(nombreCompleto(p))}</td>
      <td><div class="seg" data-id="${p.id}">
        <button class="on-presente ${st==='presente'?'active':''}" data-status="presente" ${parteBloqueado?"disabled":""}>Presente</button>
        <button class="on-ausente ${st==='ausente'?'active':''}" data-status="ausente" ${parteBloqueado?"disabled":""}>Ausente</button>
        <button class="on-justificado ${st==='justificado'?'active':''}" data-status="justificado" ${parteBloqueado?"disabled":""}>Justificado</button>
      </div></td>`;
    body.appendChild(tr);
  });
  if(!parteBloqueado) body.querySelectorAll(".seg button").forEach(b=>b.addEventListener("click",()=>{
    const seg=b.parentElement; currentRecord[seg.dataset.id]=b.dataset.status;
    seg.querySelectorAll("button").forEach(x=>x.classList.remove("active")); b.classList.add("active");
  }));
  const gb=document.getElementById("guardarBtn"), mt=document.getElementById("marcarTodosBtn");
  if(gb) gb.disabled=parteBloqueado; if(mt) mt.disabled=parteBloqueado;
  renderCandadoParte();
}
function renderCandadoParte(){
  let box=document.getElementById("candadoParte");
  if(!box){
    box=document.createElement("div"); box.id="candadoParte";
    const ref=document.getElementById("listaBody")?.closest("table");
    if(ref) ref.parentElement.insertBefore(box,ref);
  }
  if(!parteBloqueado){ box.innerHTML=""; box.style.display="none"; return; }
  box.style.display="block";
  box.style.cssText="padding:12px;margin-bottom:10px;background:#101216;border:1px solid #3a3d44;border-radius:7px;";
  box.innerHTML=`<b>Este parte ya fue guardado y no se puede modificar.</b>
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <input id="claveDesbloqueoParte" type="password" placeholder="Clave de Oficialidad" style="flex:1;min-width:160px;padding:9px;background:#0d0e11;border:1px solid #3a3d44;border-radius:6px;color:#fff;">
      <button id="desbloquearParteBtn" class="btn small">Desbloquear para editar</button>
    </div>
    <div id="candadoParteMsg" style="margin-top:6px;font-size:12.5px;"></div>`;
  document.getElementById("desbloquearParteBtn").onclick=async()=>{
    const inp=document.getElementById("claveDesbloqueoParte"), m=document.getElementById("candadoParteMsg");
    const res=await autenticarOficialidad(inp.value.trim());
    if(res.ok){ parteBloqueado=false; renderListaRows(); }
    else { m.textContent=mensajeOficialidad(res.motivo); m.classList.add("err"); }
  };
}
function claveFor(d,t){ return d+"__"+slug(t); }
/* Varias actividades del mismo dia y tipo no deben pisarse: se busca una clave libre */
async function claveNueva(d,t){
  const base=claveFor(d,t);
  if(!(await getParte(base))) return base;
  for(let i=2;i<200;i++){
    const k=base+"--"+i;
    if(!(await getParte(k))) return k;
  }
  return base+"--"+Date.now();
}

async function loadListaForSelection(){
  const d=document.getElementById("fecha").value, t=document.getElementById("tipoSelect").value;
  if(!d||!t) return;
  currentPartClave=claveFor(d,t);
  const ex=await getParte(currentPartClave);
  const msg=document.getElementById("statusMsg");
  currentRecord={};
  document.getElementById("resumenBox").style.display="none";
  if(ex&&ex.records){
    currentRecord={...ex.records};
    document.getElementById("detalle").value=ex.detalle||"";
    document.getElementById("registradoPor").value=ex.registradoPor||"";
    msg.textContent="Ya existe un parte guardado para esta fecha y tipo.";
    parteBloqueado=true;
  } else {
    sortedRoster(false).forEach(p=>currentRecord[p.id]="ausente");
    document.getElementById("detalle").value="";
    document.getElementById("registradoPor").value="";
    msg.textContent="";
    parteBloqueado=false;
  }
  msg.classList.remove("err");
  renderListaRows();
}
on("fecha","change",loadListaForSelection);
on("tipoSelect","change",loadListaForSelection);
on("marcarTodosBtn","click",()=>{
  sortedRoster(false).forEach(p=>currentRecord[p.id]="presente"); renderListaRows();
});

function countStatuses(rec){
  const c={presente:0,justificado:0,ausente:0};
  sortedRoster(false).forEach(p=>{ const s=(rec&&rec[p.id])||"ausente"; c[s]=(c[s]||0)+1; });
  return c;
}
function renderResumen(c){
  const total=c.presente+c.justificado+c.ausente;
  document.getElementById("resumenRow").innerHTML=`
    <div class="summary-item"><div class="big">${c.presente}</div><div class="lbl">Presentes</div></div>
    <div class="summary-item"><div class="big">${c.justificado}</div><div class="lbl">Justificados</div></div>
    <div class="summary-item"><div class="big">${c.ausente}</div><div class="lbl">Ausentes</div></div>
    <div class="summary-item"><div class="big">${total?Math.round(c.presente/total*100):0}%</div><div class="lbl">Asistencia</div></div>`;
  document.getElementById("resumenBox").style.display="block";
}

on("guardarBtn","click",()=>{
  if(parteBloqueado) return;
  const date=document.getElementById("fecha").value, tipo=document.getElementById("tipoSelect").value;
  const msg=document.getElementById("statusMsg");
  if(!date||!tipo){ msg.textContent="Selecciona fecha y tipo de citación."; msg.classList.add("err"); return; }
  mostrarConfirmarParte(date,tipo);
});
function mostrarConfirmarParte(date,tipo){
  const c=countStatuses(currentRecord);
  const msg=document.getElementById("statusMsg");
  msg.classList.remove("err");
  msg.innerHTML=`<div style="padding:12px;background:#101216;border:1px solid #3a3d44;border-radius:7px;">
      <b>Revisa antes de guardar:</b> ${c.presente} presentes · ${c.justificado} justificados · ${c.ausente} ausentes.<br/>
      <small>Una vez guardado, este parte no podrá modificarse sin la clave de Oficialidad. ¿Está correcto o quiere revisar de nuevo?</small>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
        <button id="confirmarGuardarBtn" class="btn small">Sí, está correcto — Guardar</button>
        <button id="revisarDeNuevoBtn" class="btn small secondary">Revisar de nuevo</button>
      </div></div>`;
  document.getElementById("revisarDeNuevoBtn").onclick=()=>{ msg.innerHTML=""; };
  document.getElementById("confirmarGuardarBtn").onclick=async()=>{
    const data={date,tipo,detalle:document.getElementById("detalle").value.trim(),registradoPor:document.getElementById("registradoPor").value.trim(),records:currentRecord};
    currentPartClave=claveFor(date,tipo);
    const ok=await setParte(currentPartClave,data);
    if(!ok){ msg.textContent="No se pudo guardar."; msg.classList.add("err"); return; }
    parteBloqueado=true;
    msg.textContent="Parte guardado. Ya no se puede modificar sin la clave de Oficialidad.";
    renderResumen(countStatuses(currentRecord));
    renderListaRows();
  };
}

/* ============ PDF ============ */
function pdfHeader(doc,titulo){
  try{ doc.addImage(LOGO_B64,"PNG",14,10,17,19); }catch(e){}
  doc.setFont("helvetica","bold"); doc.setFontSize(14);
  doc.text(titulo,35,18);
  doc.setFont("helvetica","normal"); doc.setFontSize(10);
  doc.text('Quinta Compañía de Bomberos "Germania" de Villarrica',35,24);
  doc.setFontSize(8);
  doc.text("Fundada como Brigada el 21 de junio de 2023 · Compañía desde el 5 de noviembre de 2025",35,28.5);
  doc.setFontSize(10);
}
function buildParteDoc(date,tipo,detalle,records,registradoPor){
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  pdfHeader(doc,"PARTE DE ASISTENCIA");
  doc.text(`Fecha: ${fmtDateLong(date)}`,14,36);
  doc.text(`Tipo de citación: ${tipo}`,14,42);
  let y=48;
  if(detalle){ doc.text(`Detalle: ${detalle}`,14,y); y+=6; }
  if(registradoPor){ doc.text(`Pasó lista: ${registradoPor}`,14,y); y+=6; }
  const rows=sortedRoster(false)
    .filter(p=>(records[p.id]||"ausente")!=="ausente")
    .map(p=>{
      const s=records[p.id];
      return [p.n||"",p.clave||"—",p.cargo,nombreCompleto(p),s.charAt(0).toUpperCase()+s.slice(1)];
    });
  doc.autoTable({head:[["N°","Clave","Cargo","Nombre","Asistencia"]],body:rows,startY:y,styles:{fontSize:9},headStyles:{fillColor:[179,36,28]}});
  const c=countStatuses(records), fy=doc.lastAutoTable.finalY+10;
  doc.setFont("helvetica","bold");
  doc.text(`Presentes: ${c.presente}   Justificados: ${c.justificado}   Ausentes: ${c.ausente}`,14,fy);
  doc.setFont("helvetica","normal"); doc.setFontSize(9);
  doc.text(`Generado el ${new Date().toLocaleString("es-CL")}`,14,fy+10);
  return doc;
}
/* Entrega de archivos compatible con iPhone.
   En iOS, al abrir el archivo desde el propio equipo, Safari bloquea la descarga
   directa y el panel de compartir. Por eso se ofrece siempre un enlace visible
   que el usuario pueda tocar. */
function esIOS(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
}
const CORREO_COMPANIA="germaniacbv@gmail.com";
function mostrarEnlaceArchivo(url,nombre,rotulo,texto){
  let caja=document.getElementById("cajaArchivo");
  if(!caja){
    caja=document.createElement("div");
    caja.id="cajaArchivo";
    caja.style.cssText="position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;"+
      "background:#2a221b;border:1px solid #c9a227;border-radius:10px;padding:14px 16px;"+
      "box-shadow:0 6px 24px rgba(0,0,0,.5);font-family:inherit;";
    document.body.appendChild(caja);
  }
  const asunto=encodeURIComponent((texto||nombre)+' · Quinta Compañía "Germania"');
  const cuerpo=encodeURIComponent(
    (texto||nombre)+"\n\nSe adjunta el documento generado por la aplicación de la Compañía.\n\n"+
    'Quinta Compañía "Germania" · Cuerpo de Bomberos de Villarrica');
  const wa=encodeURIComponent((texto||nombre)+' · Quinta Compañía "Germania"');
  caja.innerHTML=`
    <div style="font-size:13px;color:#a89584;margin-bottom:10px;">${esc(rotulo||"Documento listo")}</div>
    <div style="display:flex;gap:9px;flex-wrap:wrap;align-items:center;">
      <a href="${url}" target="_blank" rel="noopener"
         style="background:#c9a227;color:#241c08;text-decoration:none;font-weight:700;
                padding:10px 16px;border-radius:6px;font-size:14px;">Ver documento</a>
      <a href="${url}" download="${esc(nombre)}"
         style="background:#3a2f26;color:#f1ebe0;text-decoration:none;font-weight:700;
                padding:10px 16px;border-radius:6px;font-size:14px;">Descargar</a>
      <a href="https://wa.me/?text=${wa}" target="_blank" rel="noopener"
         style="background:#2f6f45;color:#eafaf0;text-decoration:none;font-weight:700;
                padding:10px 16px;border-radius:6px;font-size:14px;">WhatsApp</a>
      <a href="mailto:${CORREO_COMPANIA}?subject=${asunto}&body=${cuerpo}"
         style="background:#2a221b;border:1px solid #3a2f26;color:#f1ebe0;text-decoration:none;
                padding:10px 16px;border-radius:6px;font-size:14px;">Correo</a>
      <button id="cerrarArchivo" style="background:none;border:1px solid #3a2f26;color:#a89584;
              padding:9px 14px;border-radius:6px;font-size:13px;cursor:pointer;">Cerrar</button>
    </div>
    <div style="font-size:11.5px;color:#a89584;margin-top:10px;opacity:.85;line-height:1.5;">
      Toca <b>Ver documento</b> primero para revisar que esté correcto. Si está bien, toca
      <b>Descargar</b> para guardarlo, y luego en WhatsApp o en el correo a ${CORREO_COMPANIA},
      adjunta el archivo descargado a quien corresponda.
    </div>`;
  caja.querySelector("#cerrarArchivo").onclick=()=>caja.remove();
}

async function entregarArchivo(blob,nombre,texto,rotulo){
  const file=new File([blob],nombre,{type:blob.type});
  if(navigator.canShare && navigator.canShare({files:[file]})){
    try{ await navigator.share({files:[file],title:nombre,text:texto||nombre}); return true; }
    catch(e){ if(e && e.name==="AbortError") return true; }
  }
  const url=URL.createObjectURL(blob);
  mostrarEnlaceArchivo(url,nombre,rotulo,texto);
  setTimeout(()=>URL.revokeObjectURL(url),300000);
  return false;
}

/* Membrete al pie de cada página, igual que en pantalla */
function sellarPdf(doc){
  const total=doc.internal.getNumberOfPages();
  const ancho=doc.internal.pageSize.getWidth();
  const alto=doc.internal.pageSize.getHeight();
  for(let i=1;i<=total;i++){
    doc.setPage(i);
    doc.setDrawColor(200,190,175); doc.setLineWidth(0.3);
    doc.line(14, alto-16, ancho-14, alto-16);
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(120,110,100);
    doc.text('Desarrollado por la 5ta Compañía "Germania" · Cuerpo de Bomberos de Villarrica · Chile', ancho/2, alto-11, {align:"center"});
    doc.setFont("helvetica","normal"); doc.setFontSize(7);
    doc.text(`Página ${i} de ${total}`, ancho-14, alto-11, {align:"right"});
    doc.setTextColor(0,0,0);
  }
  return doc;
}

async function sharePdfDoc(doc,filename,shareText){
  sellarPdf(doc);
  const blob=doc.output("blob");
  return await entregarArchivo(blob,filename,shareText,"Documento PDF generado");
}
on("pdfBtn","click",async()=>{
  const d=document.getElementById("fecha").value,t=document.getElementById("tipoSelect").value;
  await sharePdfDoc(buildParteDoc(d,t,document.getElementById("detalle").value.trim(),currentRecord,document.getElementById("registradoPor").value.trim()),`parte_${d}_${slug(t)}.pdf`);
});
on("waBtn","click",async()=>{
  const d=document.getElementById("fecha").value,t=document.getElementById("tipoSelect").value;
  const rp=document.getElementById("registradoPor").value.trim(), c=countStatuses(currentRecord);
  const text=`Parte de asistencia - Quinta Compañía "Germania"\n${t} - ${fmtDateLong(d)}${rp?"\nPasó lista: "+rp:""}\nPresentes: ${c.presente} · Justificados: ${c.justificado} · Ausentes: ${c.ausente}`;
  const shared=await sharePdfDoc(buildParteDoc(d,t,document.getElementById("detalle").value.trim(),currentRecord,rp),`parte_${d}_${slug(t)}.pdf`,text);
  if(!shared) window.open("https://wa.me/?text="+encodeURIComponent(text+"\n(PDF adjunto por separado)"),"_blank");
});

/* ============ HOJA DE SERVICIO B-5 ============ */
const SV_CAMPOS=["svFecha","svTipoAct","svHoraSalida","svHoraLlegada","svHoraControl","svKmSalida","svKmLlegada",
 "svHorometro","svCalle","svNumeracion","svSector","svUnidadCargo","svConductor","svCuerpoCargo","svPuestoMando",
 "svCargoQuinta","svOfContabilidad","svOfSeguridad","svLugarInicio","svNaturaleza","svDetNaturaleza","svOrigen",
 "svDetOrigen","svCausas","svDetCausa","svTipoInmueble","svConstruccion","svNiveles","svObservaciones",
 "svPersonas","svMaterial","svApoyo",
 "svCombConductor","svCombKm","svCombFecha","svCombServicentro","svCombRut","svCombLitros","svCombValor"];
const SV_TIPOS_KEY="svTipos:v1";
const DEFAULT_SV_TIPOS=["Acto de servicio","Carga de combustible","Ejercicio con material","Emergencia","Mantención","Traslado","Otro"];
let SV_TIPOS=[];
function ordenarTipos(lista){
  const sinOtro=lista.filter(t=>t!=="Otro").sort((a,b)=>a.localeCompare(b,"es"));
  return lista.includes("Otro")?[...sinOtro,"Otro"]:sinOtro;
}
function renderSvTipoOptions(seleccionado){
  const sel=document.getElementById("svTipoAct");
  const actual=seleccionado||sel.value;
  sel.innerHTML=ordenarTipos(SV_TIPOS).map(t=>`<option${t===actual?" selected":""}>${esc(t)}</option>`).join("");
}
on("svTipoActAgregarBtn","click",async()=>{
  const inp=document.getElementById("svTipoActNuevo");
  const v=inp.value.trim();
  if(!v||SV_TIPOS.includes(v)) { inp.value=""; return; }
  SV_TIPOS.push(v);
  await sSet(SV_TIPOS_KEY,SV_TIPOS);
  renderSvTipoOptions(v);
  inp.value="";
  actualizarFichaCombustible();
});
let svConcurrencia={};   // id -> "si" | "no"
let svBloqueado=false;

function svClave(){
  const f=document.getElementById("svFecha").value;
  const h=document.getElementById("svHoraSalida").value||"sin-hora";
  return "servicio:"+f+"__"+h.replace(":","");
}
function renderSvBody(){
  const body=document.getElementById("svBody"); body.innerHTML="";
  sortedRoster(false).forEach(p=>{
    const st=svConcurrencia[p.id]||"no";
    const ac=acronimoCargo(p);
    const tr=document.createElement("tr");
    tr.innerHTML=`<td class="n-col">${p.n||""}</td>
      <td class="name-col">${ac?`<span class="ac">${esc(ac)}</span> `:""}${esc(nombreCompleto(p))}</td>
      <td><div class="seg" data-id="${p.id}">
        <button class="on-presente ${st==='si'?'active':''}" data-st="si" ${svBloqueado?"disabled":""}>Concurre</button>
        <button class="on-ausente ${st==='no'?'active':''}" data-st="no" ${svBloqueado?"disabled":""}>No concurre</button>
      </div></td>`;
    body.appendChild(tr);
  });
  if(!svBloqueado) body.querySelectorAll(".seg button").forEach(b=>b.addEventListener("click",()=>{
    const seg=b.parentElement;
    svConcurrencia[seg.dataset.id]=b.dataset.st;
    seg.querySelectorAll("button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    renderSvResumen();
  }));
  const gb=document.getElementById("svGuardarBtn"), lb=document.getElementById("svLimpiarBtn");
  if(gb) gb.disabled=svBloqueado; if(lb) lb.disabled=svBloqueado;
  renderSvResumen();
  renderCandadoSv();
}
function renderCandadoSv(){
  let box=document.getElementById("candadoSv");
  if(!box){
    box=document.createElement("div"); box.id="candadoSv";
    const ref=document.getElementById("svBody")?.closest("table");
    if(ref) ref.parentElement.insertBefore(box,ref);
  }
  if(!svBloqueado){ box.innerHTML=""; box.style.display="none"; return; }
  box.style.display="block";
  box.style.cssText="padding:12px;margin-bottom:10px;background:#101216;border:1px solid #3a3d44;border-radius:7px;";
  box.innerHTML=`<b>Esta hoja de servicio ya fue guardada y no se puede modificar.</b>
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <input id="claveDesbloqueoSv" type="password" placeholder="Clave de Oficialidad" style="flex:1;min-width:160px;padding:9px;background:#0d0e11;border:1px solid #3a3d44;border-radius:6px;color:#fff;">
      <button id="desbloquearSvBtn" class="btn small">Desbloquear para editar</button>
    </div>
    <div id="candadoSvMsg" style="margin-top:6px;font-size:12.5px;"></div>`;
  document.getElementById("desbloquearSvBtn").onclick=async()=>{
    const inp=document.getElementById("claveDesbloqueoSv"), m=document.getElementById("candadoSvMsg");
    const res=await autenticarOficialidad(inp.value.trim());
    if(res.ok){ svBloqueado=false; renderSvBody(); }
    else { m.textContent=mensajeOficialidad(res.motivo); m.classList.add("err"); }
  };
}
function svConteo(){
  let concurrentes=0,no=0;
  sortedRoster(false).forEach(p=>{
    const s=svConcurrencia[p.id]||"no";
    if(s==="si") concurrentes++; else no++;
  });
  return {no,concurrentes};
}
function renderSvResumen(){
  const c=svConteo();
  document.getElementById("svResumen").innerHTML=`
    <div class="summary-item"><div class="big">${c.concurrentes}</div><div class="lbl">Total concurrentes</div></div>
    <div class="summary-item"><div class="big">${c.no}</div><div class="lbl">No concurrió</div></div>`;
}
on("svLimpiarBtn","click",()=>{
  sortedRoster(false).forEach(p=>svConcurrencia[p.id]="no");
  renderSvBody();
});

function svDatos(){
  const d={};
  SV_CAMPOS.forEach(id=>d[id]=document.getElementById(id).value);
  d.concurrencia={...svConcurrencia};
  return d;
}
async function cargarServicio(){
  const clave=svClave();
  const ex=await sGet(clave,null);
  svConcurrencia={};
  const msg=document.getElementById("svMsg");
  if(ex){
    SV_CAMPOS.forEach(id=>{ if(id!=="svFecha"&&ex[id]!==undefined) document.getElementById(id).value=ex[id]; });
    svConcurrencia={...(ex.concurrencia||{})};
    document.getElementById("svRegistrarAsistencia").checked = ex.registrarAsistencia!==false;
    msg.textContent="Ya existe una hoja de servicio guardada para esta fecha y hora de salida.";
    msg.classList.remove("err");
    svBloqueado=true;
  } else {
    svBloqueado=false;
  }
  sortedRoster(false).forEach(p=>{ if(!svConcurrencia[p.id]) svConcurrencia[p.id]="no"; });
  renderSvTipoOptions();
  actualizarFichaCombustible();
  renderSvBody();
}
on("svFecha","change",cargarServicio);
on("svHoraSalida","change",cargarServicio);
function actualizarFichaCombustible(){
  const t=document.getElementById("svTipoAct").value;
  const ficha=document.getElementById("svFichaCombustible");
  const esCombustible=t==="Carga de combustible";
  ficha.style.display=esCombustible?"flex":"none";
  if(esCombustible && !document.getElementById("svCombFecha").value){
    document.getElementById("svCombFecha").value=document.getElementById("svFecha").value;
  }
}
on("svTipoAct","change",()=>{
  const t=document.getElementById("svTipoAct").value;
  document.getElementById("svRegistrarAsistencia").checked = (t==="Emergencia"||t==="Acto de servicio");
  actualizarFichaCombustible();
});

on("svGuardarBtn","click",()=>{
  if(svBloqueado) return;
  const msg=document.getElementById("svMsg");
  const fecha=document.getElementById("svFecha").value;
  if(!fecha){ msg.textContent="Indica la fecha del servicio."; msg.classList.add("err"); return; }
  mostrarConfirmarSv();
});
function mostrarConfirmarSv(){
  const msg=document.getElementById("svMsg"), c=svConteo();
  msg.classList.remove("err");
  msg.innerHTML=`<div style="padding:12px;background:#101216;border:1px solid #3a3d44;border-radius:7px;">
      <b>Revisa antes de guardar:</b> ${c.concurrentes} concurrentes · ${c.no} no concurrió.<br/>
      <small>Una vez guardada, esta hoja no podrá modificarse sin la clave de Oficialidad. ¿Está correcto o quiere revisar de nuevo?</small>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
        <button id="confirmarGuardarSvBtn" class="btn small">Sí, está correcto — Guardar</button>
        <button id="revisarDeNuevoSvBtn" class="btn small secondary">Revisar de nuevo</button>
      </div></div>`;
  document.getElementById("revisarDeNuevoSvBtn").onclick=()=>{ msg.innerHTML=""; };
  document.getElementById("confirmarGuardarSvBtn").onclick=async()=>{
    const fecha=document.getElementById("svFecha").value;
    const datos=svDatos();
    datos.registrarAsistencia=document.getElementById("svRegistrarAsistencia").checked;
    await sSet(svClave(),datos);

    if(!datos.registrarAsistencia){
      svBloqueado=true; renderSvBody();
      msg.classList.remove("err");
      msg.textContent=`Hoja de servicio guardada. No se registró asistencia (${c.concurrentes} concurrentes anotados solo en la hoja).`;
      return;
    }

    // Se registra ademas como citacion, para que cuente en el Control de asistencia
    const tipo=document.getElementById("svTipoAct").value+" B-5";
    if(!TIPOS.includes(tipo)){ TIPOS.push(tipo); await saveTipos(); renderTipoSelect(); populateTipoFilters(); }
    const records={};
    sortedRoster(true).forEach(p=>{
      const s=svConcurrencia[p.id]||"no";
      records[p.id] = (s==="no") ? "ausente" : "presente";
    });
    const detalle=[document.getElementById("svCalle").value,document.getElementById("svNumeracion").value,
                   document.getElementById("svSector").value].filter(Boolean).join(" ");
    const detFinal=detalle||document.getElementById("svNaturaleza").value;
    const hs=(document.getElementById("svHoraSalida").value||"s-h").replace(":","");
    const claveSv=claveFor(fecha,tipo)+"__"+hs;
    await setParte(claveSv,{
      date:fecha, tipo, detalle:detFinal,
      registradoPor:document.getElementById("svCargoQuinta").value, records,
      modoConcurrencia:{...svConcurrencia}
    });
    svBloqueado=true; renderSvBody();
    msg.classList.remove("err");
    msg.textContent=`Hoja de servicio guardada. ${c.concurrentes} voluntarios concurrieron.`;
  };
}

function buildServicioPdf(){
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  const g=id=>document.getElementById(id).value||"—";
  pdfHeader(doc,"HOJA DE SERVICIO · UNIDAD B-5");
  let y=36;
  doc.setFontSize(10);
  doc.text(`Fecha: ${g("svFecha")}    Tipo: ${g("svTipoAct")}`,14,y); y+=2;

  doc.autoTable({startY:y+2,styles:{fontSize:8},headStyles:{fillColor:[179,36,28]},
    head:[["Hora salida","Hora llegada","Hora control","Km salida","Km llegada","Horómetro"]],
    body:[[g("svHoraSalida"),g("svHoraLlegada"),g("svHoraControl"),g("svKmSalida"),g("svKmLlegada"),g("svHorometro")]]});

  doc.autoTable({startY:doc.lastAutoTable.finalY+4,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
    head:[["Lugar del servicio",""]],
    body:[["Calle",g("svCalle")],["Numeración",g("svNumeracion")],["Sector",g("svSector")]]});

  doc.autoTable({startY:doc.lastAutoTable.finalY+4,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
    head:[["Mando",""]],
    body:[["Unidad a cargo",g("svUnidadCargo")],["Conductor",g("svConductor")],
          ["Cuerpo a cargo",g("svCuerpoCargo")],["Puesto de mando",g("svPuestoMando")],
          ["A cargo Quinta",g("svCargoQuinta")],["Oficial de contabilidad",g("svOfContabilidad")],
          ["Oficial de seguridad",g("svOfSeguridad")]]});

  doc.autoTable({startY:doc.lastAutoTable.finalY+4,styles:{fontSize:8},headStyles:{fillColor:[179,36,28]},
    head:[["Datos de la emergencia",""]],
    body:[["Lugar de inicio",g("svLugarInicio")],["Naturaleza",g("svNaturaleza")],["Detalles naturaleza",g("svDetNaturaleza")],
          ["Origen",g("svOrigen")],["Detalles origen",g("svDetOrigen")],["Causas",g("svCausas")],["Detalles causa",g("svDetCausa")],
          ["Tipo de inmueble",g("svTipoInmueble")],["Tipo de construcción",g("svConstruccion")],["N° niveles",g("svNiveles")]]});

  doc.addPage();
  const c=svConteo();
  doc.setFont("helvetica","bold"); doc.setFontSize(12);
  doc.text("CONCURRENCIA DE VOLUNTARIOS",14,20);
  doc.setFont("helvetica","normal"); doc.setFontSize(10);
  doc.text(`Total concurrentes: ${c.concurrentes}   ·   No concurrió: ${c.no}`,14,27);

  const rows=sortedRoster(false)
    .filter(p=>svConcurrencia[p.id]==="si")
    .map(p=>[p.n||"",acronimoCargo(p)||"—",nombreCompleto(p),"Concurre"]);
  doc.autoTable({head:[["N°","Cargo","Nombre","Concurrencia"]],body:rows,startY:32,styles:{fontSize:9},headStyles:{fillColor:[179,36,28]}});

  doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
    head:[["Observaciones",""]],
    body:[["Relato del servicio",g("svObservaciones")],["Personas involucradas",g("svPersonas")],
          ["Material menor utilizado",g("svMaterial")],["Unidades de apoyo",g("svApoyo")]]});

  if(document.getElementById("svTipoAct").value==="Carga de combustible"){
    doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
      head:[["Ficha de carga de combustible",""]],
      body:[["Conductor",g("svCombConductor")],["Kilometraje actual",g("svCombKm")],
            ["Fecha",g("svCombFecha")],["Servicentro",g("svCombServicentro")],
            ["RUT del servicentro",g("svCombRut")],["Cantidad cargada (L)",g("svCombLitros")],
            ["Valor del petróleo ($)",g("svCombValor")]]});
  }

  let fy=doc.lastAutoTable.finalY+20;
  if(fy>250){ doc.addPage(); fy=40; }
  doc.setFontSize(9);
  doc.line(20,fy,85,fy); doc.text("Conductor",20,fy+5);
  doc.line(115,fy,180,fy); doc.text("Oficial a cargo",115,fy+5);
  doc.text(`Generado el ${new Date().toLocaleString("es-CL")}`,14,fy+18);
  return doc;
}
on("svPdfBtn","click",async()=>{
  await sharePdfDoc(buildServicioPdf(),`hoja_servicio_b5_${document.getElementById("svFecha").value||todayISO()}.pdf`);
});
on("svWaBtn","click",async()=>{
  const c=svConteo(), g=id=>document.getElementById(id).value||"";
  const texto=`HOJA DE SERVICIO B-5 · Quinta Compañía "Germania"\n${g("svTipoAct")} · ${g("svFecha")} ${g("svHoraSalida")}\nLugar: ${[g("svCalle"),g("svNumeracion"),g("svSector")].filter(Boolean).join(" ")}\nNaturaleza: ${g("svNaturaleza")}\n\nConcurrieron ${c.concurrentes} voluntarios.`;
  const shared=await sharePdfDoc(buildServicioPdf(),`hoja_servicio_b5_${g("svFecha")||todayISO()}.pdf`,texto);
  if(!shared) window.open("https://wa.me/?text="+encodeURIComponent(texto),"_blank");
});

/* ============ GUARDIA NOCTURNA ============ */
const GUARDIA_IDX="guardias:index";

async function idxGuardias(){ return await sGet(GUARDIA_IDX,[]); }
async function getGuardia(c){ return await sGet("guardia:"+c,null); }
async function setGuardia(c,d){
  await sSet("guardia:"+c,d);
  const idx=await idxGuardias();
  if(!idx.find(i=>i.clave===c)){ idx.push({clave:c,fecha:d.fechaIng}); await sSet(GUARDIA_IDX,idx); }
}
function claveGuardia(f,h){ return f+"__"+(h||"").replace(":",""); }

function renderGnOficial(){
  const sel=document.getElementById("gnOficial"); if(!sel) return;
  const prev=sel.value;
  sel.innerHTML='<option value="">— seleccionar —</option>'+
    sortedRoster(false).map(p=>{
      const a=acronimoCargo(p);
      return `<option value="${p.id}">${a?"["+esc(a)+"] ":""}${esc(nombreCompleto(p))}</option>`;
    }).join("");
  if(prev) sel.value=prev;
}
const GN_ESTADOS=[
  ["cuartel","Presente en el cuartel"],
  ["casa","Desde su casa, acude al llamado"],
  ["no","No asiste"]
];
const GN_MOTIVOS=["Enfermedad","Licencia médica","Viaje","Otra actividad","Trabajo","Otro"];

/* Guardianes del turno, en memoria mientras se edita la ficha */
let gnTurno=[];   // {id, estado, motivo, correo, obs, reemplazo}

function normalizaTurno(lista){
  return (lista||[]).map(x=> typeof x==="string"
    ? {id:x, estado:"cuartel", motivo:"", correo:false, obs:"", reemplazo:""}
    : {id:x.id, estado:x.estado||"cuartel", motivo:x.motivo||"", correo:!!x.correo,
       obs:x.obs||"", reemplazo:x.reemplazo||""});
}
function opcionesVoluntarios(excluir,vacio){
  const ex=new Set(excluir||[]);
  return `<option value="">${vacio||"— sin asignar —"}</option>`+
    sortedRoster(false).filter(p=>!ex.has(p.id))
      .map(p=>`<option value="${p.id}">${p.clave?"("+esc(p.clave)+") ":""}${esc(nombreCompleto(p))}</option>`).join("");
}
function renderGnAgregar(){
  const sel=document.getElementById("gnAgregar"); if(!sel) return;
  sel.innerHTML=opcionesVoluntarios(gnTurno.map(g=>g.id),"— seleccionar voluntario —");
}
function renderGnGuardianes(lista){
  if(lista!==undefined) gnTurno=normalizaTurno(lista);
  const box=document.getElementById("gnGuardianes"); if(!box) return;
  if(!gnTurno.length){
    box.innerHTML='<div class="empty">Aún no se han agregado guardianes a esta guardia.</div>';
    renderGnAgregar(); contarGuardianes(); return;
  }
  box.innerHTML=gnTurno.map((g,i)=>{
    const m=ROSTER.find(x=>x.id===g.id);
    const noAsiste = g.estado==="no";
    return `<div class="card" style="padding:13px 14px;margin-bottom:10px;background:var(--panel-2);">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:9px;">
        <div class="name-col" style="font-size:14px;">
          ${m&&m.clave?`<span class="clv">${esc(m.clave)}</span> `:""}${esc(m?nombreCompleto(m):"—")}
        </div>
        <button class="del-btn" data-quitar="${i}" title="Quitar de la guardia">🗑</button>
      </div>
      <div class="field-row" style="margin-bottom:${noAsiste?"10px":"0"};">
        <div class="field" style="flex:1 1 200px;">
          <label>Situación</label>
          <select data-campo="estado" data-i="${i}">
            ${GN_ESTADOS.map(([v,t])=>`<option value="${v}" ${g.estado===v?"selected":""}>${t}</option>`).join("")}
          </select>
        </div>
      </div>
      ${noAsiste?`
      <div class="field-row" style="margin-bottom:10px;">
        <div class="field" style="flex:1 1 170px;">
          <label>Motivo de la inasistencia</label>
          <select data-campo="motivo" data-i="${i}">
            <option value="">— indicar —</option>
            ${GN_MOTIVOS.map(v=>`<option value="${v}" ${g.motivo===v?"selected":""}>${v}</option>`).join("")}
          </select>
        </div>
        <div class="field" style="flex:1 1 200px;">
          <label>Reemplazado por</label>
          <select data-campo="reemplazo" data-i="${i}">${opcionesVoluntarios(gnTurno.map(x=>x.id),"— sin reemplazo —")}</select>
        </div>
      </div>
      <div class="field-row" style="margin-bottom:0;">
        <div class="field" style="flex:1 1 100%;">
          <label>Observación</label>
          <input type="text" data-campo="obs" data-i="${i}" value="${esc(g.obs)}" placeholder="Detalle de la justificación">
        </div>
      </div>
      <label style="display:flex;align-items:center;gap:9px;margin-top:9px;font-size:13px;cursor:pointer;">
        <input type="checkbox" data-campo="correo" data-i="${i}" ${g.correo?"checked":""}
               style="width:17px;height:17px;accent-color:var(--ok);">
        Justificó por correo a la Compañía
      </label>`:""}
    </div>`;
  }).join("");

  box.querySelectorAll("[data-campo]").forEach(el=>{
    el.addEventListener("change",()=>{
      const i=+el.dataset.i, c=el.dataset.campo;
      gnTurno[i][c] = (c==="correo") ? el.checked : el.value;
      if(c==="estado") renderGnGuardianes();
      else contarGuardianes();
    });
    if(el.dataset.campo==="obs") el.addEventListener("input",()=>{ gnTurno[+el.dataset.i].obs=el.value; });
  });
  box.querySelectorAll("[data-quitar]").forEach(b=>b.addEventListener("click",()=>{
    gnTurno.splice(+b.dataset.quitar,1); renderGnGuardianes();
  }));
  // Los reemplazos se muestran una vez pintado el selector
  gnTurno.forEach((g,i)=>{
    const s=box.querySelector(`select[data-campo="reemplazo"][data-i="${i}"]`);
    if(s && g.reemplazo) s.value=g.reemplazo;
  });
  renderGnAgregar(); contarGuardianes();
}
on("gnAgregarBtn","click",()=>{
  const sel=document.getElementById("gnAgregar");
  if(!sel.value) return;
  gnTurno.push({id:sel.value,estado:"cuartel",motivo:"",correo:false,obs:"",reemplazo:""});
  renderGnGuardianes();
});

/* Quienes efectivamente cubren la guardia: los presentes más los reemplazantes */
function cubrenGuardia(lista){
  const t=normalizaTurno(lista);
  const ids=[];
  t.forEach(g=>{
    if(g.estado!=="no") ids.push(g.id);
    else if(g.reemplazo) ids.push(g.reemplazo);
  });
  return ids;
}
function contarGuardianes(){
  const cubren=cubrenGuardia(gnTurno).length;
  const faltan=gnTurno.filter(g=>g.estado==="no" && !g.reemplazo).length;
  const msg=document.getElementById("gnMsg");
  if(msg && !msg.classList.contains("err")){
    msg.textContent = gnTurno.length
      ? `${gnTurno.length} designado${gnTurno.length===1?"":"s"} · ${cubren} cubre${cubren===1?"":"n"} la guardia`
        + (faltan?` · ${faltan} sin reemplazo`:"")
      : "";
  }
}

async function cargarGuardia(){
  const f=document.getElementById("gnFechaIng").value, h=document.getElementById("gnHoraIng").value;
  if(!f) return;
  const ex=await getGuardia(claveGuardia(f,h));
  const msg=document.getElementById("gnMsg"); msg.classList.remove("err");
  if(ex){
    document.getElementById("gnFechaSal").value=ex.fechaSal||"";
    document.getElementById("gnHoraSal").value=ex.horaSal||"";
    document.getElementById("gnNovedades").value=ex.novedades||"";
    renderGnOficial();
    document.getElementById("gnOficial").value=ex.oficial||"";
    renderGnGuardianes(ex.guardianes||[]);
    msg.textContent="Ya existe una guardia registrada para esta fecha y hora. Puedes editarla.";
  } else {
    document.getElementById("gnNovedades").value="";
    renderGnOficial(); renderGnGuardianes([]);
  }
}
on("gnFechaIng","change",()=>{
  const f=document.getElementById("gnFechaIng").value;
  const s=document.getElementById("gnFechaSal");
  if(f && !s.value){ const d=new Date(f+"T12:00"); d.setDate(d.getDate()+1);
    s.value=d.toISOString().slice(0,10); }
  cargarGuardia();
});
on("gnHoraIng","change",cargarGuardia);

on("gnGuardarBtn","click",async()=>{
  const msg=document.getElementById("gnMsg");
  const f=document.getElementById("gnFechaIng").value;
  const g=gnTurno;
  if(!f){ msg.textContent="Indica la fecha de ingreso de la guardia."; msg.classList.add("err"); return; }
  if(!g.length){ msg.textContent="Agrega al menos un guardián designado."; msg.classList.add("err"); return; }
  const d={
    fechaIng:f, horaIng:document.getElementById("gnHoraIng").value,
    fechaSal:document.getElementById("gnFechaSal").value, horaSal:document.getElementById("gnHoraSal").value,
    oficial:document.getElementById("gnOficial").value,
    guardianes:gnTurno, novedades:document.getElementById("gnNovedades").value.trim()
  };
  await setGuardia(claveGuardia(f,d.horaIng),d);
  msg.classList.remove("err");
  msg.textContent=`Guardia registrada: ${g.length} designado${g.length===1?"":"s"}, ${cubrenGuardia(g).length} cubren el turno.`;
  renderGnLista();
});

function nombrePorId(id){ const m=ROSTER.find(x=>x.id===id); return m?nombreCompleto(m):"—"; }

function gnDocumento(reg){
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  pdfHeader(doc,"FICHA DE GUARDIA NOCTURNA");
  doc.setFontSize(10);
  doc.text(`Ingreso: ${fmtDateLong(reg.fechaIng)} a las ${reg.horaIng||"—"}`,14,36);
  doc.text(`Salida:  ${reg.fechaSal?fmtDateLong(reg.fechaSal):"—"} a las ${reg.horaSal||"—"}`,14,42);
  doc.text(`Oficial a cargo: ${reg.oficial?nombrePorId(reg.oficial):"—"}`,14,48);
  const t=normalizaTurno(reg.guardianes);
  const est={cuartel:"En el cuartel",casa:"Desde su casa",no:"No asiste"};
  doc.autoTable({startY:54,styles:{fontSize:8},headStyles:{fillColor:[179,36,28]},
    head:[["N°","Clave","Guardián designado","Situación","Motivo","Reemplazado por","Justif. correo"]],
    body:t.map(g=>{
      const m=ROSTER.find(x=>x.id===g.id);
      return [m?m.n||"":"", m?m.clave||"—":"—", m?nombreCompleto(m):"—",
              est[g.estado]||"", g.estado==="no"?(g.motivo||"—"):"—",
              g.reemplazo?nombrePorId(g.reemplazo):"—",
              g.estado==="no"?(g.correo?"Sí":"No"):"—"];
    })});
  const cubren=cubrenGuardia(reg.guardianes);
  doc.setFont("helvetica","bold"); doc.setFontSize(9);
  doc.text(`Cubren la guardia: ${cubren.length} de ${t.length} designados`,14,doc.lastAutoTable.finalY+6);
  doc.setFont("helvetica","normal");
  const obs=t.filter(g=>g.estado==="no"&&g.obs);
  if(obs.length){
    doc.autoTable({startY:doc.lastAutoTable.finalY+10,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
      head:[["Justificaciones recibidas",""]],
      body:obs.map(g=>[nombrePorId(g.id),g.obs])});
  }
  doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:9},headStyles:{fillColor:[100,90,80]},
    head:[["Novedades de la guardia"]],
    body:[[reg.novedades||"Sin novedad"]]});
  let fy=doc.lastAutoTable.finalY+22;
  if(fy>240){ doc.addPage(); fy=40; }
  doc.setFontSize(9);
  doc.line(20,fy,85,fy); doc.text("Guardián responsable",20,fy+5);
  doc.line(115,fy,180,fy); doc.text("Oficial a cargo",115,fy+5);
  return doc;
}
on("gnPdfBtn","click",async()=>{
  const f=document.getElementById("gnFechaIng").value;
  const reg={fechaIng:f,horaIng:document.getElementById("gnHoraIng").value,
    fechaSal:document.getElementById("gnFechaSal").value,horaSal:document.getElementById("gnHoraSal").value,
    oficial:document.getElementById("gnOficial").value,guardianes:gnTurno,
    novedades:document.getElementById("gnNovedades").value.trim()};
  if(!f||!reg.guardianes.length){ alert("Completa la fecha y agrega los guardianes antes de generar el PDF."); return; }
  await sharePdfDoc(gnDocumento(reg),`guardia_${f}.pdf`,`Guardia nocturna del ${f}`);
});

function rangoGn(){
  return {d:document.getElementById("gnDesde").value, h:document.getElementById("gnHasta").value};
}
async function guardiasEnRango(){
  const {d,h}=rangoGn();
  const idx=await idxGuardias();
  const out=[];
  for(const it of idx){
    if(d && it.fecha<d) continue;
    if(h && it.fecha>h) continue;
    const g=await getGuardia(it.clave); if(g) out.push(g);
  }
  return out.sort((a,b)=>a.fechaIng<b.fechaIng?-1:1);
}
on("gnSemana","click",()=>{
  const hoy=new Date();
  const ini=new Date(hoy); ini.setDate(hoy.getDate()-6);
  document.getElementById("gnDesde").value=ini.toISOString().slice(0,10);
  document.getElementById("gnHasta").value=hoy.toISOString().slice(0,10);
  renderGnLista();
});
on("gnMes","click",()=>{
  const h=new Date();
  document.getElementById("gnDesde").value=new Date(h.getFullYear(),h.getMonth(),1).toISOString().slice(0,10);
  document.getElementById("gnHasta").value=new Date(h.getFullYear(),h.getMonth()+1,0).toISOString().slice(0,10);
  renderGnLista();
});
on("gnDesde","change",renderGnLista);
on("gnHasta","change",renderGnLista);

async function renderGnLista(){
  const lista=await guardiasEnRango();
  const box=document.getElementById("gnLista"), res=document.getElementById("gnResumen");
  const turnos=lista.length;
  const cubiertos=lista.reduce((s,g)=>s+cubrenGuardia(g.guardianes).length,0);
  const conNov=lista.filter(g=>g.novedades && !/^sin novedad/i.test(g.novedades)).length;
  let inasist=0, sinR=0;
  lista.forEach(g=>normalizaTurno(g.guardianes).forEach(x=>{
    if(x.estado==="no"){ inasist++; if(!x.reemplazo) sinR++; } }));
  res.innerHTML=`
    <div class="summary-item"><div class="big">${turnos}</div><div class="lbl">Guardias registradas</div></div>
    <div class="summary-item"><div class="big">${cubiertos}</div><div class="lbl">Turnos cubiertos</div></div>
    <div class="summary-item"><div class="big">${turnos?(cubiertos/turnos).toFixed(1):0}</div><div class="lbl">Guardianes por noche</div></div>
    <div class="summary-item"><div class="big">${inasist}</div><div class="lbl">Inasistencias</div></div>
    <div class="summary-item"><div class="big">${sinR}</div><div class="lbl">Sin reemplazo</div></div>
    <div class="summary-item"><div class="big">${conNov}</div><div class="lbl">Con novedad</div></div>`;
  if(!turnos){ box.innerHTML='<div class="empty">No hay guardias registradas en este período.</div>'; return; }
  box.innerHTML=lista.slice().reverse().map(g=>`
    <div class="hist-item">
      <div>
        <div class="hist-date">${fmtDateLong(g.fechaIng)} · ${esc(g.horaIng||"")} a ${esc(g.horaSal||"")}</div>
        <div class="hist-acto">${cubrenGuardia(g.guardianes).map(id=>esc(nombrePorId(id))).join(", ")}
          ${g.oficial?" · Oficial: "+esc(nombrePorId(g.oficial)):""}
          ${(()=>{const f=normalizaTurno(g.guardianes).filter(x=>x.estado==="no");
            return f.length?" · No asisten: "+f.map(x=>esc(nombrePorId(x.id))+(x.reemplazo?" (reemplazado)":" (sin reemplazo)")).join(", "):"";})()}
          ${g.novedades?" · "+esc(g.novedades):""}</div>
      </div>
      <div class="hist-right"><span class="badge">${cubrenGuardia(g.guardianes).length}</span></div>
    </div>`).join("");
}

on("gnPdfSemanal","click",async()=>{
  const lista=await guardiasEnRango(); const {d,h}=rangoGn();
  if(!lista.length){ alert("No hay guardias registradas en ese período."); return; }
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  pdfHeader(doc,"INFORME DE GUARDIAS NOCTURNAS");
  doc.setFontSize(9);
  doc.text(`Período ${d||"inicio"} al ${h||"hoy"} · ${lista.length} guardias · emitido el ${new Date().toLocaleDateString("es-CL")}`,35,33);
  doc.autoTable({startY:42,styles:{fontSize:8},headStyles:{fillColor:[179,36,28]},
    columnStyles:{3:{cellWidth:58}},
    head:[["Fecha","Horario","Oficial a cargo","Cubren la guardia","Inasistencias","Novedades"]],
    body:lista.map(g=>{
      const t=normalizaTurno(g.guardianes);
      const faltas=t.filter(x=>x.estado==="no").map(x=>
        nombrePorId(x.id)+" ("+(x.motivo||"sin motivo")+(x.correo?", justificó":"")+
        (x.reemplazo?"; reemplaza "+nombrePorId(x.reemplazo):"; sin reemplazo")+")");
      return [g.fechaIng,(g.horaIng||"")+" a "+(g.horaSal||""),
        g.oficial?nombrePorId(g.oficial):"—",
        cubrenGuardia(g.guardianes).map(id=>nombrePorId(id)).join(", "),
        faltas.length?faltas.join(" | "):"—",
        g.novedades||"Sin novedad"];
    })});
  let fy=doc.lastAutoTable.finalY+20;
  if(fy>240){ doc.addPage(); fy=40; }
  doc.setFontSize(9);
  doc.line(20,fy,85,fy); doc.text("Ayudante",20,fy+5);
  doc.line(115,fy,180,fy); doc.text("Capitán",115,fy+5);
  await sharePdfDoc(doc,`guardias_${d||"inicio"}_a_${h||"hoy"}.pdf`,"Informe de guardias nocturnas");
});

on("gnPdfEstad","click",async()=>{
  const lista=await guardiasEnRango(); const {d,h}=rangoGn();
  if(!lista.length){ alert("No hay guardias registradas en ese período."); return; }
  const conteo={}, desig={}, falto={}, reemp={}, ofi={};
  sortedRoster(false).forEach(p=>{ conteo[p.id]=0; desig[p.id]=0; falto[p.id]=0; reemp[p.id]=0; });
  let inasist=0, justif=0, sinReemplazo=0, reemplazos=0;
  lista.forEach(g=>{
    const t=normalizaTurno(g.guardianes);
    t.forEach(x=>{
      if(desig[x.id]!==undefined) desig[x.id]++;
      if(x.estado==="no"){
        inasist++; if(x.correo) justif++;
        if(falto[x.id]!==undefined) falto[x.id]++;
        if(x.reemplazo){ reemplazos++; if(reemp[x.reemplazo]!==undefined) reemp[x.reemplazo]++; }
        else sinReemplazo++;
      }
    });
    cubrenGuardia(g.guardianes).forEach(id=>{ if(conteo[id]!==undefined) conteo[id]++; });
    if(g.oficial) ofi[g.oficial]=(ofi[g.oficial]||0)+1;
  });
  const total=lista.length;
  const cubiertos=lista.reduce((s,g)=>s+cubrenGuardia(g.guardianes).length,0);
  const conNov=lista.filter(g=>g.novedades && !/^sin novedad/i.test(g.novedades)).length;
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  pdfHeader(doc,"INFORME ESTADÍSTICO DE GUARDIAS");
  doc.setFontSize(9);
  doc.text(`Período ${d||"inicio"} al ${h||"hoy"} · emitido el ${new Date().toLocaleDateString("es-CL")}`,35,33);
  doc.autoTable({startY:42,styles:{fontSize:9},headStyles:{fillColor:[179,36,28]},
    head:[["Resumen",""]],
    body:[["Guardias registradas",String(total)],
          ["Turnos cubiertos",String(cubiertos)],
          ["Promedio de guardianes por noche",(cubiertos/total).toFixed(1)],
          ["Guardias con novedad",`${conNov} de ${total}`],
          ["Voluntarios que participaron",String(Object.values(conteo).filter(v=>v>0).length)],
          ["Inasistencias de designados",String(inasist)],
          ["De ellas, justificadas por correo",`${justif} de ${inasist}`],
          ["Cubiertas con reemplazo",`${reemplazos} de ${inasist}`],
          ["Turnos que quedaron sin reemplazo",String(sinReemplazo)]]});
  const filas=sortedRoster(false).map(p=>({p,n:conteo[p.id]||0,d:desig[p.id]||0,
    f:falto[p.id]||0,r:reemp[p.id]||0})).sort((a,b)=>b.n-a.n);
  doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
    head:[["N°","Clave","Voluntario","Designado","Cubrió","No asistió","Reemplazó","% cumplim."]],
    body:filas.map(x=>[x.p.n||"",x.p.clave||"—",nombreCompleto(x.p),String(x.d),String(x.n),
      String(x.f),String(x.r), x.d?((x.d-x.f)/x.d*100).toFixed(0)+"%":"—"])});
  const ofiFilas=Object.entries(ofi).sort((a,b)=>b[1]-a[1]);
  if(ofiFilas.length){
    doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
      head:[["Oficial a cargo","Guardias"]],
      body:ofiFilas.map(([id,n])=>[nombrePorId(id),String(n)])});
  }
  await sharePdfDoc(doc,`estadistica_guardias_${d||"inicio"}_a_${h||"hoy"}.pdf`,"Estadística de guardias nocturnas");
});

/* ---- INFOGRAFÍA DE GUARDIAS ---- */
on("gnInfo","click",async()=>{
  const lista=await guardiasEnRango(); const {d,h}=rangoGn();
  if(!lista.length){ alert("No hay guardias registradas en ese período."); return; }
  const DIAS=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  const f1=x=>x.toFixed(1);

  const conteo={}, desig={}, falto={}, reemp={};
  sortedRoster(false).forEach(p=>{ conteo[p.id]=0; desig[p.id]=0; falto[p.id]=0; reemp[p.id]=0; });
  let inasist=0, justif=0, sinR=0, reemplazos=0, cubiertos=0;
  lista.forEach(g=>{
    normalizaTurno(g.guardianes).forEach(x=>{
      if(desig[x.id]!==undefined) desig[x.id]++;
      if(x.estado==="no"){
        inasist++; if(x.correo) justif++;
        if(falto[x.id]!==undefined) falto[x.id]++;
        if(x.reemplazo){ reemplazos++; if(reemp[x.reemplazo]!==undefined) reemp[x.reemplazo]++; }
        else sinR++;
      }
    });
    const c=cubrenGuardia(g.guardianes); cubiertos+=c.length;
    c.forEach(id=>{ if(conteo[id]!==undefined) conteo[id]++; });
  });
  const ranking=sortedRoster(false).map(p=>({p,n:conteo[p.id]||0,d:desig[p.id]||0,
    f:falto[p.id]||0,r:reemp[p.id]||0})).filter(x=>x.d||x.n).sort((a,b)=>b.n-a.n);
  const conNov=lista.filter(g=>g.novedades && !/^sin novedad/i.test(g.novedades)).length;

  const noches=lista.map(g=>{
    const t=normalizaTurno(g.guardianes);
    const [yy,mm,dd]=g.fechaIng.split("-").map(Number);
    const dia=new Date(yy,mm-1,dd);
    return {g,t,dia,
      cuartel:t.filter(x=>x.estado==="cuartel"),
      casa:t.filter(x=>x.estado==="casa"),
      faltan:t.filter(x=>x.estado==="no")};
  });

  const doc=`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=1180">
<title>Guardias nocturnas · Quinta Compañía</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0}
body{background:#e8edf3;font-family:'Source Sans 3',sans-serif;color:#1e293b;padding:18px}
.hoja{max-width:1120px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 18px rgba(0,0,0,.13)}
.top{background:linear-gradient(135deg,#0f2a4a,#1b4a82);color:#fff;padding:20px 26px;display:flex;align-items:center;gap:22px}
.top img{width:60px;height:66px;object-fit:contain}
.top h1{font-family:'Barlow Condensed',sans-serif;font-size:36px;line-height:1}
.top h2{font-size:14px;font-weight:600;opacity:.95;margin-top:2px}
.lema{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:3px;opacity:.75;margin-top:5px}
.corte{margin-left:auto;text-align:right;background:rgba(255,255,255,.12);border-radius:7px;padding:9px 14px;font-size:11.5px}
.corte b{display:block;font-size:14px;margin-top:2px}
.cuerpo{padding:16px}
.sec{border:1px solid #d3dceb;border-radius:8px;margin-bottom:13px;overflow:hidden}
.sec>h3{background:#0f2a4a;color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:15.5px;letter-spacing:.6px;padding:8px 14px}
.sec>.in{padding:14px}
.kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
.k{border-radius:8px;padding:12px;text-align:center;border:1px solid #dbe4f0;background:#f4f8fd}
.k .n{font-family:'Barlow Condensed',sans-serif;font-size:31px;line-height:1;color:#0f2a4a}
.k .t{font-size:10.8px;color:#5b6b82;margin-top:4px;font-weight:600}
.k.v{background:#eefbf2;border-color:#b9e6c8}.k.v .n{color:#16a34a}
.k.r{background:#fdeded;border-color:#f6c6c6}.k.r .n{color:#dc2626}
.noches{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.noche{border:1px solid #dbe4f0;border-radius:8px;overflow:hidden;background:#fbfcfe}
.noche .cab{background:#eaf0f8;padding:8px 11px;border-bottom:1px solid #dbe4f0}
.noche .cab b{display:block;font-family:'Barlow Condensed',sans-serif;font-size:16px;color:#0f2a4a;text-transform:capitalize}
.noche .cab span{font-size:11px;color:#64748b}
.noche .cnt{padding:10px 11px}
.g{display:flex;align-items:center;gap:7px;font-size:12px;padding:3px 0}
.g em{font-style:normal;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;flex:0 0 auto}
.e-c{background:#dcf2e3;color:#15683a}
.e-h{background:#e3ecfb;color:#1b4a82}
.e-r{background:#fdf0dc;color:#96601a}
.e-n{background:#fbe0e0;color:#8f1d1d;text-decoration:none}
.g s{text-decoration:line-through;opacity:.65}
.ofi{font-size:11px;color:#475569;border-top:1px dashed #dbe4f0;margin-top:8px;padding-top:7px}
.nov{font-size:11px;color:#8f1d1d;background:#fdf4f3;border-radius:5px;padding:6px 8px;margin-top:7px;line-height:1.4}
table{width:100%;border-collapse:collapse;font-size:11.5px}
th{background:#eaf0f8;color:#0f2a4a;text-align:left;padding:6px 8px;border:1px solid #d3dceb;font-weight:700}
td{padding:5px 8px;border:1px solid #e3e9f2}
.leyenda{display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:#475569;margin-top:12px}
.leyenda span{display:flex;align-items:center;gap:6px}
.pie{background:#0f2a4a;color:#fff;padding:12px 22px;display:flex;justify-content:space-between;align-items:center;font-size:11px;line-height:1.5}
.pie .lm{font-family:'Barlow Condensed',sans-serif;letter-spacing:2.5px;opacity:.8}
@media print{body{background:#fff;padding:0}.hoja{box-shadow:none}}
</style></head><body><div class="hoja">
<div class="top"><img src="${LOGO_B64}" alt="">
<div><h1>GUARDIAS NOCTURNAS</h1>
<h2>Quinta Compañía "Germania" — Cuerpo de Bomberos de Villarrica</h2>
<div class="lema">DISCIPLINA &nbsp;•&nbsp; SERVICIO &nbsp;•&nbsp; COMPAÑERISMO</div></div>
<div class="corte">Período<b>${esc(d||"inicio")} al ${esc(h||"hoy")}</b></div></div>
<div class="cuerpo">

<div class="sec"><h3>RESUMEN DEL PERÍODO</h3><div class="in"><div class="kpis">
<div class="k"><div class="n">${lista.length}</div><div class="t">Noches con guardia</div></div>
<div class="k v"><div class="n">${cubiertos}</div><div class="t">Turnos cubiertos</div></div>
<div class="k"><div class="n">${f1(cubiertos/lista.length)}</div><div class="t">Guardianes por noche</div></div>
<div class="k"><div class="n">${inasist}</div><div class="t">Inasistencias</div></div>
<div class="k ${sinR?"r":"v"}"><div class="n">${sinR}</div><div class="t">Sin reemplazo</div></div>
<div class="k"><div class="n">${conNov}</div><div class="t">Noches con novedad</div></div>
</div></div></div>

<div class="sec"><h3>NÓMINA NOCHE POR NOCHE</h3><div class="in">
<div class="noches">
${noches.map(n=>`
  <div class="noche">
    <div class="cab">
      <b>${DIAS[n.dia.getDay()]} ${n.dia.getDate()}</b>
      <span>${esc(n.g.horaIng||"")} a ${esc(n.g.horaSal||"")} · ${esc(n.g.fechaIng)}</span>
    </div>
    <div class="cnt">
      ${n.cuartel.map(x=>`<div class="g"><em class="e-c">CUARTEL</em>${esc(nombrePorId(x.id))}</div>`).join("")}
      ${n.casa.map(x=>`<div class="g"><em class="e-h">A LLAMADO</em>${esc(nombrePorId(x.id))}</div>`).join("")}
      ${n.faltan.map(x=>`
        <div class="g"><em class="e-n">NO ASISTE</em><s>${esc(nombrePorId(x.id))}</s></div>
        <div class="g" style="padding-left:14px;font-size:11px;color:#64748b;">${esc(x.motivo||"sin motivo")}${x.correo?" · justificó por correo":""}</div>
        ${x.reemplazo?`<div class="g"><em class="e-r">REEMPLAZA</em>${esc(nombrePorId(x.reemplazo))}</div>`:
          `<div class="g" style="padding-left:14px;font-size:11px;color:#8f1d1d;">Sin reemplazo</div>`}`).join("")}
      <div class="ofi">Oficial a cargo: <b>${n.g.oficial?esc(nombrePorId(n.g.oficial)):"—"}</b></div>
      ${n.g.novedades && !/^sin novedad/i.test(n.g.novedades)?`<div class="nov"><b>Novedad:</b> ${esc(n.g.novedades)}</div>`:""}
    </div>
  </div>`).join("")}
</div>
<div class="leyenda">
  <span><em class="e-c" style="font-style:normal;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;">CUARTEL</em> duerme en el cuartel</span>
  <span><em class="e-h" style="font-style:normal;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;">A LLAMADO</em> acude desde su casa</span>
  <span><em class="e-r" style="font-style:normal;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;">REEMPLAZA</em> cubre a un designado</span>
  <span><em class="e-n" style="font-style:normal;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;">NO ASISTE</em> designado que no concurre</span>
</div>
</div></div>

<div class="sec"><h3>PARTICIPACIÓN POR VOLUNTARIO</h3><div class="in">
<table><tr><th>N°</th><th>Voluntario</th><th>Designado</th><th>Cubrió</th><th>No asistió</th><th>Reemplazó</th><th>Cumplimiento</th></tr>
${ranking.map(x=>`<tr><td>${x.p.n||""}</td><td><b>${esc(nombreCompleto(x.p))}</b></td>
<td>${x.d}</td><td>${x.n}</td><td>${x.f}</td><td>${x.r}</td>
<td><b>${x.d?((x.d-x.f)/x.d*100).toFixed(0)+"%":"—"}</b></td></tr>`).join("")}
</table>
${inasist?`<div style="margin-top:12px;background:#fdf4f3;border:1px solid #f6c6c6;border-radius:7px;padding:10px 12px;font-size:11.5px;color:#8f1d1d;">
<b>Inasistencias:</b> ${inasist} en el período, de las cuales ${justif} se justificaron por correo y ${reemplazos} fueron cubiertas con reemplazo. ${sinR?`Quedaron ${sinR} turno${sinR===1?"":"s"} sin reemplazo.`:"Todas fueron reemplazadas."}</div>`:""}
</div></div>

</div>
<div class="pie"><div><b>Desarrollado por la 5ta Compañía "Germania"</b> · Cuerpo de Bomberos de Villarrica · Chile<br>
<span style="opacity:.72">Generado el ${new Date().toLocaleDateString("es-CL")}</span></div>
<div class="lm">VOLUNTAD HOY, COMUNIDAD SIEMPRE</div></div>
</div></body></html>`;

  const blob=new Blob([doc],{type:"text/html;charset=utf-8"});
  await entregarArchivo(blob,`guardias_${d||"inicio"}_a_${h||"hoy"}.html`,
    `Guardias nocturnas · ${d||"inicio"} al ${h||"hoy"}`,"Infografía de guardias generada");
});

/* ============ HISTORIAL ============ */
function populateTipoFilters(){
  ["histTipoFiltro"].forEach(id=>{
    const sel=document.getElementById(id); if(!sel) return;
    const cur=sel.value;
    sel.innerHTML='<option value="">Todos</option>'+TIPOS.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join("");
    if(TIPOS.includes(cur)) sel.value=cur;
  });
}
/* Descripciones existentes, para poder filtrar por ellas */
async function poblarDescripciones(){
  const sel=document.getElementById("histDescFiltro"); if(!sel) return;
  const prev=sel.value;
  const idx=await getIndex(); const set=new Set();
  for(const it of idx){
    const p=await getParte(it.clave);
    if(p && p.detalle && p.detalle.trim()) set.add(p.detalle.trim());
  }
  const lista=[...set].sort((a,b)=>a.localeCompare(b,"es"));
  sel.innerHTML='<option value="">Todas</option>'+lista.map(d=>`<option value="${esc(d)}">${esc(d)}</option>`).join("");
  if(lista.includes(prev)) sel.value=prev;
}

async function renderHistorial(){
  const list=document.getElementById("historialList");
  const f=document.getElementById("histTipoFiltro").value;
  const fd=document.getElementById("histDescFiltro") ? document.getElementById("histDescFiltro").value : "";
  const txt=(document.getElementById("histBuscar") ? document.getElementById("histBuscar").value : "").trim().toLowerCase();
  await poblarDescripciones();
  let idx=(await getIndex()).slice().sort((a,b)=>a.date<b.date?1:-1);
  if(f) idx=idx.filter(i=>i.tipo===f);

  const filtrados=[];
  for(const it of idx){
    const p=await getParte(it.clave); if(!p) continue;
    const det=(p.detalle||"").trim();
    if(fd && det!==fd) continue;
    if(txt && !((det+" "+(p.tipo||"")).toLowerCase().includes(txt))) continue;
    filtrados.push({it,p});
  }
  const res=document.getElementById("histResumen");
  if(res) res.textContent = filtrados.length
    ? `${filtrados.length} actividad${filtrados.length===1?"":"es"} encontrada${filtrados.length===1?"":"s"}`
    : "";
  if(!filtrados.length){ list.innerHTML='<div class="empty">No hay actividades que coincidan con el filtro.</div>'; return; }
  list.innerHTML="";
  for(const {it,p} of filtrados){
    const c=countStatuses(p.records);
    const div=document.createElement("div"); div.className="hist-item";
    div.innerHTML=`<div>
        <div class="hist-date">${fmtDateLong(p.date)} <span class="badge">${esc(p.tipo)}</span></div>
        <div class="hist-acto">${esc(p.detalle||"Sin detalle")}${p.registradoPor?" · Pasó lista: "+esc(p.registradoPor):""}</div>
      </div>
      <div class="hist-right">
        <div class="hist-count">${c.presente} pres. · ${c.justificado} just. · ${c.ausente} aus.</div>
        <button class="btn small secondary" data-open="${it.clave}">Editar</button>
        <button class="btn small gold" data-pdf="${it.clave}">PDF</button>
      </div>`;
    list.appendChild(div);
  }
  list.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",async()=>{
    const p=await getParte(b.dataset.open); if(!p) return;
    document.getElementById("fecha").value=p.date;
    renderTipoSelect(); document.getElementById("tipoSelect").value=p.tipo;
    await loadListaForSelection();
    document.getElementById("registradoPor").value=p.registradoPor||"";
    switchTab("lista");
  }));
  list.querySelectorAll("[data-pdf]").forEach(b=>b.addEventListener("click",async()=>{
    const p=await getParte(b.dataset.pdf); if(!p) return;
    await sharePdfDoc(buildParteDoc(p.date,p.tipo,p.detalle||"",p.records,p.registradoPor||""),`parte_${p.date}_${slug(p.tipo)}.pdf`);
  }));
}
on("histTipoFiltro","change",renderHistorial);
on("histDescFiltro","change",renderHistorial);
on("histBuscar","input",renderHistorial);
on("histLimpiar","click",()=>{
  ["histTipoFiltro","histDescFiltro","histBuscar"].forEach(id=>{ const e=document.getElementById(id); if(e) e.value=""; });
  renderHistorial();
});

/* ============ PANEL DE ESTADISTICAS ============ */
const MESES_NOM=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
function pct(a,b){ return b? (a/b*100) : 0; }

/* Años presentes en los datos, para que la estadística siga creciendo con el tiempo */
async function aniosConDatos(){
  const idx=await getIndex();
  const set=new Set(idx.map(i=>i.date.slice(0,4)));
  set.add(String(new Date().getFullYear()));
  return [...set].sort().reverse();
}
async function poblarSelectoresPanel(){
  const selA=document.getElementById("pnAnio"), prev=selA.value;
  const anios=await aniosConDatos();
  selA.innerHTML=anios.map(a=>`<option value="${a}">${a}</option>`).join("");
  selA.value = anios.includes(prev) ? prev : anios[0];
  const selM=document.getElementById("pnMes");
  if(!selM.options.length){
    selM.innerHTML='<option value="acum">Acumulado a la fecha</option><option value="anio">Año completo</option>'
      + MESES_NOM.map((m,i)=>`<option value="${i+1}">${m}</option>`).join("");
    selM.value="acum";
  }
}

/* Rango de fechas segun el periodo elegido */
function rangoPanel(){
  const anio=document.getElementById("pnAnio").value || String(new Date().getFullYear());
  const modo=document.getElementById("pnMes").value || "acum";
  const hoy=todayISO();
  if(modo==="anio") return {desde:`${anio}-01-01`, hasta:`${anio}-12-31`, etiqueta:`Año ${anio} completo`, modo};
  if(modo==="acum"){
    const hasta = (hoy.slice(0,4)===anio) ? hoy : `${anio}-12-31`;
    return {desde:`${anio}-01-01`, hasta, etiqueta:`Acumulado al ${fmtDateLong(hasta)}`, modo};
  }
  const m=String(modo).padStart(2,"0");
  const fin=new Date(parseInt(anio,10), parseInt(modo,10), 0).getDate();
  return {desde:`${anio}-${m}-01`, hasta:`${anio}-${m}-${fin}`, etiqueta:`${MESES_NOM[modo-1]} de ${anio}`, modo:"mes"};
}

async function datosPanel(desde,hasta){
  const idx=(await getIndex()).filter(i=>i.date>=desde && i.date<=hasta);
  const partes=[];
  for(const it of idx){ const p=await getParte(it.clave); if(p) partes.push(p); }
  partes.sort((a,b)=>a.date<b.date?-1:1);
  const activos=sortedRoster(false);
  const stats={};
  activos.forEach(p=>stats[p.id]={pres:0,just:0,aus:0});
  partes.forEach(pt=>{
    activos.forEach(m=>{
      const s=(pt.records&&pt.records[m.id])||"ausente";
      if(s==="presente") stats[m.id].pres++;
      else if(s==="justificado") stats[m.id].just++;
      else stats[m.id].aus++;
    });
  });
  return {partes, activos, stats};
}

/* Calculo comun usado por el panel y por los informes */
function resumen(partes, activos, stats){
  const N=partes.length;
  const totPres=activos.reduce((s,m)=>s+stats[m.id].pres,0);
  const posibles=N*activos.length;
  const tipos={};
  const meses={};
  partes.forEach(pt=>{
    const t=pt.tipo||"Sin tipo";
    if(!tipos[t]) tipos[t]={n:0,pres:0};
    tipos[t].n++;
    const mm=parseInt(pt.date.slice(5,7),10);
    if(!meses[mm]) meses[mm]={n:0,pres:0};
    meses[mm].n++;
    activos.forEach(m=>{
      if((pt.records&&pt.records[m.id])==="presente"){ tipos[t].pres++; meses[mm].pres++; }
    });
  });
  const porPersona=activos.map(m=>({m,pres:stats[m.id].pres,p:pct(stats[m.id].pres,N)}))
                          .sort((a,b)=>b.p-a.p);
  const orden=porPersona.map(x=>x.p).slice().sort((a,b)=>a-b);
  const mediana=orden.length ? (orden.length%2 ? orden[(orden.length-1)/2]
                : (orden[orden.length/2-1]+orden[orden.length/2])/2) : 0;
  const conv=partes.map(pt=>{
    const c=activos.filter(m=>(pt.records&&pt.records[m.id])==="presente").length;
    return {pt,c,t:pct(c,activos.length)};
  }).sort((a,b)=>b.c-a.c);
  return {N,totPres,posibles,global:pct(totPres,posibles),tipos,meses,porPersona,mediana,conv};
}

async function renderPanel(){
  await poblarSelectoresPanel();
  const R=rangoPanel();
  const {partes,activos,stats}=await datosPanel(R.desde,R.hasta);
  const r=resumen(partes,activos,stats);
  const bajas=ROSTER.filter(m=>m.activo===false).length;

  document.getElementById("pnCorte").textContent = r.N
    ? `${R.etiqueta} · ${r.N} actividades · última el ${fmtDateLong(partes[partes.length-1].date)}`
    : `${R.etiqueta} · sin actividades registradas`;

  const yaImportado = await sGet(IMPORT_KEY,null);
  const totalIdx = (await getIndex()).length;
  const cajaImp = document.getElementById("pnImport");
  if(!yaImportado){
    cajaImp.style.display="block";
    document.getElementById("pnImportTxt").textContent =
      "La base 2026 de la Compañía (67 actividades de enero a junio) no está cargada. Puedes incorporarla aquí.";
  } else {
    cajaImp.style.display="none";
  }

  if(!r.N){
    ["pnKpis","pnTipos","pnTramos","pnMeses","pnDetalle","pnRanking","pnConvocatoria","pnHallazgos"]
      .forEach(id=>document.getElementById(id).innerHTML='<div class="empty">Sin datos en este período.</div>');
    return;
  }

  document.getElementById("pnKpis").innerHTML=`
    <div class="kpi"><div class="v">${r.N}</div><div class="l">Actividades registradas</div></div>
    <div class="kpi"><div class="v">${ROSTER.length}</div><div class="l">Dotación listada</div></div>
    <div class="kpi alto"><div class="v">${activos.length}</div><div class="l">Voluntarios activos</div></div>
    <div class="kpi bajo"><div class="v">${bajas}</div><div class="l">Bajas</div></div>
    <div class="kpi ${r.global>=50?'alto':r.global>=35?'medio':'bajo'}"><div class="v">${r.global.toFixed(1)}%</div><div class="l">Asistencia activa global</div></div>`;

  const listaT=Object.entries(r.tipos).map(([t,d])=>({t,n:d.n,pres:d.pres,tasa:pct(d.pres,d.n*activos.length)}))
                .sort((a,b)=>b.n-a.n);
  document.getElementById("pnTipos").innerHTML =
    listaT.map(x=>`<div class="barra"><div class="et">${esc(x.t)}<br><span style="color:var(--muted);font-size:11.5px;">${x.n} actividad${x.n===1?"":"es"}</span></div>
      <div class="tr"><div style="width:${x.tasa.toFixed(1)}%"></div></div>
      <div class="vl">${x.tasa.toFixed(1)}%</div></div>`).join("")
    + (listaT.length>1 ? (()=>{ const mx=listaT.reduce((a,b)=>a.tasa>b.tasa?a:b), mn=listaT.reduce((a,b)=>a.tasa<b.tasa?a:b);
        return `<div class="aviso">Brecha principal: ${esc(mn.t)} alcanza ${mn.tasa.toFixed(1)}% frente a ${esc(mx.t)} con ${mx.tasa.toFixed(1)}%.</div>`; })() : "");

  const TR=[["50% o más","#4a7c59",x=>x>=50],["35% a 49,9%","#c9a227",x=>x>=35&&x<50],
            ["20% a 34,9%","#d1892a",x=>x>=20&&x<35],["Menos de 20%","#b3241c",x=>x<20]];
  const grupos=TR.map(([et,col,f])=>({et,col,c:r.porPersona.filter(x=>f(x.p)).length}));
  let ang=0; const seg=[];
  grupos.forEach(g=>{ const a2=ang+pct(g.c,activos.length)*3.6; seg.push(`${g.col} ${ang}deg ${a2}deg`); ang=a2; });
  document.getElementById("pnTramos").innerHTML=`
    <div class="dona">
      <div class="circ" style="background:conic-gradient(${seg.join(",")})">
        <i><b>${activos.length}</b><span>voluntarios<br>activos</span></i>
      </div>
      <div class="leyenda">${grupos.map(g=>`<div><em style="background:${g.col}"></em>${g.et} — <b>${g.c}</b> (${pct(g.c,activos.length).toFixed(1)}%)</div>`).join("")}</div>
    </div>`;

  const clavesM=Object.keys(r.meses).map(Number).sort((a,b)=>a-b);
  const maxN=Math.max(...clavesM.map(m=>r.meses[m].n));
  let htmlM=clavesM.map(m=>{
    const t=pct(r.meses[m].pres,r.meses[m].n*activos.length);
    return `<div class="barra"><div class="et">${MESES_NOM[m-1]}<br><span style="color:var(--muted);font-size:11.5px;">${r.meses[m].n} act.</span></div>
      <div class="tr"><div style="width:${pct(r.meses[m].n,maxN).toFixed(0)}%;background:var(--gold);"></div></div>
      <div class="vl">${t.toFixed(1)}%</div></div>`;
  }).join("");
  if(clavesM.length>1){
    const mejor=clavesM.reduce((a,b)=>pct(r.meses[a].pres,r.meses[a].n*activos.length)>pct(r.meses[b].pres,r.meses[b].n*activos.length)?a:b);
    htmlM+=`<div class="aviso ok">${MESES_NOM[mejor-1]} presenta la mayor tasa: ${pct(r.meses[mejor].pres,r.meses[mejor].n*activos.length).toFixed(1)}%.</div>`;
  }
  document.getElementById("pnMeses").innerHTML=htmlM;

  document.getElementById("pnDetalle").innerHTML=r.porPersona.slice()
    .sort((a,b)=>(a.m.n||999)-(b.m.n||999)).map(x=>{
      const s=stats[x.m.id];
      return `<tr><td class="n-col">${x.m.n||""}</td>
        <td class="name-col">${x.m.clave?`<span class="clv">${esc(x.m.clave)}</span> `:""}${esc(nombreCompleto(x.m))}</td>
        <td>${s.pres}</td><td>${s.just}</td><td>${s.aus}</td>
        <td><span class="pct-bar"><div style="width:${x.p.toFixed(0)}%"></div></span>${x.p.toFixed(1)}%</td></tr>`;
    }).join("");

  const fila=x=>`<tr><td class="n-col">${x.m.n||""}</td>
      <td class="name-col">${x.m.clave?`<span class="clv">${esc(x.m.clave)}</span> `:""}${esc(nombreCompleto(x.m))}</td>
      <td class="cargo-col">${esc(x.m.cargo)}</td>
      <td><span class="pct-bar"><div style="width:${x.p.toFixed(0)}%"></div></span>${x.p.toFixed(1)}%</td></tr>`;
  document.getElementById("pnRanking").innerHTML=`
    <h3>Mayor asistencia</h3><table><tbody>${r.porPersona.slice(0,5).map(fila).join("")}</tbody></table>
    <h3>Menor asistencia</h3><table><tbody>${r.porPersona.slice(-5).reverse().map(fila).join("")}</tbody></table>`;

  const filaC=x=>`<tr><td>${x.pt.date}</td><td class="name-col">${esc(x.pt.tipo)}${x.pt.detalle?" · "+esc(x.pt.detalle):""}</td>
      <td style="text-align:center;">${x.c}</td><td style="text-align:center;">${x.t.toFixed(1)}%</td></tr>`;
  document.getElementById("pnConvocatoria").innerHTML=`
    <h3>Mayor convocatoria</h3>
    <table><thead><tr><th>Fecha</th><th>Actividad</th><th>Asist.</th><th>Tasa</th></tr></thead>
    <tbody>${r.conv.slice(0,3).map(filaC).join("")}</tbody></table>
    <h3>Menor convocatoria</h3>
    <table><thead><tr><th>Fecha</th><th>Actividad</th><th>Asist.</th><th>Tasa</th></tr></thead>
    <tbody>${r.conv.slice(-3).reverse().map(filaC).join("")}</tbody></table>`;

  const peorTipo=listaT.reduce((a,b)=>a.tasa<b.tasa?a:b);
  document.getElementById("pnHallazgos").innerHTML=`
    <div class="kpis">
      <div class="kpi"><div class="v">${r.totPres}</div><div class="l">Asistencias sobre ${r.posibles} participaciones posibles</div></div>
      <div class="kpi medio"><div class="v">${r.mediana.toFixed(1)}%</div><div class="l">Mediana de asistencia individual</div></div>
      <div class="kpi bajo"><div class="v">${r.porPersona.filter(x=>x.p<20).length}</div><div class="l">Voluntarios bajo 20% de asistencia</div></div>
      <div class="kpi"><div class="v">${(r.totPres/r.N).toFixed(1)}</div><div class="l">Concurrencia promedio por actividad</div></div>
    </div>
    <div class="aviso">Punto de atención: ${esc(peorTipo.t)} es la actividad con menor participación (${peorTipo.tasa.toFixed(1)}%).</div>`;
}
on("pnAnio","change",renderPanel);
on("pnMes","change",renderPanel);

/* ---- INFORMES EN PDF ---- */
async function generarInforme(desde,hasta,etiqueta,conMeses){
  const {partes,activos,stats}=await datosPanel(desde,hasta);
  const r=resumen(partes,activos,stats);
  if(!r.N){ alert("No hay actividades registradas en ese período."); return; }
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  pdfHeader(doc,"INFORME DE ASISTENCIA");
  doc.setFontSize(10); doc.setFont("helvetica","bold");
  doc.text(etiqueta,35,33);
  doc.setFont("helvetica","normal"); doc.setFontSize(8);
  doc.text(`Período ${desde} al ${hasta} · emitido el ${new Date().toLocaleDateString("es-CL")}`,35,37.5);

  doc.autoTable({startY:44,styles:{fontSize:9},headStyles:{fillColor:[179,36,28]},
    head:[["Resumen general",""]],
    body:[["Actividades registradas",String(r.N)],
          ["Dotación listada",String(ROSTER.length)],
          ["Voluntarios activos",String(activos.length)],
          ["Bajas",String(ROSTER.filter(m=>m.activo===false).length)],
          ["Asistencias registradas",`${r.totPres} de ${r.posibles} posibles`],
          ["Asistencia activa global",r.global.toFixed(1)+"%"],
          ["Mediana individual",r.mediana.toFixed(1)+"%"],
          ["Concurrencia promedio",(r.totPres/r.N).toFixed(1)+" voluntarios por actividad"]]});

  doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:9},headStyles:{fillColor:[100,90,80]},
    head:[["Tipo de actividad","N°","Asistencias","Tasa"]],
    body:Object.entries(r.tipos).sort((a,b)=>b[1].n-a[1].n)
      .map(([t,d])=>[t,String(d.n),String(d.pres),pct(d.pres,d.n*activos.length).toFixed(1)+"%"])});

  if(conMeses){
    const cm=Object.keys(r.meses).map(Number).sort((a,b)=>a-b);
    doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:9},headStyles:{fillColor:[100,90,80]},
      head:[["Mes","Actividades","Asistencias","Tasa"]],
      body:cm.map(m=>[MESES_NOM[m-1],String(r.meses[m].n),String(r.meses[m].pres),
                      pct(r.meses[m].pres,r.meses[m].n*activos.length).toFixed(1)+"%"])});
  }

  doc.addPage();
  doc.setFont("helvetica","bold"); doc.setFontSize(12);
  doc.text("DETALLE POR VOLUNTARIO",14,20);
  doc.autoTable({startY:26,styles:{fontSize:8},headStyles:{fillColor:[179,36,28]},
    head:[["N°","Clave","Voluntario","Cargo","Asist.","Faltas","Tasa"]],
    body:r.porPersona.map(x=>[x.m.n||"",x.m.clave||"—",nombreCompleto(x.m),x.m.cargo,
      String(x.pres),String(r.N-x.pres),x.p.toFixed(1)+"%"])});

  doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
    head:[["Fecha","Actividad","Asistentes","Tasa"]],
    body:r.conv.slice().sort((a,b)=>a.pt.date<b.pt.date?-1:1)
      .map(x=>[x.pt.date,(x.pt.tipo||"")+(x.pt.detalle?" · "+x.pt.detalle:""),String(x.c),x.t.toFixed(1)+"%"])});

  let fy=doc.lastAutoTable.finalY+18;
  if(fy>250){ doc.addPage(); fy=40; }
  doc.setFontSize(9);
  doc.line(20,fy,85,fy); doc.text("Ayudante",20,fy+5);
  doc.line(115,fy,180,fy); doc.text("Capitán",115,fy+5);
  doc.setFontSize(8);
  doc.text(`Generado el ${new Date().toLocaleString("es-CL")}`,14,fy+16);

  await sharePdfDoc(doc,`informe_asistencia_${slug(etiqueta)}.pdf`,`Informe de asistencia · ${etiqueta}`);
}

on("pnPdf","click",async()=>{
  const R=rangoPanel();
  await generarInforme(R.desde,R.hasta,R.etiqueta,R.modo!=="mes");
});

/* ---- INFOGRAFIA ---- */
function construirInfografia(R, r, activos){
  const f1=x=>x.toFixed(1);
  const cap=s=>String(s||"").toLowerCase().replace(/(^|\s)\S/g,c=>c.toUpperCase());
  const tipos=Object.entries(r.tipos).map(([t,d])=>({t,n:d.n,p:d.pres,tasa:pct(d.pres,d.n*activos.length)}))
                .sort((a,b)=>b.n-a.n);
  const maxBar=Math.max(...tipos.map(t=>t.p),1);
  const peor=tipos.length?tipos.reduce((a,b)=>a.tasa<b.tasa?a:b):{t:"—",tasa:0};
  const mejor=tipos.length?tipos.reduce((a,b)=>a.tasa>b.tasa?a:b):{t:"—",tasa:0};
  const mk=Object.keys(r.meses).map(Number).sort((a,b)=>a-b);
  const maxMes=Math.max(...mk.map(m=>r.meses[m].n),1);
  const mejorMes=mk.length?mk.reduce((a,b)=>pct(r.meses[a].pres,r.meses[a].n*activos.length)>pct(r.meses[b].pres,r.meses[b].n*activos.length)?a:b):null;
  const TR=[["50% o más","#16a34a",v=>v>=50],["35% a 49,9%","#eab308",v=>v>=35&&v<50],
            ["20% a 34,9%","#f97316",v=>v>=20&&v<35],["Menos de 20%","#dc2626",v=>v<20]];
  const grupos=TR.map(([et,col,fn])=>({et,col,c:r.porPersona.filter(x=>fn(x.p)).length}));
  let ang=0; const seg=grupos.map(g=>{const a2=ang+pct(g.c,activos.length)*3.6;const s=`${g.col} ${ang}deg ${a2}deg`;ang=a2;return s;});
  const bajas=ROSTER.filter(m=>m.activo===false).length;

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=1180">
<title>Asistencias · Quinta Compañía</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0}
body{background:#e8edf3;font-family:'Source Sans 3',sans-serif;color:#1e293b;padding:18px}
.hoja{max-width:1120px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 18px rgba(0,0,0,.13)}
.top{background:linear-gradient(135deg,#13315c,#1e4d8c);color:#fff;padding:20px 26px;display:flex;align-items:center;gap:22px}
.top img{width:62px;height:68px;object-fit:contain}
.top h1{font-family:'Barlow Condensed',sans-serif;font-size:38px;line-height:1}
.top h2{font-size:14.5px;font-weight:600;opacity:.95;margin-top:2px}
.lema{font-family:'Barlow Condensed',sans-serif;font-size:11.5px;letter-spacing:3px;opacity:.75;margin-top:5px}
.corte{margin-left:auto;text-align:right;background:rgba(255,255,255,.12);border-radius:7px;padding:9px 14px;font-size:12px}
.corte b{display:block;font-size:15px;margin-top:2px}
.cuerpo{padding:16px}
.sec{border:1px solid #d3dceb;border-radius:8px;margin-bottom:13px;overflow:hidden}
.sec>h3{background:#13315c;color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:16px;letter-spacing:.6px;padding:8px 14px}
.sec>.in{padding:14px}
.kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:11px}
.k{border-radius:8px;padding:13px;text-align:center;border:1px solid #dbe4f0;background:#f4f8fd}
.k .n{font-family:'Barlow Condensed',sans-serif;font-size:34px;line-height:1;color:#13315c}
.k .t{font-size:11.5px;color:#5b6b82;margin-top:4px;font-weight:600}
.k.v{background:#eefbf2;border-color:#b9e6c8}.k.v .n{color:#16a34a}
.k.r{background:#fdeded;border-color:#f6c6c6}.k.r .n{color:#dc2626}
.g3{display:grid;grid-template-columns:1.25fr .85fr .95fr;gap:13px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.bar{display:flex;align-items:center;gap:9px;margin-bottom:9px}
.bar .et{flex:0 0 34%;font-size:12.5px;font-weight:600}
.bar .et i{display:block;font-style:normal;font-weight:400;color:#7b8798;font-size:11px}
.bar .tr{flex:1;background:#eef2f8;border-radius:4px;height:19px}
.bar .tr>div{height:100%;border-radius:4px;background:linear-gradient(90deg,#2f6fb8,#4d8fd6)}
.bar .vl{flex:0 0 52px;text-align:right;font-weight:700;font-size:12.5px;color:#13315c}
table{width:100%;border-collapse:collapse;font-size:11.5px}
th{background:#eaf0f8;color:#13315c;font-weight:700;padding:6px;text-align:left;border:1px solid #d3dceb}
td{padding:5px 6px;border:1px solid #e3e9f2}
.dona{display:flex;flex-direction:column;align-items:center;gap:11px}
.circ{width:150px;height:150px;border-radius:50%;position:relative}
.circ i{position:absolute;inset:32px;background:#fff;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-style:normal}
.circ i b{font-family:'Barlow Condensed',sans-serif;font-size:34px;color:#13315c;line-height:1}
.circ i span{font-size:10.5px;color:#6b7a8f;text-align:center;line-height:1.25}
.leg{width:100%}.leg div{display:flex;align-items:center;gap:7px;font-size:11.5px;padding:3px 0}
.leg em{width:11px;height:11px;border-radius:3px;flex:0 0 auto}.leg b{margin-left:auto}
.nota{border-radius:7px;padding:10px 12px;font-size:11.5px;margin-top:10px;line-height:1.4}
.nota.mal{background:#fdeded;border:1px solid #f6c6c6;color:#8f1d1d}
.nota.bien{background:#eefbf2;border:1px solid #b9e6c8;color:#15683a}
.mini h4{font-size:12.5px;margin-bottom:7px;padding:5px 9px;border-radius:5px}
.mini.up h4{background:#eefbf2;color:#15683a}.mini.dn h4{background:#fdeded;color:#8f1d1d}
.hall{display:grid;grid-template-columns:repeat(4,1fr);gap:11px}
.h{border:1px solid #dbe4f0;border-radius:8px;padding:12px;background:#f9fbfe}
.h .n{font-family:'Barlow Condensed',sans-serif;font-size:30px;color:#13315c;line-height:1}
.h .t{font-size:10.8px;color:#5b6b82;margin-top:5px;line-height:1.35}
.concl{background:#f4f8fd;border:1px solid #dbe4f0;border-radius:8px;padding:13px;font-size:12.5px;line-height:1.55}
.pie{background:#13315c;color:#fff;padding:12px 22px;display:flex;justify-content:space-between;align-items:center;font-size:11px;line-height:1.5}
.pie .lm{font-family:'Barlow Condensed',sans-serif;letter-spacing:2.5px;opacity:.8}
@media print{body{background:#fff;padding:0}.hoja{box-shadow:none}}
</style></head><body><div class="hoja">
<div class="top"><img src="${LOGO_B64}" alt="">
<div><h1>ASISTENCIAS ${R.anio}</h1>
<h2>Quinta Compañía "Germania" — Cuerpo de Bomberos de Villarrica</h2>
<div class="lema">DISCIPLINA &nbsp;•&nbsp; SERVICIO &nbsp;•&nbsp; COMPAÑERISMO</div></div>
<div class="corte">${esc(R.modo==="acum"?"Acumulado a la fecha":R.modo==="anio"?"Año completo":"Período")}<b>${fmtDateLong(R.hasta)}</b></div></div>
<div class="cuerpo">

<div class="sec"><h3>1. RESUMEN GENERAL</h3><div class="in"><div class="kpis">
<div class="k"><div class="n">${r.N}</div><div class="t">Actividades registradas</div></div>
<div class="k"><div class="n">${ROSTER.length}</div><div class="t">Dotación listada</div></div>
<div class="k v"><div class="n">${activos.length}</div><div class="t">Voluntarios activos</div></div>
<div class="k r"><div class="n">${bajas}</div><div class="t">Bajas</div></div>
<div class="k"><div class="n">${f1(r.global)}%</div><div class="t">Asistencia activa global</div></div>
</div></div></div>

<div class="g3">
<div class="sec"><h3>2. ASISTENCIA POR TIPO</h3><div class="in">
${tipos.map(t=>`<div class="bar"><div class="et">${esc(t.t)}<i>${t.n} actividad${t.n===1?"":"es"}</i></div>
<div class="tr"><div style="width:${(t.p/maxBar*100).toFixed(0)}%"></div></div><div class="vl">${f1(t.tasa)}%</div></div>`).join("")}
<table><tr><th>Tipo</th><th>N°</th><th>Asist.</th><th>Tasa</th></tr>
${tipos.map(t=>`<tr><td>${esc(t.t)}</td><td>${t.n}</td><td>${t.p}</td><td><b>${f1(t.tasa)}%</b></td></tr>`).join("")}</table>
${tipos.length>1?`<div class="nota mal"><b>Brecha principal:</b> ${esc(peor.t)} alcanza ${f1(peor.tasa)}% frente a ${esc(mejor.t)} con ${f1(mejor.tasa)}%.</div>`:""}
</div></div>

<div class="sec"><h3>3. DISTRIBUCIÓN INDIVIDUAL</h3><div class="in"><div class="dona">
<div class="circ" style="background:conic-gradient(${seg.join(",")})"><i><b>${activos.length}</b><span>voluntarios<br>activos</span></i></div>
<div class="leg">${grupos.map(g=>`<div><em style="background:${g.col}"></em>${g.et}<b>${g.c} (${f1(pct(g.c,activos.length))}%)</b></div>`).join("")}</div>
</div></div></div>

<div class="sec"><h3>4. EVOLUCIÓN MENSUAL</h3><div class="in">
${mk.map(m=>{const t=pct(r.meses[m].pres,r.meses[m].n*activos.length);
return `<div class="bar"><div class="et" style="flex:0 0 30%">${MESES_NOM[m-1]}<i>${r.meses[m].n} act.</i></div>
<div class="tr"><div style="width:${(r.meses[m].n/maxMes*100).toFixed(0)}%"></div></div><div class="vl">${f1(t)}%</div></div>`}).join("")}
${mejorMes?`<div class="nota bien"><b>${MESES_NOM[mejorMes-1]}</b> presenta la mayor tasa: <b>${f1(pct(r.meses[mejorMes].pres,r.meses[mejorMes].n*activos.length))}%</b>.</div>`:""}
</div></div></div>

<div class="g2">
<div class="sec"><h3>5. RANKING — MAYOR ASISTENCIA</h3><div class="in">
<table><tr><th>#</th><th>Voluntario/a</th><th>Cargo</th><th>%</th></tr>
${r.porPersona.slice(0,5).map((x,i)=>`<tr><td>${i+1}</td><td>${esc(nombreCompleto(x.m))}</td><td>${esc(x.m.cargo)}</td><td><b>${f1(x.p)}%</b></td></tr>`).join("")}</table>
<div class="nota bien"><b>${r.porPersona.filter(x=>x.p>=50).length} voluntarios activos</b> alcanzan al menos 50% de asistencia.</div>
</div></div>

<div class="sec"><h3>6. CONVOCATORIA DE ACTIVIDADES</h3><div class="in"><div class="g2">
<div class="mini up"><h4>Mayor convocatoria</h4>
<table><tr><th>Fecha</th><th>Actividad</th><th>N°</th></tr>
${r.conv.slice(0,3).map(x=>`<tr><td>${x.pt.date.slice(8)}-${x.pt.date.slice(5,7)}</td><td>${esc(cap(x.pt.detalle||x.pt.tipo))}</td><td><b>${x.c}</b></td></tr>`).join("")}</table></div>
<div class="mini dn"><h4>Menor convocatoria</h4>
<table><tr><th>Fecha</th><th>Actividad</th><th>N°</th></tr>
${r.conv.slice(-3).reverse().map(x=>`<tr><td>${x.pt.date.slice(8)}-${x.pt.date.slice(5,7)}</td><td>${esc(cap(x.pt.detalle||x.pt.tipo))}</td><td><b>${x.c}</b></td></tr>`).join("")}</table></div>
</div></div></div></div>

<div class="sec"><h3>7. HALLAZGOS CLAVE</h3><div class="in"><div class="hall">
<div class="h"><div class="n">${r.totPres}</div><div class="t">asistencias sobre <b>${r.posibles}</b> participaciones posibles</div></div>
<div class="h"><div class="n">${f1(r.mediana)}%</div><div class="t">es la mediana de asistencia individual</div></div>
<div class="h"><div class="n">${r.porPersona.filter(x=>x.p<20).length}</div><div class="t">voluntarios activos bajo 20% de asistencia</div></div>
<div class="h"><div class="n">${(r.totPres/r.N).toFixed(1)}</div><div class="t">voluntarios concurren en promedio a cada actividad</div></div>
</div></div></div>

<div class="sec"><h3>8. CONCLUSIÓN</h3><div class="in"><div class="concl">
${esc(R.etiqueta||"En el período analizado")}, la Quinta Compañía registra una asistencia activa global de <b>${f1(r.global)}%</b>, con ${r.N} actividades y ${activos.length} voluntarios activos.
${tipos.length>1?`La actividad con menor participación es ${esc(peor.t.toLowerCase())} (${f1(peor.tasa)}%), frente a ${esc(mejor.t.toLowerCase())} que alcanza ${f1(mejor.tasa)}%.`:""}
${r.porPersona.filter(x=>x.p<20).length} voluntarios se mantienen bajo el 20% de asistencia.
</div></div></div>

</div>
<div class="pie"><div><b>Desarrollado por la 5ta Compañía "Germania"</b> · Cuerpo de Bomberos de Villarrica · Chile<br>
<span style="opacity:.72">Fuente: registro de asistencias de la Compañía · generado el ${new Date().toLocaleDateString("es-CL")}</span></div>
<div class="lm">VOLUNTAD HOY, COMUNIDAD SIEMPRE</div></div>
</div></body></html>`;
}

on("pnInfo","click",async()=>{
  await poblarSelectoresPanel();
  const R=rangoPanel();
  R.anio=R.desde.slice(0,4);
  const {partes,activos,stats}=await datosPanel(R.desde,R.hasta);
  const r=resumen(partes,activos,stats);
  if(!r.N){ alert("No hay actividades registradas en ese período."); return; }
  const doc=construirInfografia(R,r,activos);
  const blob=new Blob([doc],{type:"text/html;charset=utf-8"});
  await entregarArchivo(blob,`infografia_${slug(R.etiqueta)}.html`,R.etiqueta,"Infografía generada");
});

on("pnCsv","click",async()=>{
  const R=rangoPanel();
  const {partes,activos,stats}=await datosPanel(R.desde,R.hasta);
  const r=resumen(partes,activos,stats);
  const rows=[["Período",R.etiqueta],["Actividades",r.N],[],
    ["N°","Clave","Voluntario","Cargo","Asistencias","Faltas","% Asistencia"]];
  r.porPersona.forEach(x=>rows.push([x.m.n||"",x.m.clave||"",nombreCompleto(x.m),x.m.cargo,
    x.pres,r.N-x.pres,x.p.toFixed(1)+"%"]));
  const csv=rows.map(f=>f.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(";")).join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});
  await entregarArchivo(blob,`informe_${slug(R.etiqueta)}.csv`,R.etiqueta,"Planilla generada");
});

/* ============ OFICIALIDAD ============ */
function renderCargoOptions(){
  document.getElementById("cargoOptions").innerHTML =
    CARGOS.concat(["Voluntario","Aspirante","Postulante"]).map(c=>`<option value="${esc(c)}"></option>`).join("");
}
function renderOficialidad(asignaciones){
  const body=document.getElementById("oficialidadBody"); body.innerHTML="";
  const opts = '<option value="">— sin asignar —</option>' +
    sortedRoster(true).map(p=>`<option value="${p.id}">${esc(nombreCompleto(p))}</option>`).join("");
  CARGOS.forEach(cargo=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${esc(cargo)}</td>
      <td><select class="ofi-select" data-cargo="${esc(cargo)}">${opts}</select></td>
      <td><button class="del-btn" data-del-cargo="${esc(cargo)}" title="Quitar cargo">🗑</button></td>`;
    body.appendChild(tr);
    const sel=tr.querySelector("select");
    if(asignaciones && asignaciones[cargo]) sel.value=asignaciones[cargo];
  });
  body.querySelectorAll("[data-del-cargo]").forEach(b=>b.addEventListener("click",async()=>{
    CARGOS=CARGOS.filter(c=>c!==b.dataset.delCargo);
    await saveCargos(); renderCargoOptions(); loadOficialidadYear();
  }));
}
/* Claves de la Orden del Dia 010/2026 (25 de enero de 2026), fuente oficial
   de quien ocupa cada cargo. No se usa el campo "cargo" de la nomina porque
   ese campo puede no estar actualizado (ej: todos quedaron en "Voluntario"
   tras un ingreso masivo) — la clave personal es el dato estable. */
const CLAVE_CARGO_2026={
  "75":"Director","45":"Capitán","9":"Tesorero General",
  "501":"Teniente 1","502":"Teniente 2","503":"Teniente 3",
  "504":"Ayudante","505":"Jefe de Máquinas","506":"Secretario","507":"Tesorero"
};
/* Rescata automaticamente quien ocupa cada cargo hoy, para precargar la
   Oficialidad de un anio que aun no se ha guardado */
function oficialidadDesdeNomina(){
  const asign={};
  CARGOS.forEach(cargo=>{
    const clave=Object.keys(CLAVE_CARGO_2026).find(k=>CLAVE_CARGO_2026[k]===cargo);
    const m=clave?ROSTER.find(p=>p.activo!==false && p.clave===clave):null;
    if(m) asign[cargo]=m.id;
  });
  return asign;
}
async function loadOficialidadYear(){
  const input=document.getElementById("anioOficialidad");
  const msg=document.getElementById("oficialidadMsg");
  const anio=String(input?.value||"").trim();
  if(!/^\d{4}$/.test(anio)||Number(anio)<2023||Number(anio)>2100){
    if(msg){msg.textContent="Indica un año válido entre 2023 y 2100.";msg.classList.add("err");}
    return;
  }
  if(msg){msg.textContent="Cargando "+anio+"…";msg.classList.remove("err");}
  try{
    const data=await sGet("oficialidad:"+anio,null);
    renderOficialidad(data||oficialidadDesdeNomina());
    if(msg) msg.textContent=data?"Oficialidad guardada para "+anio+".":"No hay oficialidad guardada para "+anio+" — se rescataron automáticamente los cargos vigentes en la nómina. Revisa y guarda para dejarlo registrado.";
  }catch(e){
    console.error("No se pudo cargar oficialidad",e);
    renderOficialidad({});
    if(msg){msg.textContent="No fue posible cargar la oficialidad de "+anio+".";msg.classList.add("err");}
  }
}
on("anioOficialidad","change",loadOficialidadYear);
on("agregarCargoBtn","click",async()=>{
  const inp=document.getElementById("nuevoCargoInput"), v=inp.value.trim();
  if(!v||CARGOS.includes(v)) return;
  CARGOS.push(v); await saveCargos(); inp.value="";
  renderCargoOptions(); loadOficialidadYear();
});
on("guardarOficialidadBtn","click",async()=>{
  const anio=document.getElementById("anioOficialidad").value;
  const msg=document.getElementById("oficialidadMsg");
  if(!anio){ msg.textContent="Indica el año."; msg.classList.add("err"); return; }
  const asign={};
  document.querySelectorAll(".ofi-select").forEach(sel=>{ if(sel.value) asign[sel.dataset.cargo]=sel.value; });
  await sSet("oficialidad:"+anio,asign);
  // aplicar a la nómina: limpiar cargos de oficialidad previos y asignar los nuevos
  const asignados=new Set(Object.values(asign));
  ROSTER.forEach(m=>{
    if(cargoPriority(m.cargo)!==99 && !asignados.has(m.id)){
      m.cargo = (m.categoria==="Aspirante") ? "Aspirante" : "Voluntario";
    }
  });
  Object.entries(asign).forEach(([cargo,id])=>{ const m=ROSTER.find(x=>x.id===id); if(m) m.cargo=cargo; });
  await saveRoster();
  msg.classList.remove("err");
  msg.textContent=`Oficialidad ${anio} guardada y aplicada a la nómina.`;
  renderListaRows(); renderCfgRoster(); renderRegistradoPorOptions(); renderCursoMiembroSelect(); renderSvTipoOptions();
});

/* ============ FICHA DE INGRESO ============ */
on("registrarIngresoBtn","click",async()=>{
  const g=id=>document.getElementById(id).value.trim();
  const msg=document.getElementById("fiMsg");
  if(!g("fiNombre")||!g("fiApPat")){ msg.textContent="Nombre y apellido paterno son obligatorios."; msg.classList.add("err"); return; }
  const cat=document.getElementById("fiCategoria").value;
  ROSTER.push({
    id:uid(), n:null,
    nombre:g("fiNombre"), apellidoPaterno:g("fiApPat"), apellidoMaterno:g("fiApMat"),
    rut:g("fiRut"), fechaNacimiento:g("fiNac"), fechaIngreso:g("fiIngreso")||todayISO(),
    categoria:cat, formaIngreso:document.getElementById("fiForma").value, origen:g("fiOrigen"),
    especialidad:g("fiEspecialidad"),
    telefono:g("fiTelefono"), cargo:g("fiCargo")|| (cat==="Aspirante"?"Aspirante":cat==="Postulante"?"Postulante":"Voluntario"),
    activo:true, cursos:{}
  });
  await renumerarYGuardar();
  const nuevo=ROSTER.find(m=>m.apellidoPaterno===g("fiApPat")&&m.nombre===g("fiNombre"));
  msg.classList.remove("err");
  msg.textContent=`${g("fiNombre")} ${g("fiApPat")} fue registrado con el N° ${nuevo?nuevo.n:""}.`;
  ["fiNombre","fiApPat","fiApMat","fiRut","fiNac","fiIngreso","fiOrigen","fiEspecialidad","fiCargo","fiTelefono"].forEach(i=>document.getElementById(i).value="");
  refrescarTodo();
});

/* ============ NÓMINA ============ */
const CATEGORIAS=["Postulante","Aspirante","Operativo","No operativo","Honorario"];
function renderCfgRoster(){
  const body=document.getElementById("cfgRosterBody"); body.innerHTML="";
  sortedRoster(true).forEach(p=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td class="n-col">${p.activo===false?"—":(p.n||"")}</td>
      <td><input type="text" data-f="clave" value="${esc(p.clave||"")}" style="width:56px;"></td>
      <td><input type="text" data-f="nombre" value="${esc(p.nombre)}"></td>
      <td><input type="text" data-f="apellidoPaterno" value="${esc(p.apellidoPaterno)}"></td>
      <td><input type="text" data-f="apellidoMaterno" value="${esc(p.apellidoMaterno)}"></td>
      <td><input type="text" data-f="rut" value="${esc(p.rut)}"></td>
      <td><input type="text" data-f="telefono" value="${esc(p.telefono||"")}"></td>
      <td><input type="text" data-f="cargo" value="${esc(p.cargo)}" list="cargoOptions"></td>
      <td><select data-f="categoria">${CATEGORIAS.map(c=>`<option value="${c}" ${p.categoria===c?"selected":""}>${c}</option>`).join("")}</select></td>
      <td><input type="date" data-f="fechaIngreso" value="${esc(p.fechaIngreso||FOUNDING_DATE)}"></td>
      <td><input type="text" data-f="origen" value="${esc(p.origen||"")}" placeholder="Compañía de origen"></td>
      <td><input type="text" data-f="especialidad" value="${esc(p.especialidad||"")}" placeholder="Especialidad"></td>
      <td style="text-align:center;"><input type="checkbox" data-f="conductor" ${p.conductor?"checked":""} title="Cumple función de conductor de la unidad"></td>
      <td style="text-align:center;"><input type="checkbox" data-f="operativoRadio" ${p.operativoRadio?"checked":""} title="Oficial operativo autorizado a identificarse por clave en enlace radial"></td>
      <td style="text-align:center;"><input type="checkbox" data-f="activo" ${p.activo!==false?"checked":""}></td>
      <td><button class="del-btn" data-del="${p.id}" title="Eliminar">🗑</button></td>`;
    tr.querySelectorAll("[data-f]").forEach(inp=>inp.addEventListener("change",async()=>{
      const f=inp.dataset.f;
      let v;
      if(f==="activo"||f==="operativoRadio"||f==="conductor") v=inp.checked;
      else v=inp.value;
      const m=ROSTER.find(x=>x.id===p.id);
      if(m){
        m[f]=v;
        if(f==="fechaIngreso"||f==="activo") await renumerarYGuardar(); else await saveRoster();
        renderListaRows(); renderRegistradoPorOptions(); renderCursoMiembroSelect(); renderBajasSelects(); renderBajasList();
        if(f==="cargo"||f==="fechaIngreso"||f==="activo") renderCfgRoster();
      }
    }));
    tr.querySelector("[data-del]").addEventListener("click",async()=>{
      if(!confirm(`¿Eliminar a ${nombreCompleto(p)} de la nómina? El historial ya guardado no se modifica.\n\nSi solo se retiró de la Compañía, es mejor darlo de baja en la sección "Bajas y eliminación".`)) return;
      ROSTER=ROSTER.filter(x=>x.id!==p.id); await renumerarYGuardar();
      refrescarTodo();
    });
    body.appendChild(tr);
  });
}

/* ============ FICHA Y HOJA DE VIDA ============ */
function hvActual(){ return ROSTER.find(m=>m.id===document.getElementById("hvMiembro").value); }

function renderHvSelect(){
  const sel=document.getElementById("hvMiembro"), cur=sel.value;
  sel.innerHTML=sortedRoster(true).map(p=>{
    const a=acronimoCargo(p);
    return `<option value="${p.id}">N°${p.n} — ${esc(nombreCompleto(p))}${a?" ("+esc(a)+")":""}${p.activo===false?" [baja]":""}</option>`;
  }).join("");
  if(ROSTER.find(m=>m.id===cur)) sel.value=cur;
}

function renderHvInstitucional(){
  const m=hvActual(), box=document.getElementById("hvInstitucional");
  if(!m){ box.innerHTML='<div class="empty">Selecciona un integrante.</div>'; return; }
  const filas=[
    ["N° de lista", m.n||"—"],
    ["Clave radial", m.clave||"—"],
    ["Nombre completo", nombreCompleto(m)],
    ["RUT", m.rut||"—"],
    ["Autorizado a enlace radial", m.operativoRadio?"Sí (oficial operativo)":"No"],
    ["Conductor de unidad", m.conductor?"Sí":"No"],
    ["Cargo actual", m.cargo||"—"],
    ["Calidad", m.categoria||"—"],
    ["Fecha de ingreso", m.fechaIngreso||"—"],
    ["Forma de ingreso", m.formaIngreso||"—"],
    ["Procedencia", m.origen||"—"],
    ["Especialidad", m.especialidad||"—"],
    ["Situación", m.activo===false ? `Dado de baja (${m.motivoBaja||"sin motivo"}${m.fechaBaja?", "+m.fechaBaja:""})` : "Activo"]
  ];
  box.innerHTML='<table><tbody>'+filas.map(f=>
    `<tr><td style="color:var(--muted);width:44%;">${esc(f[0])}</td><td class="name-col">${esc(f[1])}</td></tr>`).join('')+'</tbody></table>';
}

function renderHvDatos(){
  const m=hvActual();
  document.querySelectorAll("[data-hv]").forEach(inp=>{
    inp.value = m ? (m[inp.dataset.hv]||"") : "";
    inp.disabled = !m;
  });
}
document.querySelectorAll("[data-hv]").forEach(inp=>{
  inp.addEventListener("change",async()=>{
    const m=hvActual(); if(!m) return;
    m[inp.dataset.hv]=inp.value;
    await saveRoster();
    if(inp.dataset.hv==="fechaNacimiento") renderHvInstitucional();
  });
});

function renderHvAnotaciones(){
  const m=hvActual(), box=document.getElementById("hvAnotaciones");
  if(!m){ box.innerHTML=""; return; }
  const an=(m.anotaciones||[]).slice().sort((a,b)=>(a.fecha||"")<(b.fecha||"")?1:-1);
  if(!an.length){ box.innerHTML='<div class="empty">Sin anotaciones registradas.</div>'; return; }
  box.innerHTML=an.map((a,i)=>`
    <div class="hist-item">
      <div>
        <div class="hist-date"><span class="badge">${esc(a.tipo)}</span> ${esc(a.fecha||"sin fecha")}</div>
        <div class="hist-acto">${esc(a.detalle||"")}</div>
      </div>
      <div class="hist-right"><button class="del-btn" data-del-an="${esc(a.id)}" title="Eliminar">🗑</button></div>
    </div>`).join("");
  box.querySelectorAll("[data-del-an]").forEach(b=>b.addEventListener("click",async()=>{
    if(!confirm("¿Eliminar esta anotación de la hoja de vida?")) return;
    m.anotaciones=(m.anotaciones||[]).filter(x=>x.id!==b.dataset.delAn);
    await saveRoster(); renderHvAnotaciones();
  }));
}

on("hvAgregarBtn","click",async()=>{
  const m=hvActual(); if(!m) return;
  const detalle=document.getElementById("hvDetalle").value.trim();
  if(!detalle) return;
  if(!m.anotaciones) m.anotaciones=[];
  m.anotaciones.push({
    id:uid(),
    tipo:document.getElementById("hvTipo").value,
    fecha:document.getElementById("hvFecha").value||todayISO(),
    detalle
  });
  await saveRoster();
  document.getElementById("hvDetalle").value="";
  renderHvAnotaciones();
});

async function renderHvResumen(){
  const m=hvActual(), box=document.getElementById("hvResumen");
  if(!m){ box.innerHTML=""; return; }
  const idx=await getIndex();
  let pres=0,just=0,aus=0;
  for(const it of idx){
    const p=await getParte(it.clave); if(!p||!p.records) continue;
    const s=p.records[m.id]; if(!s) continue;
    if(s==="presente") pres++; else if(s==="justificado") just++; else aus++;
  }
  const total=pres+just+aus;
  const c=statsCursos(m);
  box.innerHTML=`
    <div class="summary-row">
      <div class="summary-item"><div class="big">${total}</div><div class="lbl">Citaciones registradas</div></div>
      <div class="summary-item"><div class="big">${pres}</div><div class="lbl">Presente</div></div>
      <div class="summary-item"><div class="big">${just}</div><div class="lbl">Justificado</div></div>
      <div class="summary-item"><div class="big">${aus}</div><div class="lbl">Ausente</div></div>
      <div class="summary-item"><div class="big">${total?Math.round(pres/total*100):0}%</div><div class="lbl">Asistencia</div></div>
    </div>
    <div class="summary-row" style="margin-bottom:0;">
      <div class="summary-item"><div class="big">${c.obligOk}/${c.oblig}</div><div class="lbl">Cursos obligatorios</div></div>
      <div class="summary-item"><div class="big">${c.ok}/${c.total}</div><div class="lbl">Total malla ANB</div></div>
    </div>`;
}

function renderHoja(){
  renderHvInstitucional(); renderHvDatos(); renderHvAnotaciones(); renderHvResumen();
}
on("hvMiembro","change",renderHoja);

on("hvPdfBtn","click",async()=>{
  const m=hvActual(); if(!m) return;
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  pdfHeader(doc,"HOJA DE VIDA DEL VOLUNTARIO");
  let y=38;
  doc.setFont("helvetica","bold"); doc.setFontSize(12);
  doc.text(`N° ${m.n} · ${nombreCompleto(m)}`,14,y); y+=4;

  doc.autoTable({
    startY:y+2, styles:{fontSize:9}, headStyles:{fillColor:[179,36,28]},
    head:[["Antecedentes institucionales",""]],
    body:[
      ["Clave radial",m.clave||"—"],["RUT",m.rut||"—"],["Cargo actual",m.cargo||"—"],["Conductor de unidad",m.conductor?"Sí":"No"],["Calidad",m.categoria||"—"],
      ["Fecha de ingreso",m.fechaIngreso||"—"],["Forma de ingreso",m.formaIngreso||"—"],
      ["Procedencia",m.origen||"—"],["Especialidad",m.especialidad||"—"],
      ["Situación", m.activo===false?`Dado de baja (${m.motivoBaja||"sin motivo"})`:"Activo"]
    ]
  });

  doc.autoTable({
    startY:doc.lastAutoTable.finalY+6, styles:{fontSize:9}, headStyles:{fillColor:[100,90,80]},
    head:[["Datos personales",""]],
    body:[
      ["Fecha de nacimiento",m.fechaNacimiento||"—"],["Estado civil",m.estadoCivil||"—"],
      ["Profesión u oficio",m.profesion||"—"],["Teléfono",m.telefono||"—"],
      ["Correo",m.email||"—"],["Dirección",m.direccion||"—"],
      ["Grupo sanguíneo",m.grupoSanguineo||"—"],["Alergias / condiciones",m.alergias||"—"],
      ["Contacto de emergencia",[m.emergenciaNombre,m.emergenciaTelefono,m.emergenciaRelacion].filter(Boolean).join(" · ")||"—"]
    ]
  });

  const an=(m.anotaciones||[]).slice().sort((a,b)=>(a.fecha||"")<(b.fecha||"")?1:-1);
  doc.autoTable({
    startY:doc.lastAutoTable.finalY+6, styles:{fontSize:9}, headStyles:{fillColor:[179,36,28]},
    head:[["Fecha","Tipo","Detalle"]],
    body: an.length ? an.map(a=>[a.fecha||"—",a.tipo,a.detalle]) : [["—","—","Sin anotaciones registradas"]]
  });

  const idx=await getIndex();
  let pres=0,just=0,aus=0;
  for(const it of idx){
    const p=await getParte(it.clave); if(!p||!p.records) continue;
    const s=p.records[m.id]; if(!s) continue;
    if(s==="presente") pres++; else if(s==="justificado") just++; else aus++;
  }
  const total=pres+just+aus, c=statsCursos(m);
  doc.autoTable({
    startY:doc.lastAutoTable.finalY+6, styles:{fontSize:9}, headStyles:{fillColor:[100,90,80]},
    head:[["Resumen de servicio",""]],
    body:[
      ["Citaciones registradas",String(total)],
      ["Presente / Justificado / Ausente",`${pres} / ${just} / ${aus}`],
      ["Porcentaje de asistencia",(total?Math.round(pres/total*100):0)+"%"],
      ["Cursos obligatorios",`${c.obligOk} de ${c.oblig}`],
      ["Avance malla ANB",`${c.ok} de ${c.total}`]
    ]
  });

  let fy=doc.lastAutoTable.finalY+18;
  if(fy>250){ doc.addPage(); fy=40; }
  doc.setFontSize(9);
  doc.line(20,fy,85,fy); doc.text("Secretario",20,fy+5);
  doc.line(115,fy,180,fy); doc.text("Director",115,fy+5);
  doc.text(`Generado el ${new Date().toLocaleString("es-CL")}`,14,fy+18);

  await sharePdfDoc(doc,`hoja_de_vida_${m.n}_${slug(nombreCompleto(m))}.pdf`,`Hoja de vida - ${nombreCompleto(m)}`);
});

/* ============ BAJAS ============ */
on("ordenModo","change",async()=>{
  ORDEN_MODO=document.getElementById("ordenModo").value;
  await sSet("orden:v1",ORDEN_MODO);
  refrescarTodo();
});

function renderBajasSelects(){
  const act=document.getElementById("bajaMiembro"), bor=document.getElementById("borrarMiembro");
  if(!act||!bor) return;
  const todos=sortedRoster(true);
  const vacio='<option value="">— seleccionar integrante —</option>';
  act.innerHTML = vacio + todos.map(p=>`<option value="${p.id}">${p.n?"N°"+p.n+" — ":""}${esc(nombreCompleto(p))}${p.activo===false?" (dado de baja)":""}</option>`).join("");
  bor.innerHTML = vacio + todos.map(p=>`<option value="${p.id}">${p.n?"N°"+p.n+" — ":""}${esc(nombreCompleto(p))} — ${esc(p.cargo)}</option>`).join("");
  act.value=""; bor.value="";
}

/* ---- Acceso restringido a la oficialidad ---- */
let bajasDesbloqueado=false;

async function autenticarOficialidad(pin){
  try{
    const r=await fetch("/api/auth/officiality",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({pin})});
    if(r.ok) return {ok:true};
    if(r.status===503) return {ok:false,motivo:"no_configurado"};
    return {ok:false,motivo:"clave_incorrecta"};
  }catch(e){ return {ok:false,motivo:"conexion"}; }
}
function mensajeOficialidad(motivo){
  if(motivo==="no_configurado") return "El sistema de acceso no está configurado (falta clave inicial en el servidor). Avisa al encargado técnico.";
  if(motivo==="conexion") return "No fue posible conectar. Verifica tu conexión e inténtalo de nuevo.";
  return "Clave incorrecta.";
}
function pintarCandado(){
  const cand=document.getElementById("configCandado"), cont=document.getElementById("configContenido");
  if(!cand||!cont) return;
  cand.style.display = bajasDesbloqueado ? "none" : "block";
  cont.style.display = bajasDesbloqueado ? "block" : "none";
}
on("bajaEntrarBtn","click",async()=>{
  const inp=document.getElementById("bajaClave"), msg=document.getElementById("bajaClaveMsg");
  const res = await autenticarOficialidad(inp.value.trim());
  msg.classList.toggle("err",!res.ok);
  if(res.ok){
    bajasDesbloqueado=true; inp.value=""; msg.textContent="";
    pintarCandado(); renderBajasSelects(); renderBajasList();
  } else {
    msg.textContent=mensajeOficialidad(res.motivo);
    inp.value="";
  }
});
on("bajaClave","keydown",e=>{ if(e.key==="Enter") document.getElementById("bajaEntrarBtn").click(); });
on("bajaSalirBtn","click",async()=>{
  try{ await fetch("/api/auth/officiality",{method:"DELETE"}); }catch(e){}
  bajasDesbloqueado=false; pintarCandado();
});
on("bajaCambiarClaveBtn","click",async()=>{
  const nueva=prompt("Nueva clave de Oficialidad (4 a 12 dígitos):");
  if(nueva===null) return;
  if(!/^\d{4,12}$/.test(nueva)){ alert("La clave debe tener entre 4 y 12 dígitos."); return; }
  const confirma=prompt("Repita la nueva clave:");
  if(confirma!==nueva){ alert("Las claves no coinciden."); return; }
  try{
    const r=await fetch("/api/auth/officiality/change",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({pin:nueva})});
    if(!r.ok) throw new Error("change_failed");
    alert("Clave de Oficialidad actualizada.");
  }catch(e){ alert("No fue posible cambiar la clave. Verifique la conexión e inténtelo nuevamente."); }
});
function renderBajasList(){
  const box=document.getElementById("bajasList");
  const bajas=ROSTER.filter(m=>m.activo===false);
  if(!bajas.length){ box.innerHTML='<div class="empty">No hay integrantes dados de baja.</div>'; return; }
  box.innerHTML = bajas.map(m=>`
    <div class="hist-item">
      <div>
        <div class="hist-date"><span class="ac">N° ${m.n||"—"}</span> ${esc(nombreCompleto(m))}</div>
        <div class="hist-acto">${esc(m.motivoBaja||"Sin motivo registrado")}${m.fechaBaja?" · "+esc(m.fechaBaja):""}${m.obsBaja?" · "+esc(m.obsBaja):""}</div>
      </div>
      <div class="hist-right"><span class="badge pend">N° retirado</span></div>
    </div>`).join("")
    + `<div class="foot-note">Al dar de baja a un integrante, la numeración se corre: los que siguen suben un lugar en la lista.</div>`;
}
on("darBajaBtn","click",async()=>{
  const id=document.getElementById("bajaMiembro").value;
  const m=id?ROSTER.find(x=>x.id===id):null;
  const msg=document.getElementById("bajaMsg");
  if(!m){ msg.textContent="Primero selecciona un integrante de la lista."; msg.classList.add("err"); return; }
  if(!confirm(`¿Dar de baja a ${nombreCompleto(m)}?\n\nDejará de aparecer al pasar lista, pero se conserva su historial.`)) return;
  m.activo=false;
  m.motivoBaja=document.getElementById("bajaMotivo").value;
  m.fechaBaja=document.getElementById("bajaFecha").value||todayISO();
  m.obsBaja=document.getElementById("bajaObs").value.trim();
  await renumerarYGuardar();
  msg.classList.remove("err");
  msg.textContent=`${nombreCompleto(m)} fue dado de baja (${m.motivoBaja}).`;
  document.getElementById("bajaObs").value="";
  refrescarTodo();
});
on("reactivarBtn","click",async()=>{
  const id=document.getElementById("bajaMiembro").value;
  const m=id?ROSTER.find(x=>x.id===id):null;
  const msg=document.getElementById("bajaMsg");
  if(!m){ msg.textContent="Primero selecciona un integrante de la lista."; msg.classList.add("err"); return; }
  m.activo=true; delete m.motivoBaja; delete m.fechaBaja; delete m.obsBaja;
  await renumerarYGuardar();
  msg.classList.remove("err");
  msg.textContent=`${nombreCompleto(m)} fue reactivado y vuelve a aparecer al pasar lista.`;
  refrescarTodo();
});
on("borrarMiembroBtn","click",async()=>{
  const id=document.getElementById("borrarMiembro").value;
  const m=id?ROSTER.find(x=>x.id===id):null;
  const msg=document.getElementById("borrarMsg");
  if(!m){ msg.textContent="Primero selecciona un integrante de la lista."; msg.classList.add("err"); return; }
  if(!confirm(`¿Eliminar definitivamente a ${nombreCompleto(m)} de la nómina?\n\nEsta acción no se puede deshacer. Si solo se retiró de la Compañía, usa "Dar de baja" en lugar de eliminar.`)) return;
  ROSTER=ROSTER.filter(x=>x.id!==id);
  await renumerarYGuardar();
  msg.classList.remove("err");
  msg.textContent=`${nombreCompleto(m)} fue eliminado de la nómina.`;
  refrescarTodo();
});

function refrescarTodo(){
  renderListaRows(); renderRegistradoPorOptions(); renderCfgRoster();
  renderCursoMiembroSelect(); renderCursos(); renderCursosCompania();
  renderBajasSelects(); renderBajasList();
  renderHvSelect(); renderHoja();
}

/* ============ CURSOS ============ */
function renderCursoMiembroSelect(){
  const sel=document.getElementById("cursoMiembro"), cur=sel.value;
  sel.innerHTML=sortedRoster(true).map(p=>`<option value="${p.id}">${esc(nombreCompleto(p))} — ${esc(p.cargo)}</option>`).join("");
  if(cur && ROSTER.find(m=>m.id===cur)) sel.value=cur;
}
function cursoState(m,curso){ return (m.cursos&&m.cursos[curso])||null; }
function statsCursos(m){
  let oblig=0,obligOk=0,total=0,ok=0;
  MALLA.forEach(g=>g.cursos.forEach(c=>{
    total++; const done=!!cursoState(m,c); if(done) ok++;
    if(NIVELES_OBLIGATORIOS.includes(g.nivel)){ oblig++; if(done) obligOk++; }
  }));
  return {oblig,obligOk,total,ok};
}
function renderCursos(){
  const id=document.getElementById("cursoMiembro").value;
  const m=ROSTER.find(x=>x.id===id);
  const box=document.getElementById("cursosLista"), res=document.getElementById("cursosResumen");
  if(!m){ box.innerHTML='<div class="empty">Selecciona un integrante.</div>'; res.innerHTML=""; return; }
  const s=statsCursos(m);
  res.innerHTML=`<div class="summary-item"><div class="big">${s.obligOk}/${s.oblig}</div><div class="lbl">Cursos obligatorios (inicial a intermedio)</div></div>
    <div class="summary-item"><div class="big">${s.oblig-s.obligOk}</div><div class="lbl">Obligatorios pendientes</div></div>
    <div class="summary-item"><div class="big">${s.ok}/${s.total}</div><div class="lbl">Total malla</div></div>`;
  box.innerHTML="";
  MALLA.forEach(g=>{
    const done=g.cursos.filter(c=>cursoState(m,c)).length;
    const head=document.createElement("div"); head.className="nivel-head";
    head.innerHTML=`<h3>${esc(g.nivel)}</h3><span class="badge ${done===g.cursos.length?'ok':'pend'}">${done}/${g.cursos.length}</span>`;
    box.appendChild(head);
    g.cursos.forEach(c=>{
      const st=cursoState(m,c);
      const row=document.createElement("div"); row.className="curso-row";
      row.innerHTML=`<input type="checkbox" data-curso="${esc(c)}" ${st?"checked":""}>
        <span class="cname">${esc(c)}</span>
        <input type="date" data-fecha="${esc(c)}" value="${st&&st.fecha?st.fecha:""}" ${st?"":"disabled"} title="Fecha de aprobación">`;
      const chk=row.querySelector("[data-curso]"), fch=row.querySelector("[data-fecha]");
      chk.addEventListener("change",async()=>{
        if(chk.checked){ m.cursos[c]={fecha:fch.value||""}; fch.disabled=false; }
        else { delete m.cursos[c]; fch.value=""; fch.disabled=true; }
        await saveRoster(); renderCursos(); renderCursosCompania();
      });
      fch.addEventListener("change",async()=>{
        if(m.cursos[c]){ m.cursos[c].fecha=fch.value; await saveRoster(); }
      });
      box.appendChild(row);
    });
  });
}
on("cursoMiembro","change",renderCursos);

function renderCursosCompania(){
  const box=document.getElementById("cursosCompania");
  const list=sortedRoster(true);
  if(!list.length){ box.innerHTML='<div class="empty">Sin integrantes.</div>'; return; }
  let html='<table><thead><tr><th>Nombre</th><th>Calidad</th><th>Obligatorios</th><th>Pendientes</th></tr></thead><tbody>';
  list.forEach(m=>{
    const s=statsCursos(m), pend=s.oblig-s.obligOk;
    html+=`<tr><td class="name-col">${esc(nombreCompleto(m))}</td><td class="cargo-col">${esc(m.categoria||"")}</td>
      <td>${s.obligOk}/${s.oblig}</td>
      <td><span class="badge ${pend===0?'ok':'pend'}">${pend===0?"Al día":pend+" pendientes"}</span></td></tr>`;
  });
  box.innerHTML=html+"</tbody></table>";
}
on("cursosPdfBtn","click",async()=>{
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  pdfHeader(doc,"CONTROL DE CURSOS · MALLA ANB 2025-2028");
  const rows=[];
  sortedRoster(false).forEach(m=>{
    const s=statsCursos(m);
    rows.push([nombreCompleto(m),m.categoria||"",`${s.obligOk}/${s.oblig}`,(s.oblig-s.obligOk)===0?"Al día":(s.oblig-s.obligOk)+" pendientes"]);
  });
  doc.autoTable({head:[["Nombre","Calidad","Obligatorios","Estado"]],body:rows,startY:32,styles:{fontSize:9},headStyles:{fillColor:[179,36,28]}});
  doc.setFontSize(9);
  doc.text(`Generado el ${new Date().toLocaleString("es-CL")}`,14,doc.lastAutoTable.finalY+10);
  await sharePdfDoc(doc,`cursos_quinta_compania_${todayISO()}.pdf`,'Control de cursos - Quinta Compañía "Germania"');
});

/* ============ TIPOS ============ */
function renderTiposTags(){
  const box=document.getElementById("tiposTags");
  box.innerHTML=TIPOS.map(t=>`<span class="tag">${esc(t)} <button data-del-tipo="${esc(t)}" title="Quitar">×</button></span>`).join("");
  box.querySelectorAll("[data-del-tipo]").forEach(b=>b.addEventListener("click",async()=>{
    if(TIPOS.length<=1) return;
    TIPOS=TIPOS.filter(t=>t!==b.dataset.delTipo);
    await saveTipos(); renderTiposTags(); renderTipoSelect(); populateTipoFilters();
  }));
}
on("agregarTipoBtn","click",async()=>{
  const inp=document.getElementById("nuevoTipoInput"), v=inp.value.trim();
  if(!v||TIPOS.includes(v)) return;
  TIPOS.push(v); await saveTipos(); inp.value="";
  renderTiposTags(); renderTipoSelect(); populateTipoFilters();
});

/* ============ IMPORTAR DATOS ============ */
const IMPORT_KEY="importado:2026";

function normaliza(s){
  return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z ]/g,"").trim();
}
/* Empareja a cada persona de la planilla con su ficha en la nómina */
function emparejar(persona){
  const ap=normaliza(persona.ap), nom=normaliza(persona.nom).split(" ")[0];
  let m=ROSTER.find(x=>normaliza(x.apellidoPaterno)===ap && normaliza(x.nombre).split(" ")[0]===nom);
  if(!m) m=ROSTER.find(x=>normaliza(x.apellidoPaterno)===ap);
  return m||null;
}

async function estadoImportacion(){
  const box=document.getElementById("impEstado");
  const ya=await sGet(IMPORT_KEY,null);
  const sinFicha=HISTORICO_2026.gente.filter(p=>!emparejar(p));
  box.innerHTML=`
    <div class="summary-row" style="margin-bottom:10px;">
      <div class="summary-item"><div class="big">${HISTORICO_2026.acts.length}</div><div class="lbl">Actividades en la planilla</div></div>
      <div class="summary-item"><div class="big">${HISTORICO_2026.gente.length-sinFicha.length}/${HISTORICO_2026.gente.length}</div><div class="lbl">Personas reconocidas en la nómina</div></div>
      <div class="summary-item"><div class="big">${ya?"Sí":"No"}</div><div class="lbl">Ya fue importado</div></div>
    </div>
    ${sinFicha.length?`<div class="aviso">Sin ficha en la nómina: ${sinFicha.map(p=>esc(p.nom+" "+p.ap)).join(", ")}. Su asistencia no se cargará.</div>`:""}`;
}

async function importarHistorico2026(){
  const mapa=HISTORICO_2026.gente.map(emparejar);
  let creadas=0;
  for(const a of HISTORICO_2026.acts){
    const tipo=a.t;
    if(!TIPOS.includes(tipo)){ TIPOS.push(tipo); }
    const records={};
    ROSTER.forEach(m=>{ records[m.id]="ausente"; });
    mapa.forEach((m,i)=>{ if(m && a.m[i]==="A") records[m.id]="presente"; });
    const k=await claveNueva(a.f,tipo);
    await setParte(k,{date:a.f,tipo,detalle:a.n,registradoPor:"",records,importado:true});
    creadas++;
  }
  await saveTipos(); renderTipoSelect(); populateTipoFilters();
  await sSet(IMPORT_KEY,{fecha:todayISO(),actividades:creadas});
  return creadas;
}
on("impCargarBtn","click",async()=>{
  const msg=document.getElementById("impMsg");
  const creadas=await importarHistorico2026();
  msg.classList.remove("err");
  msg.textContent=`Se importaron ${creadas} actividades. Ya puedes ver el panel del año 2026.`;
  estadoImportacion();
});
on("pnCargarHist","click",async()=>{
  const b=document.getElementById("pnCargarHist");
  b.disabled=true; b.textContent="Cargando…";
  const creadas=await importarHistorico2026();
  b.disabled=false; b.textContent="Cargar histórico 2026";
  alert(`Se importaron ${creadas} actividades de 2026.`);
  await renderPanel();
});

on("impBorrarBtn","click",async()=>{
  if(!confirm("¿Borrar las actividades importadas desde la planilla? Los partes que hayas registrado a mano no se tocan.")) return;
  const idx=await getIndex();
  const quedan=[];
  for(const it of idx){
    const p=await getParte(it.clave);
    if(p&&p.importado){ await sSet("parte:"+it.clave,null); }
    else quedan.push(it);
  }
  await sSet(INDEX_KEY,quedan);
  await sSet(IMPORT_KEY,null);
  document.getElementById("impMsg").textContent="Actividades importadas eliminadas.";
  document.getElementById("impMsg").classList.remove("err");
  estadoImportacion();
});

/* --- CSV --- */
on("impArchivo","change",async(e)=>{
  const f=e.target.files[0]; if(!f) return;
  const msg=document.getElementById("impCsvMsg");
  try{
    const texto=await f.text();
    const lineas=texto.split(/\r?\n/).filter(l=>l.trim());
    let n=0, errores=[];
    for(const [i,linea] of lineas.entries()){
      const c=linea.split(";");
      if(c.length<3) continue;
      if(i===0 && /fecha/i.test(c[0])) continue;
      const [fecha,tipo,actividad,asistentes]=c.map(x=>(x||"").trim());
      if(!/^\d{4}-\d{2}-\d{2}$/.test(fecha)){ errores.push("línea "+(i+1)+": fecha inválida"); continue; }
      const ids=(asistentes||"").split(",").map(x=>x.trim()).filter(Boolean);
      const records={};
      ROSTER.forEach(m=>{ records[m.id]="ausente"; });
      ids.forEach(ref=>{
        const m=ROSTER.find(x=>String(x.clave)===ref || String(x.n)===ref);
        if(m) records[m.id]="presente"; else errores.push("línea "+(i+1)+": no se encontró "+ref);
      });
      if(!TIPOS.includes(tipo)) TIPOS.push(tipo);
      const k=await claveNueva(fecha,tipo);
      await setParte(k,{date:fecha,tipo,detalle:actividad,registradoPor:"",records,importado:true});
      n++;
    }
    await saveTipos(); renderTipoSelect(); populateTipoFilters();
    msg.classList.remove("err");
    msg.textContent=`${n} actividades importadas.`+(errores.length?` Con ${errores.length} advertencia(s): ${errores.slice(0,3).join("; ")}`:"");
  }catch(err){
    msg.classList.add("err"); msg.textContent="No se pudo leer el archivo.";
  }
  e.target.value="";
});

/* --- RESPALDO --- */
on("impExportarBtn","click",async()=>{
  const idx=await getIndex();
  const partes={};
  for(const it of idx){ partes[it.clave]=await getParte(it.clave); }
  const respaldo={version:1, fecha:new Date().toISOString(),
    roster:ROSTER, tipos:TIPOS, cargos:CARGOS, orden:ORDEN_MODO, indice:idx, partes};
  const blob=new Blob([JSON.stringify(respaldo)],{type:"application/json"});
  await entregarArchivo(blob,`respaldo_quinta_compania_${todayISO()}.json`,"Respaldo","Respaldo generado");
  document.getElementById("impBkMsg").textContent="Respaldo descargado.";
  document.getElementById("impBkMsg").classList.remove("err");
});

on("impRestaurar","change",async(e)=>{
  const f=e.target.files[0]; if(!f) return;
  const msg=document.getElementById("impBkMsg");
  if(!confirm("Restaurar un respaldo reemplaza toda la información actual. ¿Continuar?")){ e.target.value=""; return; }
  try{
    const r=JSON.parse(await f.text());
    if(!r.roster) throw new Error("formato");
    ROSTER=r.roster; TIPOS=r.tipos||TIPOS; CARGOS=r.cargos||CARGOS; ORDEN_MODO=r.orden||ORDEN_MODO;
    await saveRoster(); await saveTipos(); await saveCargos(); await sSet("orden:v1",ORDEN_MODO);
    await sSet(INDEX_KEY, r.indice||[]);
    for(const [clave,parte] of Object.entries(r.partes||{})) await sSet("parte:"+clave,parte);
    renderTipoSelect(); populateTipoFilters(); refrescarTodo();
    msg.classList.remove("err");
    msg.textContent="Respaldo restaurado.";
  }catch(err){
    msg.classList.add("err"); msg.textContent="El archivo no es un respaldo válido.";
  }
  e.target.value="";
});

/* ============ TABS ============ */
function switchTabExtra(name){
  if(name==="historial") renderHistorial();
  if(name==="servicio"){
    const f=document.getElementById("svFecha");
    if(f && !f.value) f.value=todayISO();
    cargarServicio();
  }
  if(name==="panel") renderPanel();
  if(name==="guardia"){
    const f=document.getElementById("gnFechaIng");
    if(f && !f.value){ f.value=todayISO(); const s=document.getElementById("gnFechaSal");
      const d=new Date(); d.setDate(d.getDate()+1); s.value=d.toISOString().slice(0,10); }
    if(!document.getElementById("gnDesde").value) document.getElementById("gnSemana").click();
    renderGnOficial(); cargarGuardia(); renderGnLista();
  }
  if(name==="config"){
    renderTiposTags(); renderCfgRoster(); renderCargoOptions(); loadOficialidadYear();
    renderCursoMiembroSelect(); renderCursos(); renderCursosCompania();
    pintarCandado(); renderBajasSelects(); renderBajasList(); renderHvSelect(); renderHoja(); estadoImportacion();
    const bf=document.getElementById("bajaFecha"); if(bf && !bf.value) bf.value=todayISO();
    const hf=document.getElementById("hvFecha");  if(hf && !hf.value) hf.value=todayISO();
  }
}
function switchTab(name){ if(window.__mostrarPestana) window.__mostrarPestana(name); }

/* ============ INIT ============ */
(async function init(){
  document.getElementById("crestImg").src=LOGO_B64;
  document.getElementById("membreteLogo").src=LOGO_B64;
  document.getElementById("todayLabel").textContent=fmtDateLong(todayISO());
  await sSet("__check", 1);
  await loadAll();
  /* La base parte con el registro 2026 de la Compañía; de ahí en adelante
     se van sumando las nuevas citaciones y salidas del B-5. */
  if(!(await sGet(IMPORT_KEY,null)) && (await getIndex()).length===0){
    try{ await importarHistorico2026(); }catch(e){ console.error("No se pudo cargar la base 2026",e); }
  }
  renderTipoSelect(); populateTipoFilters(); renderRegistradoPorOptions(); renderCargoOptions();
  document.getElementById("ordenModo").value=ORDEN_MODO;
  document.getElementById("anioOficialidad").value=new Date().getFullYear();
  document.getElementById("fecha").value=todayISO();
  await loadListaForSelection();
})();
