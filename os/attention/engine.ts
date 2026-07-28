import "server-only";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { INSTITUTION_TYPE_LABELS } from "@/os/identity/types";
import type { IdentityContext } from "@/os/identity/types";
import { mockPeopleProvider } from "@/applications/people/mock-provider";
import { listHistory } from "./history-store";
import type { AttentionItem, BeAwareItem, HistoryEntry } from "./types";

/**
 * The Attention Engine, composed exactly as the frozen Product Foundation
 * describes: reads across whatever is active, decides what crosses the
 * threshold, writes to nothing. It reads through each application's real
 * data — Identity and People today — never a parallel description of the
 * same fact. There is exactly one place "who reports to whom" lives: the
 * People application's real Positions. Home only ever reflects that, it
 * never asks the question a second time in its own words.
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

  const positions = await mockPeopleProvider.listPositions(ctx.institution.id);
  if (positions.length === 0) {
    items.push({
      id: "shape-organization",
      title: "Who reports to whom?",
      meta: "Start with one position — the rest can follow later",
      verb: "Shape",
      href: "/people",
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

  const positions = await mockPeopleProvider.listPositions(ctx.institution.id);
  if (positions.length > 0) {
    const holdersByPosition = await Promise.all(positions.map((p) => mockPeopleProvider.listPositionHolders(p.id)));
    const filled = holdersByPosition.filter((holders) => holders.some((h) => !h.endedAt)).length;
    items.push({
      id: "organization",
      label: "Organization",
      value: `${positions.length} ${positions.length === 1 ? "position" : "positions"}`,
      sub: `${filled} filled, ${positions.length - filled} unfilled`,
    });
  }

  return items;
}

export async function composeHistory(ctx: IdentityContext): Promise<HistoryEntry[]> {
  return listHistory(ctx.institution.id);
}
