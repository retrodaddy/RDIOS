import "server-only";
import type { Institution, InstitutionMembership, InstitutionType, Person } from "./types";

/**
 * The swappable contract Identity & Tenant is built behind. Everything in
 * RDIOS talks to this interface, never to a concrete implementation —
 * exactly the same discipline the frozen Product Foundation requires of
 * every application's Attention Contract. Today it's backed by
 * `MockIdentityProvider` (in-memory, dev-only, per the founder's explicit
 * instruction not to provision Supabase yet). When RDIOS's own project is
 * created, a `SupabaseIdentityProvider` implements this exact interface
 * and nothing above this line changes.
 */
export interface IdentityProvider {
  getPersonBySessionToken(token: string): Promise<Person | null>;
  getPerson(personId: string): Promise<Person | null>;
  listMembershipsForPerson(personId: string): Promise<InstitutionMembership[]>;
  listMembershipsForInstitution(institutionId: string): Promise<InstitutionMembership[]>;
  getInstitution(institutionId: string): Promise<Institution | null>;
  getMembership(personId: string, institutionId: string): Promise<InstitutionMembership | null>;

  /** Institution Lifecycle, Day 0 — creates the institution, the founder's
   *  Person, their first Membership, and a session in one step. `purpose`
   *  is optional per Institution Setup Experience v2 — never required,
   *  never a gate on anything else in this step. */
  createInstitution(input: {
    institutionName: string;
    institutionType: InstitutionType;
    purpose?: string;
    founderName: string;
    founderEmail: string;
  }): Promise<{ institution: Institution; person: Person; membership: InstitutionMembership; token: string }>;

  /** Invite — creates (or reuses) a Person by email and an "invited"
   *  Membership, expiring after a fixed window if never accepted. Does not
   *  create a session; the invitee accepts separately. */
  inviteMembership(institutionId: string, email: string, name: string): Promise<InstitutionMembership>;

  /** Accept an invitation — moves the Membership to "active" and returns a
   *  session token, mirroring the moment a real OAuth callback would.
   *  Fails closed if the invitation was already accepted, cancelled, or
   *  has expired (Implementation Sprint 1, Identity & Access). */
  acceptInvitation(
    membershipId: string
  ): Promise<{ person: Person; membership: InstitutionMembership; token: string } | { error: string }>;

  /** Cancel a still-pending invitation — the membership becomes invalid
   *  immediately; the link stops working even if the invitee has it open. */
  cancelInvitation(membershipId: string): Promise<{ ok: true } | { error: string }>;

  /** Ends a person's membership in this specific institution outright —
   *  the access-revoking half of offboarding. Distinct from ending a
   *  Position or Affiliation (applications/people): this is what makes
   *  signing in to this institution impossible again, not just empty of
   *  responsibility. Idempotent. */
  endMembership(institutionId: string, personId: string): Promise<void>;

  /** Dev-mode login only — in the mock provider, "logging in" as an
   *  existing person by email. A real provider replaces this with real
   *  authentication; nothing above this interface needs to know how. */
  createSessionForEmail(email: string): Promise<{ token: string } | { error: string }>;
}
