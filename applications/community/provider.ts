import "server-only";
import type { Address, Contact, ContactKind, Direction, DocumentRef, PointOfContact, Relationship, RelationshipStatus } from "./types";

/** The swappable contract Community is built behind — the same discipline
 *  as every prior application's provider. Backed today by an in-memory
 *  mock; a real provider implements this exact interface later. */
export interface CommunityProvider {
  listContacts(institutionId: string): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | null>;

  /** Creates a Contact together with its first Relationship in one step —
   *  a Contact with zero relationships is a real but unusual state, so the
   *  ordinary path bundles both, the same way Finance's createExpense
   *  captures the whole transaction in one call rather than a two-step
   *  draft-then-classify flow. */
  createContact(input: {
    institutionId: string;
    kind: ContactKind;
    name: string;
    description: string | null;
    email: string | null;
    phone: string | null;
    addresses: Omit<Address, "id">[];
    notes: string | null;
    pointsOfContact: Omit<PointOfContact, "id">[];
    direction: Direction;
    type: string;
    createdByPersonId: string;
    projectId: string | null;
  }): Promise<Contact>;

  updateContact(
    id: string,
    patch: {
      name?: string;
      description?: string | null;
      email?: string | null;
      phone?: string | null;
      addresses?: Omit<Address, "id">[];
      notes?: string | null;
      pointsOfContact?: Omit<PointOfContact, "id">[];
    }
  ): Promise<Contact | null>;

  archiveContact(id: string): Promise<Contact | null>;

  addRelationship(contactId: string, direction: Direction, type: string): Promise<Relationship | null>;
  endRelationship(relationshipId: string): Promise<Relationship | null>;
  setRelationshipStatus(relationshipId: string, status: RelationshipStatus): Promise<Relationship | null>;

  addDocumentRef(contactId: string, label: string): Promise<DocumentRef | null>;
  setContactProject(contactId: string, projectId: string | null): Promise<Contact | null>;
}
