export const NOMINA_2026 = Object.freeze({
  "75": "Karam Puali López",
  "45": "Fernando Jerez Pantoja",
  "9": "Fernando Ortega Gutiérrez",
  "501": "Tomás Lara Jeffs",
  "502": "Matías Corvalán Garrido",
  "503": "Andrés Herrera Santander",
  "504": "Francisco Vega Lara",
  "505": "Diego Lozano González",
  "506": "Susumu Sugiura Aguilar",
  "507": "Mathias Von Leyser Jux",
  "508": "Pablo Arellano Graell",
  "509": "María Paz Solo de Zaldívar Lavanchy",
  "510": "Ludwig Von Plessing Cea",
  "513": "José Álvarez Álvarez",
  "514": "Juan Pablo Orlandini Retamal",
  "515": "Luis Bustos Rivera",
  "516": "Cristóbal Rascheya Travini",
  "517": "Christian Vergara Sandoval",
  "518": "César Ilarre Castro",
  "519": "León Campino Del Villar",
  "520": "Natalia Yáñez Navarrete",
  "521": "Rodolfo Maldonado Avendaño",
  "522": "Manuel Moller Henríquez",
  "523": "Joaquín Bustos Guzmán",
  "524": "María Paz Ortega González",
  "525": "Gustavo Jerez Pantoja"
});

export const OFICIALIDAD_2026 = Object.freeze([
  { codigo: "75", nombre: "Karam Puali López", cargo: "Director" },
  { codigo: "45", nombre: "Fernando Jerez Pantoja", cargo: "Capitán" },
  { codigo: "501", nombre: "Tomás Lara Jeffs", cargo: "Teniente 1°" },
  { codigo: "502", nombre: "Matías Corvalán Garrido", cargo: "Teniente 2°" },
  { codigo: "503", nombre: "Andrés Herrera Santander", cargo: "Teniente 3°" },
  { codigo: "504", nombre: "Francisco Vega Lara", cargo: "Ayudante" },
  { codigo: "505", nombre: "Diego Lozano González", cargo: "Jefe de Máquinas" },
  { codigo: "506", nombre: "Susumu Sugiura Aguilar", cargo: "Secretario" },
  { codigo: "507", nombre: "Mathias Von Leyser Jux", cargo: "Tesorero" }
]);

export function voluntarioPorCodigo(codigo) {
  const limpio = String(codigo || "").trim();
  const nombre = NOMINA_2026[limpio];
  return nombre ? { codigo: limpio, nombre } : null;
}

export function oficialPorCodigo(codigo) {
  const limpio = String(codigo || "").trim();
  return OFICIALIDAD_2026.find((oficial) => oficial.codigo === limpio) || null;
}
