import Link from "next/link";
import { getIdentityContext } from "@/os/identity/session";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const ctx = await getIdentityContext();
  if (ctx) redirect("/home");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent font-display text-sm text-on-accent">
            R
          </span>
          <h1 className="mt-4 font-display text-2xl font-medium text-text">RDIOS</h1>
          <p className="mt-1 text-sm text-dim">The institutional operating system.</p>
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
