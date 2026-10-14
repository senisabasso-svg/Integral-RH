import type {
  AreaRazonamiento,
  NivelRazonamiento,
  RespuestasRazonamiento,
  ResultadoRazonamiento,
} from "./tipos";

export const MINUTOS_RAZONAMIENTO = 25;

type Pregunta = {
  id: number;
  area: AreaRazonamiento;
  enunciado: string;
  opciones: string[];
  correcta: number;
};

export const PREGUNTAS_RAZONAMIENTO: Pregunta[] = [
  { id: 1, area: "numerico", enunciado: "¿Qué número sigue? 2, 4, 8, 16, …", opciones: ["24", "32", "30", "64"], correcta: 1 },
  { id: 2, area: "numerico", enunciado: "¿Qué número sigue? 3, 6, 11, 18, 27, …", opciones: ["36", "39", "38", "42"], correcta: 2 },
  { id: 3, area: "numerico", enunciado: "¿Qué número sigue? 81, 27, 9, 3, …", opciones: ["1", "0", "2", "1,5"], correcta: 0 },
  { id: 4, area: "numerico", enunciado: "¿Qué número sigue? 1, 1, 2, 3, 5, 8, …", opciones: ["11", "12", "15", "13"], correcta: 3 },
  {
    id: 5,
    area: "numerico",
    enunciado: "Un producto cuesta $800 y tiene un 15% de descuento. ¿Cuánto se paga?",
    opciones: ["$680", "$650", "$720", "$685"],
    correcta: 0,
  },
  {
    id: 6,
    area: "numerico",
    enunciado:
      "Si 4 operarios descargan un camión en 6 horas, ¿cuántas horas tardan 8 operarios trabajando al mismo ritmo?",
    opciones: ["12", "4", "3", "2"],
    correcta: 2,
  },
  { id: 7, area: "numerico", enunciado: "¿Qué número sigue? 2, 6, 12, 20, 30, …", opciones: ["40", "36", "44", "42"], correcta: 3 },
  {
    id: 8,
    area: "numerico",
    enunciado: "Una empresa tenía 120 empleados y aumentó su plantilla un 25%. ¿Cuántos tiene ahora?",
    opciones: ["145", "150", "160", "155"],
    correcta: 1,
  },
  {
    id: 9,
    area: "verbal",
    enunciado: "Médico es a hospital como docente es a…",
    opciones: ["libro", "escuela", "alumno", "pizarrón"],
    correcta: 1,
  },
  {
    id: 10,
    area: "verbal",
    enunciado: "¿Cuál es el sinónimo de «efímero»?",
    opciones: ["pasajero", "eterno", "sólido", "evidente"],
    correcta: 0,
  },
  {
    id: 11,
    area: "verbal",
    enunciado: "¿Cuál es el antónimo de «escaso»?",
    opciones: ["raro", "limitado", "abundante", "breve"],
    correcta: 2,
  },
  {
    id: 12,
    area: "verbal",
    enunciado: "Pez es a agua como pájaro es a…",
    opciones: ["nido", "pluma", "árbol", "aire"],
    correcta: 3,
  },
  {
    id: 13,
    area: "verbal",
    enunciado: "¿Qué palabra no pertenece al grupo? manzana, pera, zanahoria, durazno",
    opciones: ["manzana", "pera", "zanahoria", "durazno"],
    correcta: 2,
  },
  {
    id: 14,
    area: "verbal",
    enunciado: "¿Cuál es el sinónimo de «diligente»?",
    opciones: ["lento", "aplicado", "distraído", "indeciso"],
    correcta: 1,
  },
  {
    id: 15,
    area: "verbal",
    enunciado: "Capítulo es a libro como piso es a…",
    opciones: ["escalera", "edificio", "techo", "ascensor"],
    correcta: 1,
  },
  {
    id: 16,
    area: "verbal",
    enunciado: "¿Qué palabra completa mejor la frase? «El informe era tan ___ que nadie pudo encontrarle errores.»",
    opciones: ["confuso", "extenso", "riguroso", "breve"],
    correcta: 2,
  },
  {
    id: 17,
    area: "logico",
    enunciado:
      "Todos los supervisores tienen licencia de conducir. Martina es supervisora. Por lo tanto…",
    opciones: [
      "Martina tiene licencia de conducir",
      "Martina no maneja",
      "Todos los que manejan son supervisores",
      "No se puede saber",
    ],
    correcta: 0,
  },
  {
    id: 18,
    area: "logico",
    enunciado: "Si llueve, el partido se suspende. El partido no se suspendió. Entonces…",
    opciones: ["Llovió", "No llovió", "Llovió poco", "No se puede saber"],
    correcta: 1,
  },
  {
    id: 19,
    area: "logico",
    enunciado: "Ana es más alta que Bruno. Bruno es más alto que Carla. ¿Quién es la más baja?",
    opciones: ["Ana", "Bruno", "Carla", "No se puede saber"],
    correcta: 2,
  },
  {
    id: 20,
    area: "logico",
    enunciado:
      "Algunos empleados son contadores. Todos los contadores usan planillas de cálculo. ¿Qué afirmación es necesariamente verdadera?",
    opciones: [
      "Todos los empleados usan planillas",
      "Algunos empleados usan planillas",
      "Ningún empleado usa planillas",
      "Todos los que usan planillas son contadores",
    ],
    correcta: 1,
  },
  {
    id: 21,
    area: "logico",
    enunciado: "En una fila, Pedro está delante de Lucía y detrás de Marcos. ¿Quién está primero?",
    opciones: ["Pedro", "Lucía", "Marcos", "No se puede saber"],
    correcta: 2,
  },
  {
    id: 22,
    area: "logico",
    enunciado: "Si todos los A son B y ningún B es C, entonces…",
    opciones: ["Algunos A son C", "Ningún A es C", "Todos los C son A", "Todos los B son A"],
    correcta: 1,
  },
  {
    id: 23,
    area: "logico",
    enunciado:
      "Juan llegó antes que Sofía pero después que Diego. Valeria llegó última. ¿Quién llegó primero?",
    opciones: ["Juan", "Sofía", "Valeria", "Diego"],
    correcta: 3,
  },
  { id: 24, area: "abstracto", enunciado: "¿Qué letra sigue? A, C, E, G, …", opciones: ["H", "I", "J", "K"], correcta: 1 },
  { id: 25, area: "abstracto", enunciado: "¿Qué letra sigue? Z, X, V, T, …", opciones: ["S", "Q", "R", "P"], correcta: 2 },
  { id: 26, area: "abstracto", enunciado: "¿Qué sigue? AB, CD, EF, …", opciones: ["GH", "FG", "HI", "GI"], correcta: 0 },
  { id: 27, area: "abstracto", enunciado: "¿Qué figura sigue? ▲ ■ ▲ ■ ▲ …", opciones: ["▲", "■", "●", "◆"], correcta: 1 },
  { id: 28, area: "abstracto", enunciado: "¿Qué sigue? 1A, 2B, 3C, …", opciones: ["4C", "3D", "4D", "5E"], correcta: 2 },
  { id: 29, area: "abstracto", enunciado: "¿Qué letra sigue? B, E, H, K, …", opciones: ["M", "N", "O", "L"], correcta: 1 },
  { id: 30, area: "abstracto", enunciado: "¿Qué figura sigue? ● ○ ○ ● ○ ○ ● …", opciones: ["●", "○", "■", "▲"], correcta: 1 },
];

export const AREA_LABEL: Record<AreaRazonamiento, string> = {
  numerico: "Numérico",
  verbal: "Verbal",
  logico: "Lógico",
  abstracto: "Abstracto",
};

export const NIVEL_LABEL: Record<NivelRazonamiento, string> = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
  superior: "Superior",
};

export function preguntasParaCandidato() {
  return PREGUNTAS_RAZONAMIENTO.map(({ id, enunciado, opciones }) => ({ id, enunciado, opciones }));
}

export function nivelPorPorcentaje(porcentaje: number): NivelRazonamiento {
  if (porcentaje >= 85) return "superior";
  if (porcentaje >= 65) return "alto";
  if (porcentaje >= 40) return "medio";
  return "bajo";
}

export function validarRespuestasRazonamiento(valor: unknown): RespuestasRazonamiento | null {
  if (typeof valor !== "object" || valor === null) return null;
  const respuestas: RespuestasRazonamiento = {};
  for (const pregunta of PREGUNTAS_RAZONAMIENTO) {
    const elegida = (valor as Record<string, unknown>)[pregunta.id];
    if (elegida === undefined || elegida === null) continue;
    if (!Number.isInteger(elegida) || (elegida as number) < 0 || (elegida as number) >= pregunta.opciones.length) {
      return null;
    }
    respuestas[pregunta.id] = elegida as number;
  }
  return respuestas;
}

export function puntuarRazonamiento(
  respuestas: RespuestasRazonamiento,
  fueraDeTiempo: boolean,
): ResultadoRazonamiento {
  const porArea: ResultadoRazonamiento["porArea"] = {
    numerico: { correctas: 0, total: 0 },
    verbal: { correctas: 0, total: 0 },
    logico: { correctas: 0, total: 0 },
    abstracto: { correctas: 0, total: 0 },
  };
  let correctas = 0;
  for (const pregunta of PREGUNTAS_RAZONAMIENTO) {
    porArea[pregunta.area].total += 1;
    if (respuestas[pregunta.id] === pregunta.correcta) {
      correctas += 1;
      porArea[pregunta.area].correctas += 1;
    }
  }
  const total = PREGUNTAS_RAZONAMIENTO.length;
  const porcentaje = Math.round((correctas / total) * 100);
  return {
    tipo: "inteligencia",
    correctas,
    total,
    porcentaje,
    nivel: nivelPorPorcentaje(porcentaje),
    porArea,
    fueraDeTiempo,
  };
}
