import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BotonEnviar } from "@/components/formulario";
import { Aviso, BotonLink, EncabezadoPagina, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { evaluaciones } from "@/db/schema";
import { iniciarEvaluacion } from "@/lib/acciones/evaluaciones";
import { requireRol } from "@/lib/auth";
import { TIPO_EVALUACION_LABEL } from "@/lib/dominio";
import { GRUPOS_DISC, opcionesDeGrupo } from "@/lib/evaluaciones/disc";
import { MINUTOS_RAZONAMIENTO, preguntasParaCandidato } from "@/lib/evaluaciones/razonamiento";
import { TestDisc } from "./test-disc";
import { TestRazonamiento } from "./test-razonamiento";

export const metadata = { title: "Evaluación" };

const INSTRUCCIONES = {
  disc: [
    "Vas a ver 24 grupos de cuatro palabras.",
    "En cada grupo elegí la palabra que más te representa y la que menos te representa.",
    "No hay respuestas correctas ni incorrectas: respondé pensando en cómo sos en el trabajo.",
    "Lleva unos 10 minutos.",
  ],
  inteligencia: [
    "Son 30 preguntas de opción múltiple: series numéricas, vocabulario, lógica y patrones.",
    `Tenés ${MINUTOS_RAZONAMIENTO} minutos desde que tocás «Comenzar». El tiempo corre aunque cierres la página.`,
    "Si se termina el tiempo, se entregan automáticamente las respuestas que tengas.",
    "Buscá un lugar tranquilo y no uses calculadora.",
  ],
};

export default async function EvaluacionPage({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await requireRol("candidato");
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [evaluacion] = await db
    .select()
    .from(evaluaciones)
    .where(and(eq(evaluaciones.id, id), eq(evaluaciones.candidatoId, usuario.id)));
  if (!evaluacion) notFound();

  const titulo = TIPO_EVALUACION_LABEL[evaluacion.tipo];
  const volver = { href: "/candidato/evaluaciones", texto: "Evaluaciones" };

  if (evaluacion.estado === "completada") {
    return (
      <>
        <EncabezadoPagina titulo={titulo} volver={volver} />
        <Aviso tono="verde">
          ¡Gracias! Recibimos tus respuestas. El equipo de selección va a revisar los resultados y
          te va a contactar si avanzás en el proceso.
        </Aviso>
        <BotonLink href="/candidato" variante="secundario" className="mt-6">
          Volver al inicio
        </BotonLink>
      </>
    );
  }

  if (!evaluacion.iniciadaEn) {
    return (
      <>
        <EncabezadoPagina titulo={titulo} volver={volver} />
        <Tarjeta titulo="Antes de empezar">
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            {INSTRUCCIONES[evaluacion.tipo].map((linea) => (
              <li key={linea}>{linea}</li>
            ))}
          </ul>
          <form action={iniciarEvaluacion} className="mt-6">
            <input type="hidden" name="id" value={evaluacion.id} />
            <BotonEnviar textoPendiente="Preparando…">Comenzar</BotonEnviar>
          </form>
        </Tarjeta>
      </>
    );
  }

  if (evaluacion.tipo === "disc") {
    const grupos = GRUPOS_DISC.map((grupo) => ({ id: grupo.id, opciones: opcionesDeGrupo(grupo) }));
    return (
      <>
        <EncabezadoPagina
          titulo={titulo}
          descripcion="En cada grupo elegí la palabra que más y la que menos te representa."
          volver={volver}
        />
        <TestDisc evaluacionId={evaluacion.id} grupos={grupos} />
      </>
    );
  }

  const finaliza = evaluacion.iniciadaEn.getTime() + MINUTOS_RAZONAMIENTO * 60_000;
  return (
    <>
      <EncabezadoPagina titulo={titulo} volver={volver} />
      <TestRazonamiento
        evaluacionId={evaluacion.id}
        preguntas={preguntasParaCandidato()}
        finalizaEn={finaliza}
      />
    </>
  );
}
