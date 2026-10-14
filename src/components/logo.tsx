import Link from "next/link";
import { APP_NAME } from "@/lib/dominio";
import { cn, iniciales } from "@/lib/utils";

export function Logo({ href = "/", claro = false }: { href?: string; claro?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-marca-600 text-sm font-bold text-white">
        {iniciales(APP_NAME)}
      </span>
      <span
        className={cn(
          "text-base font-semibold tracking-tight",
          claro ? "text-white" : "text-slate-900",
        )}
      >
        {APP_NAME}
      </span>
    </Link>
  );
}
