"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const EVENTO_CAMBIO = "irh-respuestas";

function suscribir(aviso: () => void) {
  window.addEventListener(EVENTO_CAMBIO, aviso);
  window.addEventListener("storage", aviso);
  return () => {
    window.removeEventListener(EVENTO_CAMBIO, aviso);
    window.removeEventListener("storage", aviso);
  };
}

function leer<T>(texto: string | null): T {
  try {
    return (texto ? JSON.parse(texto) : {}) as T;
  } catch {
    return {} as T;
  }
}

export function useRespuestasGuardadas<T extends object>(evaluacionId: number) {
  const clave = `irh-evaluacion-${evaluacionId}`;
  const texto = useSyncExternalStore(
    suscribir,
    () => localStorage.getItem(clave),
    () => null,
  );
  const respuestas = useMemo(() => leer<T>(texto), [texto]);

  const setRespuestas = useCallback(
    (actualizar: (previas: T) => T) => {
      const nuevas = actualizar(leer<T>(localStorage.getItem(clave)));
      localStorage.setItem(clave, JSON.stringify(nuevas));
      window.dispatchEvent(new Event(EVENTO_CAMBIO));
    },
    [clave],
  );

  return [respuestas, setRespuestas] as const;
}
