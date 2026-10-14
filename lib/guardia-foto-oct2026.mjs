/* Foto de la programación autorizada 14–20 octubre 2026.
 * Aplicación única: se debe ejecutar TODO en una transacción atómica.
 * Sin acreditación de guardias; historial Neon vigente.
 */
export const FOTO={
  "2026-10-14": [
    "504",
    "505",
    [
      "525",
      "517",
      "521",
      "524",
      "Esthe"
    ]
  ],
  "2026-10-15": [
    "502",
    "45",
    [
      "510",
      "517",
      "522",
      "521",
      "Saida"
    ]
  ],
  "2026-10-16": [
    "501",
    "505",
    [
      "502",
      "503",
      "75",
      "Felipe",
      "522",
      "523"
    ]
  ],
  "2026-10-17": [
    "501",
    "505",
    [
      "503",
      "508",
      "504",
      "517",
      "Felipe",
      "523"
    ]
  ],
  "2026-10-18": [
    "504",
    "45",
    [
      "517",
      "Saida",
      "523"
    ]
  ],
  "2026-10-19": [
    "502",
    "9",
    [
      "75",
      "504",
      "507",
      "524",
      "Esthe"
    ]
  ],
  "2026-10-20": [
    "502",
    "9",
    [
      "510",
      "506",
      "504",
      "507",
      "Esthe"
    ]
  ]
};
export const ESTHE_ID="b7df615b-42c2-46c1-8e34-0e642ddc7d29";
export const SQL_STEPS=[
  "DO $v$ BEGIN\nPERFORM 1 FROM app_state WHERE key IN ('roster:v8','guardia-revision:2026-10-14') OR (key LIKE 'guardia:2026-10-%__2245' AND substr(key,9,10) BETWEEN '2026-10-14' AND '2026-10-20') OR key LIKE 'guardia-inscripcion:2026-10-14:%' ORDER BY key FOR UPDATE;\nIF (SELECT version FROM app_state WHERE key='roster:v8')<>13 THEN RAISE EXCEPTION 'VERSION_NOMINA'; END IF;\nIF (SELECT version FROM app_state WHERE key='guardia-revision:2026-10-14')<>2 OR (SELECT value->>'estado' FROM app_state WHERE key='guardia-revision:2026-10-14')<>'aprobada' THEN RAISE EXCEPTION 'VERSION_REVISION'; END IF;\nIF (SELECT count(*) FROM app_state WHERE key LIKE 'guardia:2026-10-%__2245' AND substr(key,9,10) BETWEEN '2026-10-14' AND '2026-10-20' AND version=1)<>7 THEN RAISE EXCEPTION 'VERSION_GUARDIAS'; END IF;\nIF (SELECT count(*) FROM app_state WHERE key LIKE 'guardia-inscripcion:2026-10-14:%')<>20 OR EXISTS(SELECT 1 FROM app_state WHERE key LIKE 'guardia-inscripcion:2026-10-14:%' AND version<>1) THEN RAISE EXCEPTION 'VERSION_INSCRIPCIONES'; END IF;\nIF (SELECT count(*) FROM app_state s,jsonb_array_elements(s.value) p WHERE s.key='roster:v8' AND p->>'id'='b7df615b-42c2-46c1-8e34-0e642ddc7d29')<>1 THEN RAISE EXCEPTION 'ESTHEFANI_NO_UNICA'; END IF;\nIF EXISTS(SELECT 1 FROM app_state s,jsonb_array_elements(s.value) p WHERE s.key='roster:v8' AND p->>'id'<>'b7df615b-42c2-46c1-8e34-0e642ddc7d29' AND regexp_replace(upper(coalesce(p->>'rut','')),'[^0-9K]','','g')='22532509K') THEN RAISE EXCEPTION 'RUT_OTRA_FICHA'; END IF;\nIF EXISTS(SELECT 1 FROM app_state WHERE key LIKE 'guardia-acreditacion:2026-10-%' AND substr(key,22,10) BETWEEN '2026-10-14' AND '2026-10-20') THEN RAISE EXCEPTION 'YA_ACREDITADA'; END IF;\nEND $v$",
  "UPDATE app_state s SET value=(SELECT jsonb_agg(CASE WHEN p->>'id'='b7df615b-42c2-46c1-8e34-0e642ddc7d29' THEN p||jsonb_build_object('nombre','Esthefani Noemí','apellidoPaterno','Ojeda','apellidoMaterno','Fuentes','rut','22.532.509-K') ELSE p END ORDER BY ord) FROM jsonb_array_elements(s.value) WITH ORDINALITY t(p,ord)),version=version+1,updated_at=now() WHERE key='roster:v8' AND version=13",
  "WITH foto AS (SELECT key AS fecha,value AS dato FROM jsonb_each('{\"2026-10-14\":[\"504\",\"505\",[\"525\",\"517\",\"521\",\"524\",\"Esthe\"]],\"2026-10-15\":[\"502\",\"45\",[\"510\",\"517\",\"522\",\"521\",\"Saida\"]],\"2026-10-16\":[\"501\",\"505\",[\"502\",\"503\",\"75\",\"Felipe\",\"522\",\"523\"]],\"2026-10-17\":[\"501\",\"505\",[\"503\",\"508\",\"504\",\"517\",\"Felipe\",\"523\"]],\"2026-10-18\":[\"504\",\"45\",[\"517\",\"Saida\",\"523\"]],\"2026-10-19\":[\"502\",\"9\",[\"75\",\"504\",\"507\",\"524\",\"Esthe\"]],\"2026-10-20\":[\"502\",\"9\",[\"510\",\"506\",\"504\",\"507\",\"Esthe\"]]}'::jsonb)), personas AS (SELECT p->>'id' id,COALESCE(p->>'clave',CASE WHEN p->>'id'='b7df615b-42c2-46c1-8e34-0e642ddc7d29' THEN 'Esthe' WHEN p->>'nombre'='Saida' THEN 'Saida' WHEN p->>'nombre'='Felipe' AND p->>'apellidoPaterno'='Carrillo' THEN 'Felipe' END) codigo FROM app_state s,jsonb_array_elements(s.value)p WHERE s.key='roster:v8'), configuracion AS (SELECT foto.fecha,(SELECT id FROM personas WHERE codigo=foto.dato->>0) obac,(SELECT id FROM personas WHERE codigo=foto.dato->>1) maq,(SELECT jsonb_agg(jsonb_build_object('id',r.id,'estado','cuartel','correo',false,'motivo','','obs','','reemplazo','','reemplazoRegistradoEn','') ORDER BY x.ord) FROM jsonb_array_elements_text(foto.dato->2) WITH ORDINALITY x(codigo,ord) JOIN personas r ON r.codigo=x.codigo) guardianes FROM foto) UPDATE app_state s SET value=s.value||jsonb_build_object('oficial',c.obac,'conductor',c.maq,'guardianes',c.guardianes),version=version+1,updated_at=now() FROM configuracion c WHERE s.key='guardia:'||c.fecha||'__2245' AND s.version=1",
  "WITH nuevo_plan AS (SELECT jsonb_object_agg(substr(key,9,10),jsonb_build_object('obac',value->>'oficial','maq',value->>'conductor','vol',(SELECT jsonb_agg(t.persona->>'id' ORDER BY t.ord) FROM jsonb_array_elements(value->'guardianes') WITH ORDINALITY t(persona,ord)))) AS plan FROM app_state WHERE key LIKE 'guardia:2026-10-%__2245' AND substr(key,9,10) BETWEEN '2026-10-14' AND '2026-10-20') UPDATE app_state s SET value=s.value||jsonb_build_object('base',p.plan,'noches',p.plan,'origenAjuste','Planilla fotográfica autorizada 14–20 octubre 2026','ajustadaEn',now()::text,'cambios',coalesce(s.value->'cambios','[]'::jsonb)||jsonb_build_array(jsonb_build_object('accion','reemplazo_planilla_semanal','por','Administrador Germania','en',now()::text,'detalle','Guardia actualizada conforme a fotografía autorizada'))),version=version+1,updated_at=now() FROM nuevo_plan p WHERE s.key='guardia-revision:2026-10-14' AND s.version=2",
  "WITH guardias AS (SELECT substr(key,9,10) AS fecha,value FROM app_state WHERE key LIKE 'guardia:2026-10-%__2245' AND substr(key,9,10) BETWEEN '2026-10-14' AND '2026-10-20'),asignaciones AS (SELECT fecha,value->>'oficial' AS id FROM guardias UNION ALL SELECT fecha,value->>'conductor' AS id FROM guardias UNION ALL SELECT g.fecha,t.p->>'id' AS id FROM guardias g,jsonb_array_elements(g.value->'guardianes') t(p)),dias AS (SELECT id,jsonb_agg(fecha ORDER BY fecha) fechas FROM asignaciones GROUP BY id),todas AS (SELECT id FROM dias UNION SELECT substr(key,length('guardia-inscripcion:2026-10-14:')+1) FROM app_state WHERE key LIKE 'guardia-inscripcion:2026-10-14:%') INSERT INTO app_state(key,value,version,updated_at) SELECT 'guardia-inscripcion:2026-10-14:'||p.id,coalesce(d.fechas,'[]'::jsonb),1,now() FROM todas p LEFT JOIN dias d ON d.id=p.id ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,version=app_state.version+1,updated_at=now() WHERE app_state.value IS DISTINCT FROM EXCLUDED.value",
  "DO $v$ BEGIN\nIF (SELECT count(*) FROM app_state WHERE key LIKE 'guardia:2026-10-%__2245' AND substr(key,9,10) BETWEEN '2026-10-14' AND '2026-10-20' AND version=2)<>7 THEN RAISE EXCEPTION 'VALIDACION_DIAS'; END IF;\nIF (SELECT sum(jsonb_array_length(value->'guardianes')) FROM app_state WHERE key LIKE 'guardia:2026-10-%__2245' AND substr(key,9,10) BETWEEN '2026-10-14' AND '2026-10-20')<>35 THEN RAISE EXCEPTION 'VALIDACION_VOLUNTARIOS'; END IF;\nIF EXISTS(SELECT 1 FROM app_state s WHERE s.key LIKE 'guardia:2026-10-%__2245' AND substr(s.key,9,10) BETWEEN '2026-10-14' AND '2026-10-20' AND (coalesce(s.value->>'oficial','')='' OR coalesce(s.value->>'conductor','')='' OR EXISTS(SELECT 1 FROM jsonb_array_elements(s.value->'guardianes') g WHERE coalesce(g->>'id','')=''))) THEN RAISE EXCEPTION 'VALIDACION_IDS'; END IF;\nIF (SELECT version FROM app_state WHERE key='guardia-revision:2026-10-14')<>3 OR (SELECT value->>'estado' FROM app_state WHERE key='guardia-revision:2026-10-14')<>'aprobada' THEN RAISE EXCEPTION 'VALIDACION_REVISION'; END IF;\nIF (SELECT count(*) FROM app_state WHERE key LIKE 'guardia-inscripcion:2026-10-14:%')<>21 OR EXISTS(SELECT 1 FROM app_state WHERE key LIKE 'guardia-inscripcion:2026-10-14:%' AND jsonb_array_length(value)=0) THEN RAISE EXCEPTION 'VALIDACION_INSCRIPCIONES'; END IF;\nIF (SELECT count(*) FROM app_state s,jsonb_array_elements(s.value) p WHERE s.key='roster:v8' AND p->>'id'='b7df615b-42c2-46c1-8e34-0e642ddc7d29' AND p->>'nombre'='Esthefani Noemí' AND p->>'apellidoPaterno'='Ojeda' AND p->>'apellidoMaterno'='Fuentes' AND p->>'rut'='22.532.509-K')<>1 THEN RAISE EXCEPTION 'VALIDACION_ESTHEFANI'; END IF;\nEND $v$"
];
export function planParaNomina(nomina){
  const codes=new Map();
  for(const p of nomina){
    if(!p?.id)continue;
    if(p.clave)codes.set(String(p.clave),p);
    if(p.id===ESTHE_ID)codes.set("Esthe",{...p,nombre:"Esthefani Noemí",apellidoPaterno:"Ojeda",apellidoMaterno:"Fuentes"});
    if(p.nombre==="Saida"&&p.apellidoPaterno==="Pollak")codes.set("Saida",p);
    if(p.nombre==="Felipe"&&p.apellidoPaterno==="Carrillo")codes.set("Felipe",p);
  }
  function persona(code){
    const x=codes.get(code);
    if(!x)throw Error("Falta en nómina: "+code);
    return {id:x.id,nombre:[x.nombre,x.apellidoPaterno,x.apellidoMaterno].filter(Boolean).join(" ")};
  }
  const result=Object.entries(FOTO).map(([fecha,[obac,maquinista,voluntarios]])=>({
    fecha,obac:persona(obac),conductor:persona(maquinista),voluntarios:voluntarios.map(persona)
  }));
  for(const d of result){
    const ids=[d.obac.id,d.conductor.id,...d.voluntarios.map(x=>x.id)];
    if(new Set(ids).size!==ids.length)throw Error("Persona repetida en "+d.fecha);
  }
  const ids=new Set(result.flatMap(d=>[d.obac.id,d.conductor.id,...d.voluntarios.map(x=>x.id)]));
  if(result.length!==7||ids.size!==21||result.reduce((x,d)=>x+d.voluntarios.length,0)!==35)
    throw Error("Planilla inconsistente");
  return result;
}
