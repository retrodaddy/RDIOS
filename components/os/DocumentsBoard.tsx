"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addDocumentRelationshipAction,
  addDocumentVersionAction,
  archiveDocumentAction,
  createDocumentAction,
  decideDocumentApprovalAction,
  getDocumentHistoryAction,
  removeDocumentRelationshipAction,
  restoreDocumentAction,
  restoreDocumentVersionAction,
  setDocumentOwnerAction,
  submitDocumentForApprovalAction,
  updateDocumentDetailsAction,
} from "@/applications/documents/actions";
import {
  ATTACHMENT_KINDS,
  ATTACHMENT_KIND_LABELS,
  DOCUMENT_RELATIONSHIP_TYPES,
  DOCUMENT_RELATIONSHIP_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPE_SUGGESTIONS,
  type AttachmentKind,
  type Document,
  type DocumentRelationshipType,
  type DocumentStatus,
} from "@/applications/documents/types";
import type { HistoryEntry } from "@/os/attention/types";
import { Badge, Button, DataTable, EmptyState, useToast, type BadgeTone, type DataTableColumn } from "@/components/ui";

export type DocumentsRosterPerson = { id: string; name: string };
export type RelationshipCandidate = { id: string; label: string };

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  draft: "neutral",
  active: "success",
  archived: "neutral",
};

const APPROVAL_TONE: Record<string, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

/** Documents' board (M10) — the exact shape every prior board already
 *  established: one list, one create drawer, one detail drawer. The two
 *  additions this domain needed beyond Projects' own shape are Versions
 *  (append-only, "Restore" never rewrites) and Relationships (a generic
 *  type+item picker, since a Document can reference six different kinds
 *  of record, unlike Projects' four fixed categories). */
export function DocumentsBoard({
  canManage,
  initialDocuments,
  roster,
  relationshipCandidates,
  initialSelectedId,
}: {
  canManage: boolean;
  initialDocuments: Document[];
  roster: DocumentsRosterPerson[];
  relationshipCandidates: Record<DocumentRelationshipType, RelationshipCandidate[]>;
  /** Universal Search's own deep-link (M12) — opens straight to this
   *  Document's existing drawer, never a duplicate screen. */
  initialSelectedId?: string | null;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);

  // Universal Search (M12) — see WorkBoard's identical effect for why
  // this is needed beyond the useState initializer.
  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);
  const refresh = () => router.refresh();

  const active = initialDocuments.filter((d) => d.status !== "archived");
  const selected = initialDocuments.find((d) => d.id === selectedId) ?? null;

  const personName = (id: string | null) => (id ? roster.find((p) => p.id === id)?.name ?? "Someone" : null);

  const columns: DataTableColumn<Document>[] = [
    { key: "title", header: "Title", sortable: true, sortValue: (r) => r.title, render: (r) => r.title },
    { key: "type", header: "Type", render: (r) => <Badge tone="neutral">{r.type}</Badge> },
    { key: "status", header: "Status", render: (r) => <Badge tone={STATUS_TONE[r.status]}>{DOCUMENT_STATUS_LABELS[r.status]}</Badge> },
    {
      key: "approval",
      header: "Approval",
      render: (r) => (r.approvalStatus === "none" ? <span className="text-dim">—</span> : <Badge tone={APPROVAL_TONE[r.approvalStatus]}>{r.approvalStatus}</Badge>),
    },
    { key: "owner", header: "Owner", render: (r) => personName(r.ownerPersonId) ?? <span className="text-dim">Unassigned</span> },
    {
      key: "expiresAt",
      header: "Expires",
      render: (r) => (r.expiresAt ? new Date(r.expiresAt).toLocaleDateString() : <span className="text-dim">—</span>),
    },
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">
          {active.length} {active.length === 1 ? "document" : "documents"}
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCreating(true)}
          disabled={!canManage}
          title={canManage ? undefined : "Managing documents isn't your responsibility here."}
        >
          New document
        </Button>
      </div>

      <div className="mt-3">
        <DataTable
          columns={columns}
          rows={active}
          rowKey={(r) => r.id}
          onRowClick={(r) => setSelectedId(r.id)}
          emptyTitle="Nothing kept yet"
          emptyDescription="Policies, contracts, minutes, certificates — whatever this institution needs to be able to find again belongs here, whether or not there's a file attached yet."
        />
      </div>

      {creating && (
        <CreateDocumentDrawer roster={roster} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); refresh(); }} />
      )}

      {selected && (
        <DocumentDetailDrawer
          document={selected}
          canManage={canManage}
          roster={roster}
          relationshipCandidates={relationshipCandidates}
          onClose={() => setSelectedId(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}

/* -------------------------------- Create drawer -------------------------------- */

function AttachmentFields({
  filename,
  setFilename,
  kind,
  setKind,
}: {
  filename: string;
  setFilename: (v: string) => void;
  kind: AttachmentKind;
  setKind: (v: AttachmentKind) => void;
}) {
  return (
    <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
      <input
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
        placeholder="File name — optional, e.g. renewal-2026.pdf"
        className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
      />
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value as AttachmentKind)}
        className="rounded-xl border border-border bg-surface/40 px-2 py-2.5 text-sm text-text outline-none focus:border-accent"
      >
        {ATTACHMENT_KINDS.map((k) => (
          <option key={k} value={k}>
            {ATTACHMENT_KIND_LABELS[k]}
          </option>
        ))}
      </select>
    </div>
  );
}

function CreateDocumentDrawer({
  roster,
  onClose,
  onCreated,
}: {
  roster: DocumentsRosterPerson[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [ownerPersonId, setOwnerPersonId] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [attachmentFilename, setAttachmentFilename] = useState("");
  const [attachmentKind, setAttachmentKind] = useState<AttachmentKind>("pdf");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("type", type);
      fd.set("description", description);
      fd.set("ownerPersonId", ownerPersonId);
      fd.set("documentNumber", documentNumber);
      fd.set("expiresAt", expiresAt);
      fd.set("attachmentFilename", attachmentFilename);
      fd.set("attachmentKind", attachmentKind);
      const r = await createDocumentAction(fd);
      if (!r.ok) return setErr(r.error ?? "Could not add that document.");
      onCreated();
    });
  };

  const valid = title.trim() && type.trim();

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="New document">
      <div className="os-anim-backdrop absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="os-anim-sheet relative w-full max-w-md overflow-y-auto overflow-x-hidden rounded-t-2xl border border-border bg-elevated p-6 sm:max-h-[85vh] sm:rounded-2xl">
        <p className="font-display text-lg">New document</p>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          placeholder="Title — e.g. Vendor Agreement 2026"
          className="mt-4 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        />
        <input
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Type — e.g. Contract"
          list="document-type-suggestions"
          className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        />
        <datalist id="document-type-suggestions">
          {DOCUMENT_TYPE_SUGGESTIONS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description — optional"
          rows={2}
          className="mt-2 w-full resize-none rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        />

        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder="Document number — optional"
            className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
          />
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            title="Expires — optional"
            className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
          />
        </div>

        <label className="mt-2 block text-xs text-dim">Owner — optional</label>
        <select
          value={ownerPersonId}
          onChange={(e) => setOwnerPersonId(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        >
          <option value="">No owner yet</option>
          {roster.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <p className="mt-4 text-xs text-dim">First version — optional</p>
        <AttachmentFields filename={attachmentFilename} setFilename={setAttachmentFilename} kind={attachmentKind} setKind={setAttachmentKind} />

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

function DocumentDetailDrawer({
  document,
  canManage,
  roster,
  relationshipCandidates,
  onClose,
  onChanged,
}: {
  document: Document;
  canManage: boolean;
  roster: DocumentsRosterPerson[];
  relationshipCandidates: Record<DocumentRelationshipType, RelationshipCandidate[]>;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [addingVersion, setAddingVersion] = useState(false);
  const [versionFilename, setVersionFilename] = useState("");
  const [versionKind, setVersionKind] = useState<AttachmentKind>("pdf");
  const [versionNotes, setVersionNotes] = useState("");
  const [relType, setRelType] = useState<DocumentRelationshipType>("person");
  const [relId, setRelId] = useState("");
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const toast = useToast();

  useEffect(() => {
    getDocumentHistoryAction(document.id).then(setHistory);
  }, [document.id]);

  const personName = (id: string | null) => (id ? roster.find((p) => p.id === id)?.name ?? "Someone" : null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, successMessage?: string) => {
    setErr(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) return setErr(r.error ?? "Could not complete that.");
      if (successMessage) toast.notify("success", successMessage);
      onChanged();
      getDocumentHistoryAction(document.id).then(setHistory);
    });
  };

  const candidatesForType = relationshipCandidates[relType] ?? [];
  const alreadyLinkedIds = new Set(document.relationships.map((r) => r.relatedId));
  const availableCandidates = candidatesForType.filter((c) => !alreadyLinkedIds.has(c.id));

  return (
    <div className="fixed inset-0 z-[75] flex justify-end" role="dialog" aria-modal="true" aria-label={document.title}>
      <div className="os-anim-backdrop absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="os-anim-drawer-right relative flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-elevated p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="neutral">{document.type}</Badge>
              <Badge tone={STATUS_TONE[document.status]}>{DOCUMENT_STATUS_LABELS[document.status]}</Badge>
              {document.approvalStatus !== "none" && <Badge tone={APPROVAL_TONE[document.approvalStatus]}>{document.approvalStatus}</Badge>}
            </div>
            <h2 className="mt-1.5 font-display text-xl font-medium">{document.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 text-xs text-dim hover:text-text">
            Close
          </button>
        </div>

        {document.description && <p className="mt-2 text-sm text-muted">{document.description}</p>}

        <section className="mt-6 space-y-3 text-sm">
          <Row label="Owner" value={personName(document.ownerPersonId) ?? "Unassigned"} />
          <Row label="Document number" value={document.documentNumber ?? "—"} />
          <Row label="Created" value={new Date(document.createdAt).toLocaleDateString()} />
          <Row label="Modified" value={new Date(document.modifiedAt).toLocaleDateString()} />
          <Row label="Expires" value={document.expiresAt ? new Date(document.expiresAt).toLocaleDateString() : "—"} />
        </section>

        {canManage && (
          <section className="mt-6">
            <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Approval</h3>
            {document.approvalStatus === "none" && (
              <Button size="sm" className="mt-2" disabled={pending} onClick={() => run(() => submitDocumentForApprovalAction(document.id), "Submitted.")}>
                Submit for approval
              </Button>
            )}
            {document.approvalStatus === "pending" && (
              <div className="mt-2 flex items-center gap-2">
                <Button size="sm" disabled={pending} onClick={() => run(() => decideDocumentApprovalAction(document.id, "approved"), "Approved.")}>
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => run(() => decideDocumentApprovalAction(document.id, "rejected"), "Rejected.")}
                  className="text-dim hover:text-error"
                >
                  Reject
                </Button>
              </div>
            )}
            {(document.approvalStatus === "approved" || document.approvalStatus === "rejected") && (
              <p className="mt-1.5 text-sm text-muted">
                {document.approvalStatus === "approved" ? "Approved" : "Rejected"}
                {document.approvalDecidedAt ? ` on ${new Date(document.approvalDecidedAt).toLocaleDateString()}` : ""}.
              </p>
            )}

            <h3 className="mt-4 text-[0.65rem] uppercase tracking-[0.2em] text-dim">Owner</h3>
            <select
              defaultValue={document.ownerPersonId ?? ""}
              disabled={pending}
              onChange={(e) => run(() => setDocumentOwnerAction(document.id, e.target.value || null))}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
            >
              <option value="">Unassigned</option>
              {roster.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </section>
        )}

        {err && (
          <p className="mt-3 text-sm text-error" role="alert">
            {err}
          </p>
        )}

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Versions</h3>
            {canManage && (
              <button type="button" onClick={() => setAddingVersion((v) => !v)} className="text-xs text-accent-bright hover:underline">
                + Add
              </button>
            )}
          </div>
          <ul className="mt-1.5 space-y-1.5">
            {[...document.versions].reverse().map((v) => {
              const isCurrent = v.id === document.versions[document.versions.length - 1].id;
              return (
                <li key={v.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-text">
                        Version {v.versionNumber}
                        {isCurrent && (
                          <span className="ml-1.5 inline-block">
                            <Badge tone="accent">Current</Badge>
                          </span>
                        )}
                      </span>
                      {v.attachment && (
                        <p className="truncate text-xs text-dim">
                          {v.attachment.filename} — {ATTACHMENT_KIND_LABELS[v.attachment.kind]}
                        </p>
                      )}
                      {v.notes && <p className="text-xs text-dim">{v.notes}</p>}
                      {v.restoredFromVersionNumber !== null && (
                        <p className="text-xs text-dim">Restored from version {v.restoredFromVersionNumber}</p>
                      )}
                    </div>
                    {canManage && !isCurrent && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => restoreDocumentVersionAction(document.id, v.id), "Restored.")}
                        className="shrink-0 text-xs text-accent-bright hover:underline disabled:opacity-50"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {addingVersion && (
            <div className="mt-2 rounded-lg border border-border p-2.5">
              <AttachmentFields filename={versionFilename} setFilename={setVersionFilename} kind={versionKind} setKind={setVersionKind} />
              <input
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="Notes — optional"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
              />
              <Button
                size="sm"
                className="mt-1.5"
                disabled={pending || (!versionFilename.trim() && !versionNotes.trim())}
                onClick={() => {
                  const fd = new FormData();
                  fd.set("attachmentFilename", versionFilename);
                  fd.set("attachmentKind", versionKind);
                  fd.set("notes", versionNotes);
                  run(async () => {
                    const r = await addDocumentVersionAction(document.id, fd);
                    if (r.ok) {
                      setVersionFilename("");
                      setVersionNotes("");
                      setAddingVersion(false);
                    }
                    return r;
                  });
                }}
              >
                Add version
              </Button>
            </div>
          )}
        </section>

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Relationships</h3>
          {document.relationships.length === 0 ? (
            <p className="mt-1.5 text-sm text-muted">Not linked to anything yet.</p>
          ) : (
            <ul className="mt-1.5 space-y-1.5">
              {document.relationships.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge tone="info">{DOCUMENT_RELATIONSHIP_TYPE_LABELS[r.relatedType]}</Badge>
                    <span className="truncate text-text">{r.label}</span>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => removeDocumentRelationshipAction(document.id, r.id), "Unlinked.")}
                      className="shrink-0 text-xs text-dim hover:text-error disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {canManage && (
            <div className="mt-2 flex items-center gap-1.5">
              <select
                value={relType}
                onChange={(e) => {
                  setRelType(e.target.value as DocumentRelationshipType);
                  setRelId("");
                }}
                className="shrink-0 rounded-lg border border-border bg-surface/40 px-2 py-1.5 text-xs text-text outline-none focus:border-accent"
              >
                {DOCUMENT_RELATIONSHIP_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {DOCUMENT_RELATIONSHIP_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <select
                value={relId}
                onChange={(e) => setRelId(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface/40 px-2 py-1.5 text-xs text-text outline-none focus:border-accent"
              >
                <option value="">Choose…</option>
                {availableCandidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                disabled={pending || !relId}
                onClick={() => {
                  const candidate = availableCandidates.find((c) => c.id === relId);
                  if (!candidate) return;
                  run(async () => {
                    const r = await addDocumentRelationshipAction(document.id, relType, candidate.id, candidate.label);
                    if (r.ok) setRelId("");
                    return r;
                  });
                }}
                className="shrink-0"
              >
                Link
              </Button>
            </div>
          )}
        </section>

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Related records</h3>
          <p className="mt-1.5 text-sm text-muted">Policies and Search will be able to point here once they&apos;re ready to. Nothing more to connect yet.</p>
        </section>

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Timeline</h3>
          {history === null ? (
            <p className="mt-2 text-sm text-muted">Loading…</p>
          ) : history.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nothing recorded yet — this document&apos;s own history starts here.</p>
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
          <EditDocumentForm
            document={document}
            pending={pending}
            onCancel={() => setEditing(false)}
            onSave={(fd) =>
              run(async () => {
                const r = await updateDocumentDetailsAction(document.id, fd);
                if (r.ok) setEditing(false);
                return r;
              }, "Saved.")
            }
          />
        ) : (
          canManage && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
              {document.status === "archived" ? (
                <Button size="sm" disabled={pending} onClick={() => run(() => restoreDocumentAction(document.id), "Restored.")} className="ml-auto">
                  Restore
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => run(() => archiveDocumentAction(document.id), "Archived.")}
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

function EditDocumentForm({
  document,
  pending,
  onCancel,
  onSave,
}: {
  document: Document;
  pending: boolean;
  onCancel: () => void;
  onSave: (fd: FormData) => void;
}) {
  const [title, setTitle] = useState(document.title);
  const [type, setType] = useState(document.type);
  const [description, setDescription] = useState(document.description ?? "");
  const [documentNumber, setDocumentNumber] = useState(document.documentNumber ?? "");
  const [expiresAt, setExpiresAt] = useState(document.expiresAt ?? "");

  const submit = () => {
    const fd = new FormData();
    fd.set("title", title);
    fd.set("type", type);
    fd.set("description", description);
    fd.set("documentNumber", documentNumber);
    fd.set("expiresAt", expiresAt);
    onSave(fd);
  };

  return (
    <section className="mt-6 border-t border-border pt-4">
      <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Edit</h3>
      <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
      <input
        value={type}
        onChange={(e) => setType(e.target.value)}
        list="document-type-suggestions-edit"
        className="mt-1.5 w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
      />
      <datalist id="document-type-suggestions-edit">
        {DOCUMENT_TYPE_SUGGESTIONS.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Description" className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
        <input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="Document number" className="w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
        <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" disabled={pending || !title.trim() || !type.trim()} onClick={submit}>
          Save
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
