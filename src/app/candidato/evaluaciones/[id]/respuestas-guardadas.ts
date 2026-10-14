"use client";

import { useEffect, useState } from "react";

export function useRespuestasGuardadas<T extends object>(evaluacionId: number) {
  const clave = `irh-evaluacion-${evaluacionId}`;
  const [respuestas, setRespuestas] = useState<T>({} as T);
  const [cargadas, setCargadas] = useState(false);

  useEffect(() => {
    const guardadas = localStorage.getItem(clave);
    if (guardadas) {
      try {
        setRespuestas(JSON.parse(guardadas) as T);
      } catch {
        localStorage.removeItem(clave);
      }
    }
    setCargadas(true);
  }, [clave]);

  useEffect(() => {
    if (cargadas) localStorage.setItem(clave, JSON.stringify(respuestas));
  }, [clave, cargadas, respuestas]);

  return [respuestas, setRespuestas] as const;
}
