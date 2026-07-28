import Link from "next/link";
import { getIdentityContext } from "@/os/identity/session";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const ctx = await getIdentityContext();
  if (ctx) redirect("/home");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent font-display text-sm text-on-accent">
            R
          </span>
          <h1 className="mt-4 font-display text-2xl font-medium text-text">Set up your institution</h1>
          <p className="mt-1 text-sm text-dim">A minute to get started — you can refine everything later.</p>
        </div>

        <OnboardingForm />

        <p className="mt-6 text-center text-sm text-dim">
          Already set up?{" "}
          <Link href="/login" className="text-accent-bright hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
