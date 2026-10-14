import { Logo } from "@/components/logo";
import { NavPortal, type ItemNav } from "@/components/nav-portal";
import { salir } from "@/lib/acciones/auth";
import { RUTA_INICIO, type UsuarioSesion } from "@/lib/auth";
import { iniciales } from "@/lib/utils";

export function Portal({
  usuario,
  subtitulo,
  items,
  children,
}: {
  usuario: UsuarioSesion;
  subtitulo: string;
  items: ItemNav[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:w-60 lg:border-r lg:border-b-0">
        <div className="flex h-16 items-center px-5">
          <Logo href={RUTA_INICIO[usuario.rol]} />
        </div>
        <NavPortal items={items} />
      </aside>
      <div className="flex-1 lg:pl-60">
        <header className="flex h-16 items-center justify-end gap-3 border-b border-slate-200 bg-white px-6">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{usuario.nombre}</p>
            <p className="text-xs text-slate-500">{subtitulo}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-marca-100 text-sm font-semibold text-marca-700">
            {iniciales(usuario.nombre)}
          </span>
          <form action={salir}>
            <button
              type="submit"
              className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              Salir
            </button>
          </form>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
