import { OFICIALIDAD_2026 } from "./quinta-data";

export function listarOficiales2026() {
  return OFICIALIDAD_2026.map((oficial) => ({ ...oficial }));
}

export function buscarOficial2026(codigo) {
  const limpio = String(codigo || "").trim();
  return OFICIALIDAD_2026.find((oficial) => oficial.codigo === limpio) || null;
}
