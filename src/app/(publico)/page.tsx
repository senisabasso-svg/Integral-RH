import { BotonLink } from "@/components/ui";
import { SERVICIOS } from "@/lib/dominio";

const DIFERENCIALES = [
  {
    titulo: "Enfoque integral",
    texto: "Un único punto de contacto para recursos humanos, legal, contabilidad y bienestar.",
  },
  {
    titulo: "Personalización",
    texto: "Cada servicio se adapta a las necesidades específicas de tu empresa.",
  },
  {
    titulo: "Interdisciplinariedad",
    texto: "Profesionales de distintas áreas trabajando juntos sobre el mismo caso.",
  },
  {
    titulo: "Evaluaciones especializadas",
    texto: "Test de inteligencia y DISC para elegir mejor y armar equipos más cohesivos.",
  },
  {
    titulo: "Tecnología",
    texto: "Un portal para seguir búsquedas, solicitudes y agenda sin depender del mail.",
  },
];

const PASOS_EMPRESA = [
  "Creá la cuenta de tu empresa y contanos qué necesitás.",
  "Asignamos al profesional indicado para cada tema.",
  "Seguís todo desde tu portal: candidatos, informes, mensajes y agenda.",
];

const PASOS_CANDIDATO = [
  "Creá tu perfil y subí tu CV.",
  "Postulate a las búsquedas abiertas.",
  "Completá las evaluaciones y seguí el avance de tu proceso.",
];

export default function InicioPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-marca-950 via-marca-900 to-marca-700 text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-medium tracking-wide text-marca-200 uppercase">
              Recursos humanos integrales en Uruguay
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Todo lo que tu empresa necesita para su gente, en un solo lugar
            </h1>
            <p className="mt-6 text-lg text-marca-100">
              Selección y administración de personal junto a asesoría legal, contable, coaching,
              psicología y medicina laboral. Un equipo interdisciplinario para un ambiente de
              trabajo saludable y productivo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BotonLink href="/registro/empresa" className="bg-white text-marca-900 hover:bg-marca-50">
                Solicitar un servicio
              </BotonLink>
              <BotonLink
                href="/empleos"
                variante="fantasma"
                className="border border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Ver empleos
              </BotonLink>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm font-medium text-marca-200">Así se ve tu portal</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="rounded-lg bg-white/10 px-4 py-3">
                <p className="font-medium">Búsqueda: Analista contable</p>
                <p className="text-marca-200">3 candidatos presentados con informe</p>
              </li>
              <li className="rounded-lg bg-white/10 px-4 py-3">
                <p className="font-medium">Evaluaciones DISC y razonamiento</p>
                <p className="text-marca-200">Resultados listos para revisar</p>
              </li>
              <li className="rounded-lg bg-white/10 px-4 py-3">
                <p className="font-medium">Consulta legal laboral</p>
                <p className="text-marca-200">En curso · respuesta del equipo legal</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="servicios" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-20">
        <h2 className="text-3xl font-semibold tracking-tight">Servicios</h2>
        <p className="mt-2 text-slate-600">
          Seis áreas coordinadas por un mismo equipo, para que no tengas que salir a buscar a cada
          especialista por separado.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS.map((servicio) => (
            <article
              key={servicio.tipo}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-marca-50 text-sm font-semibold text-marca-700">
                {servicio.sigla}
              </span>
              <h3 className="mt-4 font-semibold">{servicio.titulo}</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                {servicio.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-marca-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-semibold tracking-tight">Por qué elegirnos</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {DIFERENCIALES.map((diferencial) => (
              <div key={diferencial.titulo}>
                <h3 className="font-semibold text-marca-800">{diferencial.titulo}</h3>
                <p className="mt-2 text-sm text-slate-600">{diferencial.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-20 lg:grid-cols-2">
        {[
          {
            titulo: "Para empresas",
            pasos: PASOS_EMPRESA,
            cta: { href: "/registro/empresa", texto: "Crear cuenta de empresa" },
          },
          {
            titulo: "Para candidatos",
            pasos: PASOS_CANDIDATO,
            cta: { href: "/registro/candidato", texto: "Crear mi perfil" },
          },
        ].map((bloque) => (
          <div key={bloque.titulo} className="rounded-2xl border border-slate-200 p-8">
            <h2 className="text-xl font-semibold">{bloque.titulo}</h2>
            <ol className="mt-6 space-y-4">
              {bloque.pasos.map((paso, i) => (
                <li key={paso} className="flex gap-4 text-sm text-slate-700">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-marca-600 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-1">{paso}</span>
                </li>
              ))}
            </ol>
            <BotonLink href={bloque.cta.href} variante="secundario" className="mt-8">
              {bloque.cta.texto}
            </BotonLink>
          </div>
        ))}
      </section>
    </>
  );
}
