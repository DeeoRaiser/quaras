import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { hasAccess } from "@/components/utils/HasAccess";

import FacturaForm from "@/components/facturas-compras/FacturaForm";


export default async function Facturas() {

  return (
    <FacturaForm />
  );
}
