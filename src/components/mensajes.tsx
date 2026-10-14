import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { mensajes, usuarios } from "@/db/schema";
import { APP_NAME } from "@/lib/dominio";
import { cn, formatFechaHora, iniciales } from "@/lib/utils";
import { FormMensaje } from "./form-mensaje";

export async function HiloMensajes({
  solicitudId,
  usuarioId,
  cerrada,
}: {
  solicitudId: number;
  usuarioId: number;
  cerrada: boolean;
}) {
  const hilo = await db
    .select({
      id: mensajes.id,
      texto: mensajes.texto,
      creadoEn: mensajes.creadoEn,
      autorId: mensajes.autorId,
      autor: usuarios.nombre,
      rol: usuarios.rol,
    })
    .from(mensajes)
    .innerJoin(usuarios, eq(mensajes.autorId, usuarios.id))
    .where(eq(mensajes.solicitudId, solicitudId))
    .orderBy(asc(mensajes.creadoEn));

  return (
    <div className="space-y-4">
      {hilo.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no hay mensajes.</p>
      ) : (
        <ul className="space-y-4">
          {hilo.map((mensaje) => {
            const propio = mensaje.autorId === usuarioId;
            return (
              <li key={mensaje.id} className={cn("flex gap-3", propio && "flex-row-reverse")}>
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    mensaje.rol === "staff" ? "bg-marca-100 text-marca-700" : "bg-emerald-100 text-emerald-700",
                  )}
                >
                  {iniciales(mensaje.autor)}
                </span>
                <div className={cn("max-w-[80%]", propio && "text-right")}>
                  <p className="text-xs text-slate-500">
                    {mensaje.autor}
                    {mensaje.rol === "staff" && ` · ${APP_NAME}`} · {formatFechaHora(mensaje.creadoEn)}
                  </p>
                  <p
                    className={cn(
                      "mt-1 inline-block rounded-xl px-4 py-2 text-left text-sm whitespace-pre-line",
                      propio ? "bg-marca-600 text-white" : "bg-slate-100 text-slate-800",
                    )}
                  >
                    {mensaje.texto}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {cerrada ? (
        <p className="border-t border-slate-100 pt-4 text-sm text-slate-500">
          Esta solicitud está cerrada.
        </p>
      ) : (
        <FormMensaje solicitudId={solicitudId} />
      )}
    </div>
  );
}
