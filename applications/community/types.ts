/**
 * Community — M8, the external counterpart to People (applications/people),
 * built exactly per the frozen ARUMBU Community Domain Review v1 and its
 * Reconsideration v1. Nothing here reopens either document; every shape
 * below is the accepted architecture, implemented.
 *
 * Contact + Relationship is the two-tier shape People already proved with
 * Person + Membership: a Contact is the external identity (institution-
 * scoped, not global — the Reconsideration's own deliberate divergence
 * from Person, since no proven need for cross-institution Contact matching
 * exists yet); a Relationship is the fact that a Contact relates to this
 * institution, carrying a universal Direction and an institution-
 * configured Type. A single Contact may hold more than one concurrent
 * Relationship, the same "more than one thing attached to one identity"
 * shape Membership already proved for Position and Affiliation.
 */

export const CONTACT_KINDS = ["individual", "organization"] as const;
export type ContactKind = (typeof CONTACT_KINDS)[number];
export const CONTACT_KIND_LABELS: Record<ContactKind, string> = {
  individual: "Individual",
  organization: "Organization",
};

/** The one universal, non-configurable fact about every relationship,
 *  per the Reconsideration's explicit, evidence-tested rejection of a
 *  fourth "Partner" direction — every real-world partnership decomposes
 *  into one or more of these three, held concurrently, or is a Type-level
 *  status label riding on top of one of them. */
export const DIRECTIONS = ["receiving", "supporting", "supplying"] as const;
export type Direction = (typeof DIRECTIONS)[number];
export const DIRECTION_LABELS: Record<Direction, string> = {
  receiving: "Receiving",
  supporting: "Supporting",
  supplying: "Supplying",
};
export const DIRECTION_DESCRIPTIONS: Record<Direction, string> = {
  receiving: "The institution provides something to this contact — care, education, goods, service.",
  supporting: "This contact gives something to the institution — money, time, standing — without a service owed back.",
  supplying: "This contact provides something the institution consumes to operate — goods, services, contracted work.",
};

export const RELATIONSHIP_STATUSES = ["active", "inactive", "ended"] as const;
export type RelationshipStatus = (typeof RELATIONSHIP_STATUSES)[number];
export const RELATIONSHIP_STATUS_LABELS: Record<RelationshipStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  ended: "Ended",
};

/** A Direction + an institution-configured Type — free text, deliberately,
 *  the same reasoning Finance's Expense.category already uses: no fixed
 *  list was ever named for what an institution calls its relationships,
 *  and a hardcoded enum here would be exactly the "company accounting
 *  assumption" the Domain Review warned against generalized to every
 *  institution type. A single Contact may hold several of these
 *  concurrently. */
export type Relationship = {
  id: string;
  contactId: string;
  direction: Direction;
  type: string;
  status: RelationshipStatus;
  startedAt: string;
  endedAt: string | null;
  /** Updated on creation and on any edit that genuinely touches this
   *  relationship — the honest, non-artificial basis for the "gone
   *  quiet" Attention nudge; never a manufactured health score, per the
   *  Reconsideration's explicit rejection of one. */
  lastActivityAt: string;
};

/** A lightweight, embedded point of contact at an Organization — never a
 *  separate linked record for this pass, per the Reconsideration's own
 *  "What remains open" note: the substance of the relationship belongs to
 *  the Organization, not to whichever person currently answers the phone. */
export type PointOfContact = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
};

export type Address = {
  id: string;
  label: string | null;
  line: string;
};

/** A placeholder reference to a future institutional document — the exact
 *  pattern the Finance & Assets build already proved for Expense and
 *  Asset, reused here unchanged, not reinvented. */
export type DocumentRef = { id: string; label: string; addedAt: string };

export type Contact = {
  id: string;
  institutionId: string;
  kind: ContactKind;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  addresses: Address[];
  notes: string | null;
  /** Only meaningful for Organization contacts; always empty for
   *  Individual ones. */
  pointsOfContact: PointOfContact[];
  relationships: Relationship[];
  documentRefs: DocumentRef[];
  status: "active" | "archived";
  createdByPersonId: string;
  createdAt: string;
  archivedAt: string | null;
  /** The Project this belongs to, if any — M9's convergence point.
   *  Nullable since most Contacts predate Projects and plenty of real
   *  relationships never belong to one. */
  projectId: string | null;
};
