import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EncabezadoPagina, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { procesos } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { opcionesEmpresas, opcionesStaff } from "@/lib/consultas";
import { FormProceso } from "../../form-proceso";

export const metadata = { title: "Editar proceso" };

export default async function EditarProcesoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRol("staff");
  const id = Number((await params).id);
  const [proceso] = Number.isInteger(id)
    ? await db.select().from(procesos).where(eq(procesos.id, id))
    : [];
  if (!proceso) notFound();

  return (
    <>
      <EncabezadoPagina
        titulo="Editar proceso"
        volver={{ href: `/staff/procesos/${proceso.id}`, texto: proceso.titulo }}
      />
      <Tarjeta>
        <FormProceso empresas={await opcionesEmpresas()} staff={await opcionesStaff()} inicial={proceso} />
      </Tarjeta>
    </>
  );
}
