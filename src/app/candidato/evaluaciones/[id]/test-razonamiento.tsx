"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { enviarEvaluacion } from "@/lib/acciones/evaluaciones";
import { cn } from "@/lib/utils";
import { useRespuestasGuardadas } from "./respuestas-guardadas";

type Pregunta = { id: number; enunciado: string; opciones: string[] };

function formatoReloj(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutos = Math.floor(total / 60);
  const segundos = total % 60;
  return `${minutos}:${String(segundos).padStart(2, "0")}`;
}

export function TestRazonamiento({
  evaluacionId,
  preguntas,
  finalizaEn,
}: {
  evaluacionId: number;
  preguntas: Pregunta[];
  finalizaEn: number;
}) {
  const [estado, accion] = useActionState(enviarEvaluacion, undefined);
  const [respuestas, setRespuestas] = useRespuestasGuardadas<Record<number, number>>(evaluacionId);
  const [restante, setRestante] = useState(() => finalizaEn - Date.now());
  const formulario = useRef<HTMLFormElement>(null);
  const enviado = useRef(false);

  useEffect(() => {
    const intervalo = setInterval(() => {
      const quedan = finalizaEn - Date.now();
      setRestante(quedan);
      if (quedan <= 0 && !enviado.current) {
        enviado.current = true;
        formulario.current?.requestSubmit();
      }
    }, 1000);
    return () => clearInterval(intervalo);
  }, [finalizaEn]);

  const respondidas = Object.keys(respuestas).length;
  const pocoTiempo = restante < 2 * 60_000;

  return (
    <form
      ref={formulario}
      action={accion}
      onSubmit={(evento) => {
        const faltan = preguntas.length - respondidas;
        if (restante > 0 && faltan > 0 && !confirm(`Te faltan ${faltan} preguntas. ¿Querés entregar igual?`)) {
          evento.preventDefault();
          return;
        }
        enviado.current = true;
      }}
      className="space-y-4"
    >
      <input type="hidden" name="id" value={evaluacionId} />
      <input type="hidden" name="respuestas" value={JSON.stringify(respuestas)} />

      <div className="sticky top-0 z-10 -mx-2 flex items-center justify-between rounded-lg bg-slate-50/95 px-2 py-3 backdrop-blur">
        <p className="text-sm text-slate-600">
          Respondidas <span className="font-semibold text-slate-900">{respondidas}</span> de {preguntas.length}
        </p>
        <p
          suppressHydrationWarning
          className={cn(
            "rounded-lg px-3 py-1 font-mono text-sm font-semibold tabular-nums",
            pocoTiempo ? "bg-red-50 text-red-700" : "bg-white text-slate-800",
          )}
        >
          {formatoReloj(restante)}
        </p>
      </div>

      <ol className="space-y-4">
        {preguntas.map((pregunta, n) => (
          <li key={pregunta.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-900">
              {n + 1}. {pregunta.enunciado}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {pregunta.opciones.map((opcion, i) => (
                <label
                  key={opcion}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                    respuestas[pregunta.id] === i
                      ? "border-marca-400 bg-marca-50 text-marca-900"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <input
                    type="radio"
                    name={`pregunta-${pregunta.id}`}
                    checked={respuestas[pregunta.id] === i}
                    onChange={() => setRespuestas((previas) => ({ ...previas, [pregunta.id]: i }))}
                  />
                  {opcion}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <AvisoFormulario estado={estado} />
      <BotonEnviar textoPendiente="Entregando…">Entregar</BotonEnviar>
    </form>
  );
}
