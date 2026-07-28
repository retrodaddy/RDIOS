import "server-only";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { INSTITUTION_TYPE_LABELS } from "@/os/identity/types";
import type { IdentityContext } from "@/os/identity/types";
import { listHistory } from "./history-store";
import { getOrganizationShape, isOrganizationShaped } from "./org-shape-store";
import type { AttentionItem, BeAwareItem, HistoryEntry } from "./types";

/**
 * The Attention Engine, composed exactly as the frozen Product Foundation
 * describes: reads across whatever is active, decides what crosses the
 * threshold, writes to nothing. Today it reads Identity directly because
 * Identity is the only real application; once People/Work/Money exist,
 * each becomes a provider this function calls through the Attention
 * Contract instead of reaching into a domain directly — the seam is named
 * here so that swap is additive, not a rewrite.
 */
export async function composeActNow(ctx: IdentityContext): Promise<AttentionItem[]> {
  const items: AttentionItem[] = [];

  const memberships = await mockIdentityProvider.listMembershipsForInstitution(ctx.institution.id);
  const activeHere = memberships.filter((m) => m.status === "active");
  if (activeHere.length <= 1) {
    items.push({
      id: "invite-first-teammate",
      title: "You're the only one here",
      meta: "Nothing runs alone for long",
      verb: "Invite",
      href: "/settings",
    });
  }

  if (!(await isOrganizationShaped(ctx.institution.id))) {
    items.push({
      id: "shape-organization",
      title: "Who reports to whom?",
      meta: "A rough shape is enough for now",
      verb: "Shape",
      kind: "shape-organization",
      href: "/home",
    });
  }

  return items;
}

export async function composeBeAware(ctx: IdentityContext): Promise<BeAwareItem[]> {
  const items: BeAwareItem[] = [
    {
      id: "institution",
      label: "Institution",
      value: ctx.institution.name,
      sub: INSTITUTION_TYPE_LABELS[ctx.institution.type],
    },
  ];

  if (ctx.institution.purpose) {
    items.push({ id: "purpose", label: "Purpose", value: ctx.institution.purpose, sub: "" });
  }

  const orgShape = await getOrganizationShape(ctx.institution.id);
  if (orgShape) {
    items.push({ id: "organization", label: "Organization", value: orgShape, sub: "" });
  }

  return items;
}

export async function composeHistory(ctx: IdentityContext): Promise<HistoryEntry[]> {
  return listHistory(ctx.institution.id);
}
