import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { hasAccess } from "@/components/utils/HasAccess";

import CuentaCorrienteClientes from "@/components/clientes/CuentaCorrienteClientes";

export default async function CuentaCorrienteClientesPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  if (!hasAccess(session.user, "clientes-cuentas-corrientes")) {
    redirect("/error-acceso?modulo=clientes-cuentas-corrientes");
  }

  return (
    <CuentaCorrienteClientes title="Cuenta Corriente Clientes" />
  );
}
