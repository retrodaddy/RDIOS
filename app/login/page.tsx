import Link from "next/link";
import { getIdentityContext } from "@/os/identity/session";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { BrandLockup } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const ctx = await getIdentityContext();
  if (ctx) redirect("/home");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <BrandLockup />
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-dim">
          New institution?{" "}
          <Link href="/onboarding" className="text-accent-bright hover:underline">
            Set one up
          </Link>
        </p>
      </div>
    </main>
  );
}
