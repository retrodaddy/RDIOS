"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addDocumentRefAction,
  addRelationshipAction,
  archiveContactAction,
  createContactAction,
  endRelationshipAction,
  getContactHistoryAction,
  updateContactAction,
} from "@/applications/community/actions";
import {
  CONTACT_KIND_LABELS,
  DIRECTIONS,
  DIRECTION_LABELS,
  type Address,
  type Contact,
  type ContactKind,
  type Direction,
  type PointOfContact,
  type Relationship,
} from "@/applications/community/types";
import type { HistoryEntry } from "@/os/attention/types";
import { Badge, Button, DataTable, EmptyState, useToast, type BadgeTone, type DataTableColumn } from "@/components/ui";

const DIRECTION_TONE: Record<Direction, BadgeTone> = {
  receiving: "accent",
  supporting: "success",
  supplying: "info",
};

const SUGGESTED_TYPES: Record<Direction, string[]> = {
  receiving: ["Customer", "Patient", "Student", "Devotee", "Beneficiary", "Congregation Member"],
  supporting: ["Donor", "Volunteer"],
  supplying: ["Vendor", "Supplier", "Contractor"],
};

function primaryRelationship(contact: Contact): Relationship | null {
  return contact.relationships.find((r) => r.status === "active") ?? contact.relationships[0] ?? null;
}

/** Community's board (M8) — one list, one create drawer, one detail
 *  drawer, the exact shape WorkBoard and MoneyBoard already use. Contact
 *  is the one entity here (Relationships live embedded on it), so unlike
 *  Money's tabbed Accounts/Transactions/Assets, Community stays a single
 *  list — no tabs invented where the domain doesn't need them. */
export function CommunityBoard({
  canManage,
  initialContacts,
}: {
  canManage: boolean;
  initialContacts: Contact[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const refresh = () => router.refresh();

  const active = initialContacts.filter((c) => c.status === "active");
  const selected = initialContacts.find((c) => c.id === selectedId) ?? null;

  const columns: DataTableColumn<Contact>[] = [
    { key: "name", header: "Name", sortable: true, sortValue: (r) => r.name, render: (r) => r.name },
    { key: "kind", header: "Kind", render: (r) => <Badge tone="neutral">{CONTACT_KIND_LABELS[r.kind]}</Badge> },
    {
      key: "relationship",
      header: "Relationship",
      render: (r) => {
        const rel = primaryRelationship(r);
        if (!rel) return <span className="text-dim">None</span>;
        return (
          <div className="flex items-center gap-2">
            <Badge tone={DIRECTION_TONE[rel.direction]}>{rel.type}</Badge>
            {r.relationships.filter((x) => x.status === "active").length > 1 && (
              <span className="text-xs text-dim">+{r.relationships.filter((x) => x.status === "active").length - 1} more</span>
            )}
          </div>
        );
      },
    },
    { key: "contact", header: "Reach", render: (r) => r.email ?? r.phone ?? <span className="text-dim">—</span> },
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">
          {active.length} {active.length === 1 ? "contact" : "contacts"}
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCreating(true)}
          disabled={!canManage}
          title={canManage ? undefined : "Managing community relationships isn't your responsibility here."}
        >
          New contact
        </Button>
      </div>

      <div className="mt-3">
        <DataTable
          columns={columns}
          rows={active}
          rowKey={(r) => r.id}
          onRowClick={(r) => setSelectedId(r.id)}
          emptyTitle="Nothing recorded yet"
          emptyDescription="Everyone this institution serves, is supported by, or is supplied by belongs here — one shared list, whatever it's called on the screens around it."
        />
      </div>

      {creating && <CreateContactDrawer onClose={() => setCreating(false)} onCreated={() => { setCreating(false); refresh(); }} />}

      {selected && (
        <ContactDetailDrawer contact={selected} canManage={canManage} onClose={() => setSelectedId(null)} onChanged={refresh} />
      )}
    </div>
  );
}

/* --------------------------------- Shared bits --------------------------------- */

function AddressRows({ addresses, setAddresses }: { addresses: Omit<Address, "id">[]; setAddresses: (a: Omit<Address, "id">[]) => void }) {
  return (
    <div className="mt-2">
      <label className="text-xs text-dim">Addresses — optional</label>
      {addresses.map((a, i) => (
        <div key={i} className="mt-1.5 flex items-center gap-2">
          <input
            value={a.label ?? ""}
            onChange={(e) => setAddresses(addresses.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
            placeholder="Label — e.g. Office"
            className="w-28 shrink-0 rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
          />
          <input
            value={a.line}
            onChange={(e) => setAddresses(addresses.map((x, j) => (j === i ? { ...x, line: e.target.value } : x)))}
            placeholder="Address"
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
          />
          <button type="button" onClick={() => setAddresses(addresses.filter((_, j) => j !== i))} className="shrink-0 text-xs text-dim hover:text-error">
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setAddresses([...addresses, { label: null, line: "" }])}
        className="mt-1.5 text-xs text-accent-bright hover:underline"
      >
        + Add address
      </button>
    </div>
  );
}

function PointsOfContactRows({
  points,
  setPoints,
}: {
  points: Omit<PointOfContact, "id">[];
  setPoints: (p: Omit<PointOfContact, "id">[]) => void;
}) {
  return (
    <div className="mt-2">
      <label className="text-xs text-dim">Points of contact — optional</label>
      {points.map((p, i) => (
        <div key={i} className="mt-1.5 space-y-1.5 rounded-lg border border-border p-2.5">
          <div className="flex items-center gap-2">
            <input
              value={p.name}
              onChange={(e) => setPoints(points.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              placeholder="Name"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
            />
            <input
              value={p.role ?? ""}
              onChange={(e) => setPoints(points.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))}
              placeholder="Role — optional"
              className="w-32 shrink-0 rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
            />
            <button type="button" onClick={() => setPoints(points.filter((_, j) => j !== i))} className="shrink-0 text-xs text-dim hover:text-error">
              Remove
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={p.email ?? ""}
              onChange={(e) => setPoints(points.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))}
              placeholder="Email — optional"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
            />
            <input
              value={p.phone ?? ""}
              onChange={(e) => setPoints(points.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))}
              placeholder="Phone — optional"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setPoints([...points, { name: "", role: null, email: null, phone: null }])}
        className="mt-1.5 text-xs text-accent-bright hover:underline"
      >
        + Add a point of contact
      </button>
    </div>
  );
}

/* -------------------------------- Create drawer -------------------------------- */

function CreateContactDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [kind, setKind] = useState<ContactKind>("individual");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [addresses, setAddresses] = useState<Omit<Address, "id">[]>([]);
  const [points, setPoints] = useState<Omit<PointOfContact, "id">[]>([]);
  const [direction, setDirection] = useState<Direction>("receiving");
  const [type, setType] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("kind", kind);
      fd.set("name", name);
      fd.set("description", description);
      fd.set("email", email);
      fd.set("phone", phone);
      fd.set("notes", notes);
      fd.set("addresses", JSON.stringify(addresses));
      fd.set("pointsOfContact", JSON.stringify(points));
      fd.set("direction", direction);
      fd.set("type", type);
      const r = await createContactAction(fd);
      if (!r.ok) return setErr(r.error ?? "Could not add that contact.");
      onCreated();
    });
  };

  const valid = name.trim() && type.trim();

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="New contact">
      <div className="os-anim-backdrop absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="os-anim-sheet relative w-full max-w-md overflow-y-auto overflow-x-hidden rounded-t-2xl border border-border bg-elevated p-6 sm:max-h-[85vh] sm:rounded-2xl">
        <p className="font-display text-lg">New contact</p>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setKind("individual")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${kind === "individual" ? "bg-accent text-on-accent" : "border border-border text-dim"}`}
          >
            Individual
          </button>
          <button
            type="button"
            onClick={() => setKind("organization")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${kind === "organization" ? "bg-accent text-on-accent" : "border border-border text-dim"}`}
          >
            Organization
          </button>
        </div>

        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder={kind === "organization" ? "Organization name" : "Full name"} className="mt-4 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description — optional" rows={2} className="mt-2 w-full resize-none rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />

        <div className="mt-2 grid grid-cols-2 gap-2">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email — optional" className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone — optional" className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
        </div>

        <AddressRows addresses={addresses} setAddresses={setAddresses} />
        {kind === "organization" && <PointsOfContactRows points={points} setPoints={setPoints} />}

        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes — optional" rows={2} className="mt-2 w-full resize-none rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />

        <p className="mt-4 text-xs text-dim">Relationship</p>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {DIRECTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={`rounded-lg px-2 py-1.5 text-xs font-medium ${direction === d ? "bg-accent text-on-accent" : "border border-border text-dim"}`}
            >
              {DIRECTION_LABELS[d]}
            </button>
          ))}
        </div>
        <input
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Type — e.g. Customer, Donor, Vendor"
          list="community-type-suggestions"
          className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        />
        <datalist id="community-type-suggestions">
          {SUGGESTED_TYPES[direction].map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>

        {err && <p className="mt-2 text-sm text-error" role="alert">{err}</p>}

        <div className="mt-4 flex items-center gap-2">
          <Button onClick={submit} disabled={pending || !valid}>
            {pending ? "Adding…" : "Add"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Detail drawer -------------------------------- */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-dim">{label}</span>
      <span className="text-right text-text">{value}</span>
    </div>
  );
}

function ContactDetailDrawer({
  contact,
  canManage,
  onClose,
  onChanged,
}: {
  contact: Contact;
  canManage: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [addingRelationship, setAddingRelationship] = useState(false);
  const [newDirection, setNewDirection] = useState<Direction>("receiving");
  const [newType, setNewType] = useState("");
  const [docLabel, setDocLabel] = useState("");
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const toast = useToast();

  useEffect(() => {
    getContactHistoryAction(contact.id).then(setHistory);
  }, [contact.id]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, successMessage?: string) => {
    setErr(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) return setErr(r.error ?? "Could not complete that.");
      if (successMessage) toast.notify("success", successMessage);
      onChanged();
      getContactHistoryAction(contact.id).then(setHistory);
    });
  };

  return (
    <div className="fixed inset-0 z-[75] flex justify-end" role="dialog" aria-modal="true" aria-label={contact.name}>
      <div className="os-anim-backdrop absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="os-anim-drawer-right relative flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-elevated p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">{CONTACT_KIND_LABELS[contact.kind]}</p>
            <h2 className="mt-1 font-display text-xl font-medium">{contact.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 text-xs text-dim hover:text-text">
            Close
          </button>
        </div>

        {contact.description && <p className="mt-2 text-sm text-muted">{contact.description}</p>}

        <section className="mt-6 space-y-3 text-sm">
          <Row label="Email" value={contact.email ?? "—"} />
          <Row label="Phone" value={contact.phone ?? "—"} />
        </section>

        {contact.addresses.length > 0 && (
          <section className="mt-4">
            <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Addresses</h3>
            <ul className="mt-1.5 space-y-1 text-sm text-text">
              {contact.addresses.map((a) => (
                <li key={a.id}>{a.label ? `${a.label}: ` : ""}{a.line}</li>
              ))}
            </ul>
          </section>
        )}

        {contact.kind === "organization" && contact.pointsOfContact.length > 0 && (
          <section className="mt-4">
            <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Points of contact</h3>
            <ul className="mt-1.5 space-y-1.5">
              {contact.pointsOfContact.map((p) => (
                <li key={p.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <p className="text-text">{p.name}{p.role ? ` — ${p.role}` : ""}</p>
                  {(p.email || p.phone) && <p className="text-xs text-dim">{[p.email, p.phone].filter(Boolean).join(" · ")}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {contact.notes && (
          <section className="mt-4">
            <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Notes</h3>
            <p className="mt-1.5 text-sm text-text">{contact.notes}</p>
          </section>
        )}

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Relationships</h3>
            {canManage && (
              <button type="button" onClick={() => setAddingRelationship((v) => !v)} className="text-xs text-accent-bright hover:underline">
                + Add
              </button>
            )}
          </div>
          <ul className="mt-1.5 space-y-1.5">
            {contact.relationships.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone={DIRECTION_TONE[r.direction]}>{DIRECTION_LABELS[r.direction]}</Badge>
                    <span className="truncate text-text">{r.type}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-dim">
                    {r.status === "ended" ? "Ended" : r.status === "inactive" ? "Inactive" : "Active"}
                  </p>
                </div>
                {canManage && r.status === "active" && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => endRelationshipAction(contact.id, r.id), "Relationship ended.")}
                    className="shrink-0 text-xs text-dim hover:text-error disabled:opacity-50"
                  >
                    End
                  </button>
                )}
              </li>
            ))}
          </ul>

          {addingRelationship && (
            <div className="mt-2 rounded-lg border border-border p-2.5">
              <div className="grid grid-cols-3 gap-1.5">
                {DIRECTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setNewDirection(d)}
                    className={`rounded-lg px-2 py-1.5 text-xs font-medium ${newDirection === d ? "bg-accent text-on-accent" : "border border-border text-dim"}`}
                  >
                    {DIRECTION_LABELS[d]}
                  </button>
                ))}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="Type — e.g. Volunteer"
                  className="min-w-0 flex-1 rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
                />
                <Button
                  size="sm"
                  disabled={pending || !newType.trim()}
                  onClick={() =>
                    run(async () => {
                      const r = await addRelationshipAction(contact.id, newDirection, newType);
                      if (r.ok) {
                        setNewType("");
                        setAddingRelationship(false);
                      }
                      return r;
                    })
                  }
                  className="shrink-0"
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </section>

        {err && (
          <p className="mt-3 text-sm text-error" role="alert">
            {err}
          </p>
        )}

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Documents</h3>
          {contact.documentRefs.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No documents referenced yet.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {contact.documentRefs.map((d) => (
                <li key={d.id} className="rounded-lg border border-border px-3 py-2 text-sm text-text">
                  {d.label}
                </li>
              ))}
            </ul>
          )}
          {canManage && (
            <div className="mt-2 flex items-center gap-2">
              <input
                value={docLabel}
                onChange={(e) => setDocLabel(e.target.value)}
                placeholder="Reference a document — e.g. Signed agreement"
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm text-text outline-none focus:border-accent"
              />
              <Button
                size="sm"
                disabled={pending || !docLabel.trim()}
                onClick={() => run(() => addDocumentRefAction(contact.id, docLabel).then((r) => { if (r.ok) setDocLabel(""); return r; }))}
                className="shrink-0"
              >
                Add
              </Button>
            </div>
          )}
        </section>

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Related records</h3>
          <p className="mt-1.5 text-sm text-muted">
            Finance, Work, and Projects will be able to point here once they&apos;re ready to. Nothing to connect yet.
          </p>
        </section>

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Timeline</h3>
          {history === null ? (
            <p className="mt-2 text-sm text-muted">Loading…</p>
          ) : history.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nothing recorded yet — this contact&apos;s own history starts here.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {history.map((h) => (
                <li key={h.id} className="text-sm">
                  <p className="text-text">{h.summary}</p>
                  <p className="text-xs text-dim">{new Date(h.occurredAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {editing ? (
          <EditContactForm
            contact={contact}
            pending={pending}
            onCancel={() => setEditing(false)}
            onSave={(fd) => run(async () => {
              const r = await updateContactAction(contact.id, fd);
              if (r.ok) setEditing(false);
              return r;
            }, "Saved.")}
          />
        ) : (
          canManage && (
            <div className="mt-6 flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
              {contact.status !== "archived" && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => run(() => archiveContactAction(contact.id), "Archived.")}
                  className="ml-auto text-dim hover:text-error"
                >
                  Archive
                </Button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function EditContactForm({
  contact,
  pending,
  onCancel,
  onSave,
}: {
  contact: Contact;
  pending: boolean;
  onCancel: () => void;
  onSave: (fd: FormData) => void;
}) {
  const [name, setName] = useState(contact.name);
  const [description, setDescription] = useState(contact.description ?? "");
  const [email, setEmail] = useState(contact.email ?? "");
  const [phone, setPhone] = useState(contact.phone ?? "");
  const [notes, setNotes] = useState(contact.notes ?? "");
  const [addresses, setAddresses] = useState<Omit<Address, "id">[]>(contact.addresses.map((a) => ({ label: a.label, line: a.line })));
  const [points, setPoints] = useState<Omit<PointOfContact, "id">[]>(
    contact.pointsOfContact.map((p) => ({ name: p.name, role: p.role, email: p.email, phone: p.phone }))
  );

  const submit = () => {
    const fd = new FormData();
    fd.set("name", name);
    fd.set("description", description);
    fd.set("email", email);
    fd.set("phone", phone);
    fd.set("notes", notes);
    fd.set("addresses", JSON.stringify(addresses));
    fd.set("pointsOfContact", JSON.stringify(points));
    onSave(fd);
  };

  return (
    <section className="mt-6 border-t border-border pt-4">
      <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Edit</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Description" className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
      </div>
      <AddressRows addresses={addresses} setAddresses={setAddresses} />
      {contact.kind === "organization" && <PointsOfContactRows points={points} setPoints={setPoints} />}
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes" className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" disabled={pending || !name.trim()} onClick={submit}>
          Save
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
