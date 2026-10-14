import { Etiqueta } from "@/components/ui";
import { TIPO_EVALUACION_LABEL, TIPOS_EVALUACION } from "@/lib/dominio";
import type { EvaluacionesCandidato } from "@/lib/consultas";
import { DIMENSIONES, PERFILES_DISC } from "@/lib/evaluaciones/disc";
import { AREA_LABEL, NIVEL_LABEL } from "@/lib/evaluaciones/razonamiento";
import type {
  AreaRazonamiento,
  ResultadoDisc,
  ResultadoRazonamiento,
} from "@/lib/evaluaciones/tipos";
import { formatFecha } from "@/lib/utils";

const COLOR_DIMENSION = {
  D: "bg-red-500",
  I: "bg-amber-400",
  S: "bg-emerald-500",
  C: "bg-marca-500",
};

export function VistaDisc({
  resultado,
  detalle = true,
}: {
  resultado: ResultadoDisc;
  detalle?: boolean;
}) {
  const perfil = PERFILES_DISC[resultado.principal];
  return (
    <div>
      <p className="text-sm font-semibold text-slate-900">
        Perfil {perfil.nombre} ({resultado.principal})
        <span className="font-normal text-slate-500">
          {" "}
          · secundario {PERFILES_DISC[resultado.secundario].nombre}
        </span>
      </p>
      <div className="mt-3 space-y-2">
        {DIMENSIONES.map((d) => (
          <div key={d} className="flex items-center gap-3 text-xs">
            <span className="w-28 text-slate-600">
              {d} · {PERFILES_DISC[d].nombre}
            </span>
            <div className="h-2 flex-1 rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${COLOR_DIMENSION[d]}`}
                style={{ width: `${resultado.puntajes[d]}%` }}
              />
            </div>
            <span className="w-8 text-right text-slate-700 tabular-nums">
              {resultado.puntajes[d]}
            </span>
          </div>
        ))}
      </div>
      {detalle && (
        <>
          <p className="mt-3 text-sm text-slate-600">{perfil.resumen}</p>
          <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-medium text-slate-700">Fortalezas</p>
              <p className="mt-1 text-slate-600">{perfil.fortalezas.join(", ")}</p>
            </div>
            <div>
              <p className="font-medium text-slate-700">Aspectos a desarrollar</p>
              <p className="mt-1 text-slate-600">{perfil.aDesarrollar.join(", ")}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function VistaRazonamiento({ resultado }: { resultado: ResultadoRazonamiento }) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-slate-900">{resultado.porcentaje}%</span>
        <span className="text-sm text-slate-600">Nivel {NIVEL_LABEL[resultado.nivel].toLowerCase()}</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {resultado.correctas} de {resultado.total} respuestas correctas
        {resultado.fueraDeTiempo && " · entregado fuera de tiempo"}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {(Object.keys(resultado.porArea) as AreaRazonamiento[]).map((area) => (
          <div key={area} className="flex justify-between rounded bg-slate-50 px-2 py-1.5">
            <span className="text-slate-600">{AREA_LABEL[area]}</span>
            <span className="font-medium text-slate-800 tabular-nums">
              {resultado.porArea[area].correctas}/{resultado.porArea[area].total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BloqueEvaluaciones({
  evaluaciones,
  detalle = true,
}: {
  evaluaciones: EvaluacionesCandidato | undefined;
  detalle?: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {TIPOS_EVALUACION.map((tipo) => {
        const evaluacion = evaluaciones?.[tipo];
        return (
          <div key={tipo} className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-900">{TIPO_EVALUACION_LABEL[tipo]}</p>
              {!evaluacion && <Etiqueta>No asignado</Etiqueta>}
              {evaluacion?.estado === "pendiente" && <Etiqueta tono="amarillo">Pendiente</Etiqueta>}
              {evaluacion?.estado === "completada" && evaluacion.completadaEn && (
                <span className="text-xs text-slate-500">{formatFecha(evaluacion.completadaEn)}</span>
              )}
            </div>
            {evaluacion?.resultado?.tipo === "disc" && (
              <VistaDisc resultado={evaluacion.resultado} detalle={detalle} />
            )}
            {evaluacion?.resultado?.tipo === "inteligencia" && (
              <VistaRazonamiento resultado={evaluacion.resultado} />
            )}
          </div>
        );
      })}
    </div>
  );
}
