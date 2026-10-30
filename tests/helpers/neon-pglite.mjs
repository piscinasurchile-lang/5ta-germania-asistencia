// Reemplazo de prueba de @neondatabase/serverless: ejecuta las rutas reales contra PGlite (Postgres en memoria).
// No se conecta a ninguna base de Staging ni de producción.
import { PGlite } from "@electric-sql/pglite";

const db = globalThis.__GERMANIA_PGLITE__ ??= new PGlite({
  parsers: { 20: (v) => v } // int8 como texto, igual que el driver de Neon
});
globalThis.__GERMANIA_PGLITE_LOG__ ??= [];

function armar(strings, values) {
  let text = "";
  strings.forEach((s, i) => { text += s + (i < values.length ? "$" + (i + 1) : ""); });
  return { text, params: values };
}
async function correr(q, tx = db) {
  const r = await tx.query(q.text, q.params);
  return r.rows;
}
function consulta(q) {
  const p = { _q: q, then: (res, rej) => correr(q).then(res, rej), catch: (rej) => correr(q).catch(rej), finally: (f) => correr(q).finally(f) };
  return p;
}
export function neon() {
  const sql = (strings, ...values) => consulta(armar(strings, values));
  sql.query = (text, params = []) => correr({ text, params });
  sql.transaction = async (lista) => {
    const qs = (typeof lista === "function" ? lista(sql) : lista).map((x) => x._q ?? x);
    return db.transaction(async (tx) => {
      const out = [];
      for (const q of qs) out.push(await correr(q, tx));
      return out;
    });
  };
  return sql;
}
export const __db = db;


export class Pool{
 async connect(){return {query:(text,params=[])=>db.query(text,params),release(){}};}
 async end(){}
}
