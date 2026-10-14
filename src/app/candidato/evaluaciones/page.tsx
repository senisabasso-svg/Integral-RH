import { desc, eq } from "drizzle-orm";
import { BotonLink, EncabezadoPagina, Etiqueta, Vacio } from "@/components/ui";
import { db } from "@/db";
import { evaluaciones } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { TIPO_EVALUACION_LABEL } from "@/lib/dominio";
import { MINUTOS_RAZONAMIENTO } from "@/lib/evaluaciones/razonamiento";
import { formatFecha } from "@/lib/utils";

export const metadata = { title: "Evaluaciones" };

const DESCRIPCION = {
  disc: "Conocé tu estilo de comportamiento. Sin respuestas correctas ni incorrectas, unos 10 minutos.",
  inteligencia: `Preguntas de razonamiento numérico, verbal, lógico y abstracto. ${MINUTOS_RAZONAMIENTO} minutos.`,
};

export default async function EvaluacionesCandidatoPage() {
  const usuario = await requireRol("candidato");
  const lista = await db
    .select({
      id: evaluaciones.id,
      tipo: evaluaciones.tipo,
      estado: evaluaciones.estado,
      iniciadaEn: evaluaciones.iniciadaEn,
      completadaEn: evaluaciones.completadaEn,
      creadoEn: evaluaciones.creadoEn,
    })
    .from(evaluaciones)
    .where(eq(evaluaciones.candidatoId, usuario.id))
    .orderBy(desc(evaluaciones.creadoEn));

  return (
    <>
      <EncabezadoPagina
        titulo="Evaluaciones"
        descripcion="El equipo de selección te asigna estas evaluaciones como parte de tus procesos."
      />
      {lista.length === 0 ? (
        <Vacio titulo="No tenés evaluaciones asignadas.">
          Cuando avances en un proceso, vas a encontrarlas acá.
        </Vacio>
      ) : (
        <ul className="space-y-3">
          {lista.map((evaluacion) => (
            <li
              key={evaluacion.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="max-w-xl">
                <p className="font-medium text-slate-900">{TIPO_EVALUACION_LABEL[evaluacion.tipo]}</p>
                <p className="mt-0.5 text-sm text-slate-500">{DESCRIPCION[evaluacion.tipo]}</p>
              </div>
              {evaluacion.estado === "completada" ? (
                <Etiqueta tono="verde">Completada el {formatFecha(evaluacion.completadaEn!)}</Etiqueta>
              ) : (
                <BotonLink href={`/candidato/evaluaciones/${evaluacion.id}`}>
                  {evaluacion.iniciadaEn ? "Continuar" : "Comenzar"}
                </BotonLink>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
