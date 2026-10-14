import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-marca-950 via-marca-900 to-marca-700 px-4 py-12">
      <div className="mb-8">
        <Logo claro />
      </div>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">{children}</div>
    </div>
  );
}
