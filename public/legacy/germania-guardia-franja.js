/* GERMANIA · lógica pura de la franja de guardias del voluntario.
 * No lee Neon, no acredita asistencia, no cambia guardias ni ODD.
 * Se alimenta de la dotación aprobada que ya carga germania-roles.js.
 */
(function (root) {
  "use strict";
  var ZONA = "America/Santiago";
  function datosChile(ahora) {
    var fecha = new Date(ahora);
    if (!Number.isFinite(fecha.getTime())) return null;
    var partes = new Intl.DateTimeFormat("en-US", {
      timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", hourCycle: "h23"
    }).formatToParts(fecha);
    var p = {};
    partes.forEach(function (x) { if (x.type !== "literal") p[x.type] = x.value; });
    return { iso: p.year + "-" + p.month + "-" + p.day, hora: Number(p.hour) };
  }
  function sumarDias(iso, n) {
    var base = new Date(iso + "T12:00:00Z");
    if (!Number.isFinite(base.getTime())) return null;
    base.setUTCDate(base.getUTCDate() + n);
    return base.toISOString().slice(0, 10);
  }
  function semanaVisible(ahora) {
    var d = datosChile(ahora);
    if (!d) return null;
    var dia = new Date(d.iso + "T12:00:00Z").getUTCDay();
    // El miércoles la nueva semana aparece SOLO a partir de las 05:00 de Chile.
    if (dia === 3 && d.hora < 5) return null;
    var inicio = sumarDias(d.iso, -((dia + 4) % 7));
    return { inicio: inicio, finExclusivo: sumarDias(inicio, 7) };
  }
  function franjaAsignada(noches, ahora) {
    var semana = semanaVisible(ahora), milis = new Date(ahora).getTime();
    if (!semana || !Array.isArray(noches)) return [];
    var vistos = new Set();
    return noches.filter(function (x) {
      if (!x || typeof x.f !== "string" || x.f < semana.inicio || x.f >= semana.finExclusivo) return false;
      if (!["vol", "obac", "maq"].includes(x.rol)) return false;
      if (x.aviso && x.aviso.estado === "cubierto") return false;
      if (!(Number(x.finMs) > milis)) return false;
      if (vistos.has(x.f)) return false;
      vistos.add(x.f);
      return true;
    }).sort(function (a, b) { return a.f.localeCompare(b.f); });
  }
  root.GermaniaGuardiaFranja = {
    datosChile: datosChile,
    semanaVisible: semanaVisible,
    franjaAsignada: franjaAsignada
  };
})(typeof window !== "undefined" ? window : globalThis);
