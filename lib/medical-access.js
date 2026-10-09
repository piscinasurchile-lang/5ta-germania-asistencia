// Hoja de vida: campos de atención de urgencia, nunca se publican en la nómina.
export const MEDICAL_FIELDS = Object.freeze([
  "grupoSanguineo", "alergias", "alergiasMedicamentos",
  "condicionesMedicas", "medicacionHabitual"
]);
const MEDICAL = new Set(MEDICAL_FIELDS);
export function redactRoster(roster) {
  if (!Array.isArray(roster)) return roster;
  return roster.map(person => {
    if (!person || typeof person !== "object") return person;
    const copy = { ...person };
    for (const field of MEDICAL) delete copy[field];
    return copy;
  });
}
// A roster save must never clear existing medical fields just because the
// caller only received the public/redacted roster. Prevents accidental loss.
export function preserveMedical(existing, incoming) {
  if (!Array.isArray(existing) || !Array.isArray(incoming)) return incoming;
  const byId = new Map(existing.filter(x => x && x.id != null).map(x => [String(x.id), x]));
  return incoming.map(person => {
    if (!person || typeof person !== "object") return person;
    const previous = byId.get(String(person.id));
    if (!previous) {
      const copy = { ...person };
      for (const field of MEDICAL) delete copy[field];
      return copy;
    }
    const copy = { ...person };
    for (const field of MEDICAL) {
      if (Object.hasOwn(previous, field)) copy[field] = previous[field];
      else delete copy[field];
    }
    return copy;
  });
}
export function getMedical(person) {
  return Object.fromEntries(MEDICAL_FIELDS.map(field => [field, person?.[field] ?? ""]));
}
export function applyMedical(person, values) {
  const copy = { ...person };
  for (const field of MEDICAL_FIELDS) {
    if (Object.hasOwn(values, field)) {
      if (typeof values[field] !== "string" || values[field].length > 3000)
        throw new TypeError("invalid_medical_field");
      copy[field] = values[field];
    }
  }
  return copy;
}
