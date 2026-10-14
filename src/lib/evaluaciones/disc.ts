import type { Dimension, RespuestasDisc, ResultadoDisc } from "./tipos";

export const DIMENSIONES: Dimension[] = ["D", "I", "S", "C"];

type GrupoDisc = { id: number; palabras: Record<Dimension, string> };

export const GRUPOS_DISC: GrupoDisc[] = [
  { id: 1, palabras: { D: "Decidido/a", I: "Entusiasta", S: "Paciente", C: "Preciso/a" } },
  { id: 2, palabras: { D: "Directo/a", I: "Sociable", S: "Leal", C: "Analítico/a" } },
  { id: 3, palabras: { D: "Competitivo/a", I: "Persuasivo/a", S: "Tranquilo/a", C: "Detallista" } },
  { id: 4, palabras: { D: "Audaz", I: "Optimista", S: "Constante", C: "Ordenado/a" } },
  { id: 5, palabras: { D: "Exigente", I: "Expresivo/a", S: "Colaborador/a", C: "Riguroso/a" } },
  { id: 6, palabras: { D: "Firme", I: "Comunicativo/a", S: "Comprensivo/a", C: "Cuidadoso/a" } },
  { id: 7, palabras: { D: "Emprendedor/a", I: "Inspirador/a", S: "Servicial", C: "Perfeccionista" } },
  { id: 8, palabras: { D: "Ambicioso/a", I: "Espontáneo/a", S: "Sereno/a", C: "Lógico/a" } },
  { id: 9, palabras: { D: "Resolutivo/a", I: "Carismático/a", S: "Confiable", C: "Prudente" } },
  { id: 10, palabras: { D: "Enérgico/a", I: "Alegre", S: "Considerado/a", C: "Sistemático/a" } },
  { id: 11, palabras: { D: "Independiente", I: "Convincente", S: "Estable", C: "Reservado/a" } },
  { id: 12, palabras: { D: "Persistente", I: "Extrovertido/a", S: "Buen/a oyente", C: "Metódico/a" } },
  { id: 13, palabras: { D: "Arriesgado/a", I: "Divertido/a", S: "Tolerante", C: "Exacto/a" } },
  { id: 14, palabras: { D: "Determinado/a", I: "Animado/a", S: "Amable", C: "Organizado/a" } },
  { id: 15, palabras: { D: "Con iniciativa", I: "Popular", S: "Cooperativo/a", C: "Disciplinado/a" } },
  {
    id: 16,
    palabras: { D: "Orientado/a a resultados", I: "Elocuente", S: "Calmo/a", C: "Objetivo/a" },
  },
  { id: 17, palabras: { D: "Desafiante", I: "Motivador/a", S: "Conciliador/a", C: "Cauteloso/a" } },
  {
    id: 18,
    palabras: { D: "Seguro/a de sí", I: "Conversador/a", S: "Equilibrado/a", C: "Correcto/a" },
  },
  { id: 19, palabras: { D: "Pragmático/a", I: "Abierto/a", S: "Generoso/a", C: "Minucioso/a" } },
  { id: 20, palabras: { D: "Tenaz", I: "Simpático/a", S: "Moderado/a", C: "Planificador/a" } },
  { id: 21, palabras: { D: "Franco/a", I: "Encantador/a", S: "Sencillo/a", C: "Reflexivo/a" } },
  { id: 22, palabras: { D: "Ejecutivo/a", I: "Desenvuelto/a", S: "Solidario/a", C: "Formal" } },
  { id: 23, palabras: { D: "Valiente", I: "Jovial", S: "Pacífico/a", C: "Meticuloso/a" } },
  { id: 24, palabras: { D: "Líder", I: "Efusivo/a", S: "Fiel", C: "Crítico/a" } },
];

export const PERFILES_DISC: Record<
  Dimension,
  { nombre: string; resumen: string; fortalezas: string[]; aDesarrollar: string[] }
> = {
  D: {
    nombre: "Dominante",
    resumen:
      "Orientación a resultados, estilo directo y decidido. Le motivan los desafíos y la autonomía.",
    fortalezas: ["Toma de decisiones", "Iniciativa", "Foco en objetivos"],
    aDesarrollar: ["Paciencia", "Escucha activa", "Atención a los detalles"],
  },
  I: {
    nombre: "Influyente",
    resumen:
      "Estilo comunicativo, entusiasta y persuasivo. Se destaca al vincularse con otras personas.",
    fortalezas: ["Comunicación", "Motivar a otros", "Generar vínculos"],
    aDesarrollar: ["Seguimiento de tareas", "Organización", "Objetividad"],
  },
  S: {
    nombre: "Estable",
    resumen: "Estilo paciente, leal y colaborativo. Aporta constancia y armonía a los equipos.",
    fortalezas: ["Trabajo en equipo", "Escucha", "Confiabilidad"],
    aDesarrollar: ["Adaptación a cambios rápidos", "Asertividad", "Poner límites"],
  },
  C: {
    nombre: "Concienzudo",
    resumen: "Estilo analítico, preciso y orientado a la calidad. Busca hacer las cosas bien.",
    fortalezas: ["Análisis", "Rigor", "Planificación"],
    aDesarrollar: ["Flexibilidad", "Rapidez de decisión", "Tolerancia a la ambigüedad"],
  },
};

// El orden varía por grupo para que la posición no delate la dimensión de cada palabra.
export function opcionesDeGrupo(grupo: GrupoDisc) {
  const base = DIMENSIONES.map((dimension, indice) => ({
    indice,
    texto: grupo.palabras[dimension],
  }));
  const desplazamiento = grupo.id % 4;
  const rotadas = [...base.slice(desplazamiento), ...base.slice(0, desplazamiento)];
  return grupo.id % 2 === 0 ? rotadas.reverse() : rotadas;
}

export function validarRespuestasDisc(valor: unknown): RespuestasDisc | null {
  if (typeof valor !== "object" || valor === null) return null;
  const respuestas = valor as Record<string, { mas?: unknown; menos?: unknown }>;
  const esIndice = (n: unknown) => Number.isInteger(n) && (n as number) >= 0 && (n as number) < 4;
  for (const grupo of GRUPOS_DISC) {
    const r = respuestas[grupo.id];
    if (!r || !esIndice(r.mas) || !esIndice(r.menos) || r.mas === r.menos) return null;
  }
  return respuestas as RespuestasDisc;
}

export function puntuarDisc(respuestas: RespuestasDisc): ResultadoDisc {
  const neto: Record<Dimension, number> = { D: 0, I: 0, S: 0, C: 0 };
  for (const grupo of GRUPOS_DISC) {
    const r = respuestas[grupo.id];
    if (!r) continue;
    neto[DIMENSIONES[r.mas]!] += 1;
    neto[DIMENSIONES[r.menos]!] -= 1;
  }
  const total = GRUPOS_DISC.length;
  const puntajes = { D: 0, I: 0, S: 0, C: 0 };
  for (const d of DIMENSIONES) {
    puntajes[d] = Math.round(((neto[d] + total) / (2 * total)) * 100);
  }
  const ordenadas = [...DIMENSIONES].sort((a, b) => puntajes[b] - puntajes[a]);
  return { tipo: "disc", puntajes, principal: ordenadas[0]!, secundario: ordenadas[1]! };
}
