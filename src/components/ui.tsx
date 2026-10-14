import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variante = "primario" | "secundario" | "peligro" | "fantasma";
type Tamano = "sm" | "md";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-marca-600 text-white hover:bg-marca-700 disabled:bg-marca-300",
  secundario:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400",
  peligro: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  fantasma: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
};

const TAMANOS: Record<Tamano, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export function botonClases(variante: Variante = "primario", tamano: Tamano = "md") {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed",
    VARIANTES[variante],
    TAMANOS[tamano],
  );
}

export function Boton({
  variante,
  tamano,
  className,
  ...props
}: ComponentProps<"button"> & { variante?: Variante; tamano?: Tamano }) {
  return <button className={cn(botonClases(variante, tamano), className)} {...props} />;
}

export function BotonLink({
  variante,
  tamano,
  className,
  ...props
}: ComponentProps<typeof Link> & { variante?: Variante; tamano?: Tamano }) {
  return <Link className={cn(botonClases(variante, tamano), className)} {...props} />;
}

export function Tarjeta({
  titulo,
  acciones,
  children,
  className,
}: {
  titulo?: ReactNode;
  acciones?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      {(titulo || acciones) && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          {titulo && <h2 className="text-sm font-semibold text-slate-900">{titulo}</h2>}
          {acciones}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const TONOS = {
  gris: "bg-slate-100 text-slate-700",
  azul: "bg-marca-50 text-marca-700",
  verde: "bg-emerald-50 text-emerald-700",
  amarillo: "bg-amber-50 text-amber-800",
  rojo: "bg-red-50 text-red-700",
  violeta: "bg-violet-50 text-violet-700",
} as const;
export type Tono = keyof typeof TONOS;

export function Etiqueta({ tono = "gris", children }: { tono?: Tono; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONOS[tono],
      )}
    >
      {children}
    </span>
  );
}

export function EncabezadoPagina({
  titulo,
  descripcion,
  acciones,
  volver,
}: {
  titulo: ReactNode;
  descripcion?: ReactNode;
  acciones?: ReactNode;
  volver?: { href: string; texto: string };
}) {
  return (
    <div className="mb-6">
      {volver && (
        <Link href={volver.href} className="mb-2 inline-block text-sm text-marca-600 hover:underline">
          ← {volver.texto}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{titulo}</h1>
          {descripcion && <p className="mt-1 text-sm text-slate-500">{descripcion}</p>}
        </div>
        {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
      </div>
    </div>
  );
}

export function Vacio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 px-6 py-10 text-center">
      <p className="text-sm font-medium text-slate-700">{titulo}</p>
      {children && <div className="mt-2 text-sm text-slate-500">{children}</div>}
    </div>
  );
}

export function Indicador({
  etiqueta,
  valor,
  href,
  detalle,
}: {
  etiqueta: string;
  valor: ReactNode;
  href?: string;
  detalle?: string;
}) {
  const contenido = (
    <>
      <p className="text-sm text-slate-500">{etiqueta}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-slate-400">{detalle}</p>}
    </>
  );
  const clases = "block rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
  return href ? (
    <Link href={href} className={cn(clases, "transition-colors hover:border-marca-300")}>
      {contenido}
    </Link>
  ) : (
    <div className={clases}>{contenido}</div>
  );
}

export const inputClases =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20 focus:outline-none disabled:bg-slate-100";

export function Campo({
  etiqueta,
  error,
  ayuda,
  children,
  className,
}: {
  etiqueta: string;
  error?: string;
  ayuda?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-sm font-medium text-slate-700">{etiqueta}</span>
      {children}
      {ayuda && !error && <span className="mt-1 block text-xs text-slate-500">{ayuda}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClases, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputClases, "min-h-24", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(inputClases, className)} {...props} />;
}

export function Aviso({
  tono = "azul",
  children,
}: {
  tono?: "azul" | "verde" | "amarillo" | "rojo";
  children: ReactNode;
}) {
  const clases = {
    azul: "border-marca-200 bg-marca-50 text-marca-800",
    verde: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amarillo: "border-amber-200 bg-amber-50 text-amber-900",
    rojo: "border-red-200 bg-red-50 text-red-800",
  }[tono];
  return <div className={cn("rounded-lg border px-4 py-3 text-sm", clases)}>{children}</div>;
}
