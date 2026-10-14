"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type ItemNav = { href: string; texto: string; exacto?: boolean };

export function NavPortal({ items }: { items: ItemNav[] }) {
  const ruta = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
      {items.map((item) => {
        const activo = item.exacto
          ? ruta === item.href
          : ruta === item.href || ruta.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              activo
                ? "bg-marca-50 text-marca-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {item.texto}
          </Link>
        );
      })}
    </nav>
  );
}
