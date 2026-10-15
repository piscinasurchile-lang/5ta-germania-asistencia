export default function PlantillaGuardia({disponible,subiendo,onUpload,anterior,onAnterior}){
 return <section className="guardLoaded" aria-label="Plantilla institucional nocturna">
  <strong>Plantilla oficial · ODD 063/2026</strong>
  <span>{disponible?"PDF original de tres páginas archivado.":"Pendiente de guardar el PDF original en Germania."}</span>
  <small>Conserva medidas de página, escudo, fondos, firmas y texto fijo.</small>
  {disponible?<a href="/api/odd-maestras/plantilla-guardia" target="_blank" rel="noreferrer">Ver documento original</a>:
    <label>Guardar PDF original (única vez)<input type="file" accept=".pdf,application/pdf" onChange={onUpload} disabled={subiendo}/></label>}
  <label>ODD anterior que deja sin efecto<input type="text" value={anterior} onChange={e=>onAnterior(e.target.value)} placeholder="063/2026"/></label>
 </section>;
}
