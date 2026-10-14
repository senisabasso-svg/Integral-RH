import Link from "next/link";
import { Logo } from "@/components/logo";
import { BotonLink } from "@/components/ui";
import { APP_NAME } from "@/lib/dominio";

export default function PublicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/#servicios"
              className="hidden rounded-lg px-3 py-2 text-slate-600 hover:text-slate-900 sm:block"
            >
              Servicios
            </Link>
            <Link href="/empleos" className="rounded-lg px-3 py-2 text-slate-600 hover:text-slate-900">
              Empleos
            </Link>
            <Link href="/login" className="rounded-lg px-3 py-2 text-slate-600 hover:text-slate-900">
              Ingresar
            </Link>
            <BotonLink href="/registro/empresa" tamano="sm" className="ml-2">
              Soy empresa
            </BotonLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {APP_NAME} · Uruguay
          </p>
          <p>Recursos humanos, legal, contabilidad, coaching, psicología y medicina laboral.</p>
        </div>
      </footer>
    </div>
  );
}
