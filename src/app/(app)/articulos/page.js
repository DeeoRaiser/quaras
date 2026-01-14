import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { hasAccess } from "@/components/utils/HasAccess";

import ArticuloPage from "@/components/articulos/ArticulosPage";


export default async function Proveedores() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login")

  if (!hasAccess(session.user, "articulos")) {
    redirect(`/error-acceso?modulo=articulos`);
  }
  return (
    <ArticuloPage />
  );
}
