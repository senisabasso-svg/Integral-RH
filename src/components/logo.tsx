import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/dominio";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  claro = false,
  grande = false,
}: {
  href?: string;
  claro?: boolean;
  grande?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center",
        claro && "rounded-xl bg-white px-3 py-2 shadow-sm",
      )}
      aria-label={APP_NAME}
    >
      <Image
        src="/logo-impulso-humano.png"
        alt={APP_NAME}
        width={grande ? 280 : 180}
        height={grande ? 120 : 56}
        priority
        className={cn("h-auto w-auto", grande ? "max-h-20" : "max-h-10")}
      />
    </Link>
  );
}
