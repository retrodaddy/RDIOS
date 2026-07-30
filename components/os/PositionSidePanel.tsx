"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  appointHolderAction,
  endHolderAction,
  updatePositionDetailsAction,
  updatePositionParentsAction,
  updatePositionResponsibilitiesAction,
} from "@/applications/people/actions";
import { APPOINTMENT_TYPES, APPOINTMENT_TYPE_LABELS } from "@/applications/people/types";
import type { AppointmentType, Position, PositionHolder } from "@/applications/people/types";
import { PERMISSIONS, PERMISSION_LABELS, PERMISSION_DESCRIPTIONS, type PermissionKey } from "@/engines/authority/types";
import { getPermissionLabel, getPermissionDescription } from "@/os/institution/terminology";
import type { InstitutionType } from "@/os/identity/types";
import { Button } from "@/components/ui";

export type RosterPerson = { id: string; name: string; email: string; status: "active" | "invited" };

/** The Organization Builder's node detail — "full Position detail (name,
 *  holder, reports-to, description, vacant/filled, quick actions)" per
 *  the frozen Product Foundation. Slides in over the canvas, which stays
 *  visible and interactive behind it, per the same document's flagship
 *  description. Every control here stays visible to everyone — per the
 *  founder's own M5 instruction, the goal is not to hide pages, it's to
 *  make each person's real responsibility legible. Controls a person
 *  can't use are disabled with a plain-language reason, never removed. */
export function PositionSidePanel({
  position,
  allPositions,
  holders,
  roster,
  canManage,
  isFounder,
  institutionType,
  onClose,
}: {
  position: Position;
  allPositions: Position[];
  holders: PositionHolder[];
  roster: RosterPerson[];
  canManage: boolean;
  isFounder: boolean;
  institutionType: InstitutionType;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState(position.name);
  const [description, setDescription] = useState(position.description ?? "");
  const [appointing, setAppointing] = useState(false);
  const [personId, setPersonId] = useState("");
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("permanent");
  const [savedField, setSavedField] = useState<"name" | "description" | null>(null);

  const flashSaved = (field: "name" | "description") => {
    setSavedField(field);
    setTimeout(() => setSavedField((f) => (f === field ? null : f)), 1600);
  };

  const holder = holders.find((h) => !h.endedAt) ?? null;
  const holderPerson = holder ? roster.find((p) => p.id === holder.personId) : null;
  const parents = allPositions.filter((p) => position.reportsToPositionIds.includes(p.id));
  const children = allPositions.filter((p) => p.reportsToPositionIds.includes(position.id));

  const saveName = () => {
    if (!canManage || name.trim() === position.name) return;
    start(async () => {
      await updatePositionDetailsAction(position.id, { name: name.trim() });
      flashSaved("name");
      router.refresh();
    });
  };

  const saveDescription = () => {
    if (!canManage || (description.trim() || null) === position.description) return;
    start(async () => {
      await updatePositionDetailsAction(position.id, { description: description.trim() || null });
      flashSaved("description");
      router.refresh();
    });
  };

  const appoint = () => {
    if (!personId) return;
    start(async () => {
      const fd = new FormData();
      fd.set("positionId", position.id);
      fd.set("personId", personId);
      fd.set("appointmentType", appointmentType);
      await appointHolderAction(fd);
      setAppointing(false);
      setPersonId("");
      router.refresh();
    });
  };

  const end = (holderId: string) => {
    start(async () => {
      const fd = new FormData();
      fd.set("holderId", holderId);
      await endHolderAction(fd);
      router.refresh();
    });
  };

  const removeParent = (parentId: string) => {
    start(async () => {
      await updatePositionParentsAction(position.id, position.reportsToPositionIds.filter((id) => id !== parentId));
      router.refresh();
    });
  };

  const toggleResponsibility = (key: PermissionKey) => {
    const next = position.responsibilities.includes(key)
      ? position.responsibilities.filter((r) => r !== key)
      : [...position.responsibilities, key];
    start(async () => {
      await updatePositionResponsibilitiesAction(position.id, next);
      router.refresh();
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end" role="dialog" aria-modal="true" aria-label={position.name}>
      <div className="os-anim-backdrop absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="os-anim-drawer-right relative flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-elevated p-6">
        <div className="flex items-start justify-between gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            disabled={!canManage}
            className="w-full bg-transparent font-display text-xl font-medium text-text outline-none focus:underline disabled:opacity-90"
          />
          <button type="button" onClick={onClose} className="shrink-0 text-xs text-dim hover:text-text">
            Close
          </button>
        </div>

        <div className="mt-1 flex items-center gap-1.5 text-xs">
          <span className={`h-1.5 w-1.5 rounded-full ${holder ? "bg-accent" : "bg-dim"}`} />
          <span className={holder ? "text-dim" : "text-accent-bright"}>{holder ? "Filled" : "Vacant"}</span>
          {savedField === "name" && <span className="text-dim">· Saved</span>}
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={saveDescription}
          disabled={!canManage}
          placeholder="What this position is responsible for — optional."
          rows={2}
          className="mt-4 w-full resize-none rounded-xl border border-border bg-surface/40 px-3 py-2 text-sm text-text outline-none focus:border-accent disabled:opacity-70"
        />
        {savedField === "description" && <p className="mt-1 text-xs text-dim">Saved</p>}

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Holder</h3>
          {holder ? (
            <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-text">{holderPerson?.name ?? "Someone"}</p>
                <p className="text-xs text-dim">{APPOINTMENT_TYPE_LABELS[holder.appointmentType]}</p>
              </div>
              <button
                type="button"
                onClick={() => end(holder.id)}
                disabled={pending || !canManage}
                title={canManage ? undefined : "Ending an appointment isn't your responsibility here."}
                className="shrink-0 text-xs text-dim hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
              >
                End
              </button>
            </div>
          ) : appointing ? (
            <div className="mt-2 space-y-2 rounded-xl border border-border p-3">
              <select
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
              >
                <option value="">Choose someone…</option>
                {roster.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.status === "invited" ? " (invited)" : ""}
                  </option>
                ))}
              </select>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
                className="w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
              >
                {APPOINTMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {APPOINTMENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={appoint} disabled={pending || !personId}>
                  Appoint
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setAppointing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => (canManage ? setAppointing(true) : undefined)}
              disabled={!canManage}
              title={canManage ? undefined : "Appointing people isn't your responsibility here."}
              className="mt-2 w-full rounded-xl border border-border px-3 py-2.5 text-left text-sm text-dim transition-colors hover:bg-surface hover:text-text disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-dim"
            >
              Unfilled — appoint someone
            </button>
          )}
        </section>

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Reports to</h3>
          {parents.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Top-level — drag from the handle on this node to connect it.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {parents.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
                  <span className="truncate text-text">{p.name}</span>
                  <button
                    type="button"
                    onClick={() => removeParent(p.id)}
                    disabled={pending || !canManage}
                    title={canManage ? undefined : "Managing positions isn't your responsibility here."}
                    className="shrink-0 text-xs text-dim hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {children.length > 0 && (
          <section className="mt-6">
            <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Direct reports</h3>
            <ul className="mt-2 space-y-1.5">
              {children.map((c) => (
                <li key={c.id} className="truncate rounded-lg border border-border px-3 py-1.5 text-sm text-text">
                  {c.name}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Responsible for</h3>
          <p className="mt-1 text-xs text-dim">
            {isFounder
              ? "Whoever holds this seat takes on these — set here, once, per position."
              : "What whoever holds this seat is answerable for."}
          </p>
          <ul className="mt-2 space-y-1.5">
            {PERMISSIONS.map((key) => {
              const checked = position.responsibilities.includes(key);
              return (
                <li key={key} className="flex items-start gap-2.5 rounded-lg border border-border px-3 py-2">
                  <input
                    type="checkbox"
                    id={`resp-${position.id}-${key}`}
                    checked={checked}
                    disabled={!isFounder || pending}
                    onChange={() => toggleResponsibility(key)}
                    className="mt-0.5 disabled:cursor-not-allowed"
                  />
                  <label htmlFor={`resp-${position.id}-${key}`} className="min-w-0">
                    <p className={`text-sm ${checked ? "text-text" : "text-dim"}`}>
                      {getPermissionLabel(institutionType, key, PERMISSION_LABELS[key])}
                    </p>
                    <p className="text-xs text-dim">
                      {getPermissionDescription(institutionType, key, PERMISSION_DESCRIPTIONS[key])}
                    </p>
                  </label>
                </li>
              );
            })}
          </ul>
          {!isFounder && (
            <p className="mt-2 text-xs text-dim">Only the institution&apos;s founder can change what a position is responsible for.</p>
          )}
        </section>
      </div>
    </div>
  );
}
