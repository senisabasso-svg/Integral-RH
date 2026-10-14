"use client";

import { useActionState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { enviarEvaluacion } from "@/lib/acciones/evaluaciones";
import { cn } from "@/lib/utils";
import { useRespuestasGuardadas } from "./respuestas-guardadas";

type Grupo = { id: number; opciones: { indice: number; texto: string }[] };
type Eleccion = { mas?: number; menos?: number };

export function TestDisc({ evaluacionId, grupos }: { evaluacionId: number; grupos: Grupo[] }) {
  const [estado, accion] = useActionState(enviarEvaluacion, undefined);
  const [respuestas, setRespuestas] = useRespuestasGuardadas<Record<number, Eleccion>>(evaluacionId);

  const completos = grupos.filter((g) => {
    const r = respuestas[g.id];
    return r?.mas !== undefined && r.menos !== undefined;
  }).length;

  function elegir(grupoId: number, campo: "mas" | "menos", indice: number) {
    setRespuestas((previas) => {
      const actual = { ...previas[grupoId], [campo]: indice };
      const otro = campo === "mas" ? "menos" : "mas";
      if (actual[otro] === indice) delete actual[otro];
      return { ...previas, [grupoId]: actual };
    });
  }

  return (
    <form action={accion} className="space-y-4">
      <input type="hidden" name="id" value={evaluacionId} />
      <input type="hidden" name="respuestas" value={JSON.stringify(respuestas)} />

      <div className="sticky top-0 z-10 -mx-2 flex items-center justify-between rounded-lg bg-slate-50/95 px-2 py-3 backdrop-blur">
        <p className="text-sm text-slate-600">
          Respondidos <span className="font-semibold text-slate-900">{completos}</span> de {grupos.length}
        </p>
        <div className="h-2 w-40 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-marca-500 transition-all"
            style={{ width: `${(completos / grupos.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {grupos.map((grupo, n) => (
          <fieldset key={grupo.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <legend className="sr-only">Grupo {n + 1}</legend>
            <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-x-4 text-xs font-medium text-slate-500">
              <span>Grupo {n + 1}</span>
              <span className="w-12 text-center">Más</span>
              <span className="w-12 text-center">Menos</span>
            </div>
            {grupo.opciones.map((opcion) => {
              const r = respuestas[grupo.id];
              return (
                <div
                  key={opcion.indice}
                  className={cn(
                    "grid grid-cols-[1fr_auto_auto] items-center gap-x-4 rounded-md px-2 py-1.5 text-sm",
                    r?.mas === opcion.indice && "bg-emerald-50",
                    r?.menos === opcion.indice && "bg-slate-100",
                  )}
                >
                  <span className="text-slate-800">{opcion.texto}</span>
                  <label className="flex w-12 justify-center">
                    <input
                      type="radio"
                      name={`mas-${grupo.id}`}
                      checked={r?.mas === opcion.indice}
                      onChange={() => elegir(grupo.id, "mas", opcion.indice)}
                      aria-label={`${opcion.texto}: más me representa`}
                    />
                  </label>
                  <label className="flex w-12 justify-center">
                    <input
                      type="radio"
                      name={`menos-${grupo.id}`}
                      checked={r?.menos === opcion.indice}
                      onChange={() => elegir(grupo.id, "menos", opcion.indice)}
                      aria-label={`${opcion.texto}: menos me representa`}
                    />
                  </label>
                </div>
              );
            })}
          </fieldset>
        ))}
      </div>

      <AvisoFormulario estado={estado} />
      <div className="flex items-center gap-3">
        <BotonEnviar disabled={completos < grupos.length} textoPendiente="Enviando…">
          Enviar respuestas
        </BotonEnviar>
        {completos < grupos.length && (
          <p className="text-sm text-slate-500">Faltan {grupos.length - completos} grupos.</p>
        )}
      </div>
    </form>
  );
}
