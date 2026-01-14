import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { hasAccess } from "@/components/utils/HasAccess";

import ClientesPage from "@/components/clientes/ClientesPage";


export default async function Proveedores() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login")

  if (!hasAccess(session.user, "clientes")) {
    redirect(`/error-acceso?modulo=clientes`);
  }
  return (
    <ClientesPage />
  );
}
