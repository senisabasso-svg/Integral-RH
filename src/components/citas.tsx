import { Etiqueta, Vacio } from "@/components/ui";
import { TIPO_CITA_LABEL, type TipoCita } from "@/lib/dominio";
import { claveDia, formatDiaLargo, formatFechaHora, formatHora } from "@/lib/utils";

export type CitaVista = {
  id: number;
  titulo: string;
  tipo: TipoCita;
  inicio: Date;
  duracionMin: number;
  lugar: string | null;
  detalle?: string | null;
};

export function ListaCitas({ citas, vacio = "No hay citas próximas." }: { citas: CitaVista[]; vacio?: string }) {
  if (citas.length === 0) return <p className="text-sm text-slate-500">{vacio}</p>;
  return (
    <ul className="divide-y divide-slate-100">
      {citas.map((cita) => (
        <li key={cita.id} className="py-3 first:pt-0 last:pb-0">
          <p className="text-sm font-medium text-slate-900">{cita.titulo}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatFechaHora(cita.inicio)} · {TIPO_CITA_LABEL[cita.tipo]}
            {cita.lugar && ` · ${cita.lugar}`}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function AgendaPorDia({
  citas,
  acciones,
}: {
  citas: CitaVista[];
  acciones?: (cita: CitaVista) => React.ReactNode;
}) {
  if (citas.length === 0) {
    return <Vacio titulo="No hay citas agendadas para los próximos días." />;
  }
  const dias = new Map<string, CitaVista[]>();
  for (const cita of citas) {
    const clave = claveDia(cita.inicio);
    dias.set(clave, [...(dias.get(clave) ?? []), cita]);
  }
  return (
    <div className="space-y-6">
      {[...dias.entries()].map(([clave, delDia]) => (
        <section key={clave}>
          <h2 className="mb-2 text-sm font-semibold text-slate-700 first-letter:uppercase">
            {formatDiaLargo(delDia[0]!.inicio)}
          </h2>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {delDia.map((cita) => (
              <li key={cita.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                <div className="w-24 shrink-0">
                  <p className="text-sm font-semibold text-slate-900">{formatHora(cita.inicio)}</p>
                  <p className="text-xs text-slate-500">{cita.duracionMin} min</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{cita.titulo}</p>
                  {cita.lugar && <p className="mt-0.5 text-xs text-slate-500">{cita.lugar}</p>}
                  {cita.detalle && <p className="mt-1 text-xs text-slate-500">{cita.detalle}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Etiqueta>{TIPO_CITA_LABEL[cita.tipo]}</Etiqueta>
                  {acciones?.(cita)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
