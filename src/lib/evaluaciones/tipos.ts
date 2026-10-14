export type Dimension = "D" | "I" | "S" | "C";

export type AreaRazonamiento = "numerico" | "verbal" | "logico" | "abstracto";

export type NivelRazonamiento = "bajo" | "medio" | "alto" | "superior";

export type ResultadoDisc = {
  tipo: "disc";
  puntajes: Record<Dimension, number>;
  principal: Dimension;
  secundario: Dimension;
};

export type ResultadoRazonamiento = {
  tipo: "inteligencia";
  correctas: number;
  total: number;
  porcentaje: number;
  nivel: NivelRazonamiento;
  porArea: Record<AreaRazonamiento, { correctas: number; total: number }>;
  fueraDeTiempo: boolean;
};

export type ResultadoEvaluacion = ResultadoDisc | ResultadoRazonamiento;

export type RespuestasDisc = Record<string, { mas: number; menos: number }>;
export type RespuestasRazonamiento = Record<string, number>;
