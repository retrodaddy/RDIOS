import "server-only";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { INSTITUTION_TYPE_LABELS } from "@/os/identity/types";
import type { IdentityContext } from "@/os/identity/types";
import { mockPeopleProvider } from "@/applications/people/mock-provider";
import { mockWorkProvider } from "@/applications/work/mock-provider";
import { mockFinanceProvider } from "@/applications/finance/mock-provider";
import { resolveExpenseApprovalArea } from "@/applications/finance/policy";
import { mockCommunityProvider } from "@/applications/community/mock-provider";
import { DIRECTION_LABELS } from "@/applications/community/types";
import { personCanSatisfyArea, personHoldsPosition } from "@/engines/authority/resolver";
import { PERMISSION_LABELS } from "@/engines/authority/types";
import { listHistory } from "./history-store";
import type { AttentionItem, BeAwareItem, HistoryEntry } from "./types";

const WARRANTY_LOOKAHEAD_DAYS = 30;
const RELATIONSHIP_QUIET_AFTER_DAYS = 180;

/**
 * The Attention Engine, composed exactly as the frozen Product Foundation
 * describes: reads across whatever is active, decides what crosses the
 * threshold, writes to nothing. It reads through each application's real
 * data — Identity, People, and (M6) Work today — never a parallel
 * description of the same fact. Work is the first application whose Act
 * Now contribution is genuinely per-person, not per-institution: what
 * lands in Act Now depends on which tasks are assigned to *this* person
 * and which Approval steps *this* person can currently satisfy — the
 * literal proof that M5's Authority Engine and this Engine compose
 * correctly together.
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
  } else if (ctx.institution.founderPersonId === ctx.person.id) {
    // The Product Validation Sprint's second-highest finding: a founder can
    // build out their whole organization and never notice they aren't
    // seated anywhere in it. Founder bypass means this never blocks
    // anything real, which is exactly why it needs to be surfaced here
    // instead of staying invisible.
    const holdings = await mockPeopleProvider.listPositionHoldersForPerson(ctx.person.id);
    const holdsAnyPosition = holdings.some((h) => !h.endedAt);
    if (!holdsAnyPosition) {
      items.push({
        id: "seat-founder",
        title: "You're not seated in your own organization yet",
        meta: "Appoint yourself to a position so it's visible, not just true",
        verb: "Appoint",
        href: "/people",
      });
    }
  }

  const workItems = await mockWorkProvider.listWorkItems(ctx.institution.id);
  for (const item of workItems) {
    if (item.kind === "task") {
      if (item.assigneePersonId === ctx.person.id && item.status !== "complete") {
        items.push({
          id: `task-${item.id}`,
          title: item.title,
          meta: item.status === "in_progress" ? "In progress — assigned to you" : "Assigned to you",
          verb: "Complete",
          href: "/work",
        });
      }
      continue;
    }

    if (item.status !== "pending" || item.createdByPersonId === ctx.person.id) continue;
    const step = item.chain[item.currentStepIndex];
    const canAct =
      (await personCanSatisfyArea(ctx.institution, ctx.person, step.area)) ||
      (!!step.escalatedToPositionId && (await personHoldsPosition(ctx.person.id, step.escalatedToPositionId)));
    if (canAct) {
      items.push({
        id: `approval-${item.id}`,
        title: item.title,
        meta: `Awaiting ${PERMISSION_LABELS[step.area]} approval`,
        verb: "Review",
        href: "/work",
      });
    }
  }

  // Finance (M7) — real decisions only, never artificial nudges: an
  // expense someone here can actually approve, an asset in active use
  // with nobody accountable for it, and a warranty about to lapse. Same
  // same-actor exclusion as Work's Approvals — nobody sees their own
  // expense as something they can decide.
  const transactions = await mockFinanceProvider.listTransactions(ctx.institution.id);
  for (const item of transactions) {
    if (item.kind !== "expense" || item.approvalStatus !== "pending" || item.createdByPersonId === ctx.person.id) continue;
    const area = resolveExpenseApprovalArea(item);
    if (await personCanSatisfyArea(ctx.institution, ctx.person, area)) {
      items.push({
        id: `expense-${item.id}`,
        title: item.title,
        meta: `Awaiting ${PERMISSION_LABELS[area]} approval — ₹${item.amount.toLocaleString("en-IN")}`,
        verb: "Review",
        href: "/money",
      });
    }
  }

  if (ctx.permissions.has("assets.manage")) {
    const assets = await mockFinanceProvider.listAssets(ctx.institution.id);
    for (const asset of assets) {
      if (asset.status === "in_use" && !asset.custodianPersonId) {
        items.push({
          id: `asset-custodian-${asset.id}`,
          title: asset.name,
          meta: "In use, with nobody accountable for it",
          verb: "Assign",
          href: "/money",
        });
      }
      if (asset.warrantyExpiresAt) {
        const daysLeft = Math.ceil((new Date(asset.warrantyExpiresAt).getTime() - Date.now()) / 86_400_000);
        if (daysLeft >= 0 && daysLeft <= WARRANTY_LOOKAHEAD_DAYS) {
          items.push({
            id: `asset-warranty-${asset.id}`,
            title: asset.name,
            meta: daysLeft === 0 ? "Warranty expires today" : `Warranty expires in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`,
            verb: "Review",
            href: "/money",
          });
        }
      }
    }
  }

  // Community (M8) — real decisions only, the same discipline Finance's
  // own M7 build already proved out: a contact whose active relationship
  // has no way to actually be reached, and a relationship that's gone
  // quiet long enough to be worth a look. Never a manufactured "health
  // score" — the Community Domain Reconsideration explicitly rejected
  // one; `lastActivityAt` is a real, honest timestamp, not an invented
  // metric.
  if (ctx.permissions.has("community.manage")) {
    const contacts = await mockCommunityProvider.listContacts(ctx.institution.id);
    for (const contact of contacts) {
      if (contact.status !== "active") continue;
      const hasActiveRelationship = contact.relationships.some((r) => r.status === "active");
      if (!hasActiveRelationship) continue;

      const reachable = !!contact.email || !!contact.phone || contact.pointsOfContact.length > 0;
      if (!reachable) {
        items.push({
          id: `contact-unreachable-${contact.id}`,
          title: contact.name,
          meta: "No way to reach this contact yet",
          verb: "Add",
          href: "/customers",
        });
      }

      for (const relationship of contact.relationships) {
        if (relationship.status !== "active") continue;
        const daysQuiet = Math.floor((Date.now() - new Date(relationship.lastActivityAt).getTime()) / 86_400_000);
        if (daysQuiet >= RELATIONSHIP_QUIET_AFTER_DAYS) {
          items.push({
            id: `relationship-quiet-${relationship.id}`,
            title: contact.name,
            meta: `${DIRECTION_LABELS[relationship.direction]} relationship — quiet for ${daysQuiet} days`,
            verb: "Review",
            href: "/customers",
          });
        }
      }
    }
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

  const workItems = await mockWorkProvider.listWorkItems(ctx.institution.id);
  if (workItems.length > 0) {
    const openTasks = workItems.filter((w) => w.kind === "task" && w.status !== "complete").length;
    const pendingApprovals = workItems.filter((w) => w.kind === "approval" && w.status === "pending").length;
    items.push({
      id: "work",
      label: "Work",
      value: `${openTasks} open ${openTasks === 1 ? "task" : "tasks"}`,
      sub: `${pendingApprovals} pending ${pendingApprovals === 1 ? "approval" : "approvals"}`,
    });
  }

  const transactionsForBeAware = await mockFinanceProvider.listTransactions(ctx.institution.id);
  const active = transactionsForBeAware.filter((t) => t.status !== "archived");
  if (active.length > 0) {
    const recordedIncome = active.filter((t) => t.kind === "income").reduce((sum, t) => sum + t.amount, 0);
    const recordedExpense = active.filter((t) => t.kind === "expense").reduce((sum, t) => sum + t.amount, 0);
    items.push({
      id: "money",
      label: "Money",
      value: `₹${recordedIncome.toLocaleString("en-IN")} in, ₹${recordedExpense.toLocaleString("en-IN")} out`,
      sub: `${active.length} recorded ${active.length === 1 ? "entry" : "entries"}`,
    });
  }

  const assetsForBeAware = await mockFinanceProvider.listAssets(ctx.institution.id);
  if (assetsForBeAware.length > 0) {
    const unaccounted = assetsForBeAware.filter((a) => a.status === "in_use" && !a.custodianPersonId).length;
    items.push({
      id: "assets",
      label: "Assets",
      value: `${assetsForBeAware.length} registered`,
      sub: unaccounted > 0 ? `${unaccounted} in use without a custodian` : "All accounted for",
    });
  }

  const contactsForBeAware = await mockCommunityProvider.listContacts(ctx.institution.id);
  const activeContacts = contactsForBeAware.filter((c) => c.status === "active");
  if (activeContacts.length > 0) {
    const byDirection = { receiving: 0, supporting: 0, supplying: 0 } as Record<string, number>;
    for (const contact of activeContacts) {
      for (const r of contact.relationships) {
        if (r.status === "active") byDirection[r.direction] += 1;
      }
    }
    items.push({
      id: "community",
      label: "Community",
      value: `${activeContacts.length} ${activeContacts.length === 1 ? "contact" : "contacts"}`,
      sub: `${byDirection.receiving} receiving, ${byDirection.supporting} supporting, ${byDirection.supplying} supplying`,
    });
  }

  return items;
}

export async function composeHistory(ctx: IdentityContext): Promise<HistoryEntry[]> {
  return listHistory(ctx.institution.id);
}
