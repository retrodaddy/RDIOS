import { AcceptButton } from "./AcceptButton";
import { BrandMark } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function AcceptInvitePage({ params }: { params: { membershipId: string } }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <BrandMark />
        <h1 className="mt-4 font-display text-2xl font-medium text-text">You&apos;ve been invited.</h1>
        <p className="mt-2 text-sm text-dim">Accept to join and sign in — no password needed.</p>
        <div className="mt-6">
          <AcceptButton membershipId={params.membershipId} />
        </div>
      </div>
    </main>
  );
}
