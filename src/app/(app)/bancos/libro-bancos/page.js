import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import MovimientoForm from "@/components/bancos/MovimientoForm"
import { hasAccess } from "@/components/utils/HasAccess";

export default async function MovimientosPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login")
    
  if (!hasAccess(session.user, "movimientos-bancarios")) {
    redirect(`/error-acceso?modulo=movimientos-bancarios`);
  }
  return (
    <>
      <MovimientoForm/>
    </>
  );
}
