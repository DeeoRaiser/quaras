import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { hasAccess } from "@/components/utils/HasAccess";

import BancosPage from "@/components/bancos/BancosPage";

export default async function Bancos() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  if (!hasAccess(session.user, "listado-bancos")) {
    redirect(`/error-acceso?modulo=listado-bancos`);
  }

  return <BancosPage />;
}
