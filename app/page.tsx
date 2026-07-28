import { redirect } from "next/navigation";
import { getIdentityContext } from "@/os/identity/session";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const ctx = await getIdentityContext();
  redirect(ctx ? "/home" : "/login");
}
