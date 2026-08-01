"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPositionOnCanvasAction, movePositionAction, updatePositionParentsAction } from "@/applications/people/actions";
import type { Position, PositionHolder } from "@/applications/people/types";
import { PositionSidePanel, type RosterPerson } from "./PositionSidePanel";
import { Button } from "@/components/ui";

const NODE_WIDTH = 190;
const NODE_HEIGHT = 60;

type Point = { x: number; y: number };

/** The flagship visual experience named in the Product Foundation —
 *  canvas-based, drag-to-connect, multi-parent-capable from the schema
 *  up. No pan/zoom, no external graph library: a scrollable, absolutely-
 *  positioned canvas with a plain SVG overlay for connector lines is the
 *  smallest real implementation of "drag a line from one seat to
 *  another" — the interaction the founder can actually feel, without
 *  inventing infrastructure the M4 completion criteria never asked for. */
export function OrganizationCanvas({
  initialPositions,
  holdersByPosition,
  roster,
  canManage,
  isFounder,
  institutionType,
  initialSelectedId,
}: {
  initialPositions: Position[];
  holdersByPosition: Record<string, PositionHolder[]>;
  roster: RosterPerson[];
  canManage: boolean;
  isFounder: boolean;
  institutionType: import("@/os/identity/types").InstitutionType;
  /** Universal Search's own deep-link (M12) — opens straight to this
   *  Position's existing side panel, never a duplicate screen. */
  initialSelectedId?: string | null;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [positions, setPositions] = useState(initialPositions);
  useEffect(() => setPositions(initialPositions), [initialPositions]);

  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  // Universal Search (M12) — see WorkBoard's identical effect for why
  // this is needed beyond the useState initializer.
  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);
  const [dragging, setDragging] = useState<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);
  const [connecting, setConnecting] = useState<{ fromId: string; point: Point } | null>(null);
  const [newNodeAt, setNewNodeAt] = useState<Point | null>(null);
  const [newNodeName, setNewNodeName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const holderName = (positionId: string) => {
    const holder = holdersByPosition[positionId]?.find((h) => !h.endedAt);
    if (!holder) return null;
    return roster.find((p) => p.id === holder.personId)?.name ?? "Someone";
  };

  function pointFromClient(clientX: number, clientY: number): Point {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: clientX - rect.left + containerRef.current!.scrollLeft,
      y: clientY - rect.top + containerRef.current!.scrollTop,
    };
  }

  const startDragNode = (e: React.PointerEvent, position: Position) => {
    e.stopPropagation();
    const pt = pointFromClient(e.clientX, e.clientY);
    setDragging({ id: position.id, dx: pt.x - position.canvasX, dy: pt.y - position.canvasY, moved: false });
  };

  const startConnect = (e: React.PointerEvent, positionId: string) => {
    e.stopPropagation();
    if (!canManage) {
      setNotice("Managing positions isn't your responsibility here — you can still look around.");
      return;
    }
    setConnecting({ fromId: positionId, point: pointFromClient(e.clientX, e.clientY) });
  };

  useEffect(() => {
    if (!dragging && !connecting) return;

    function onMove(e: PointerEvent) {
      const pt = pointFromClient(e.clientX, e.clientY);
      if (dragging) {
        setPositions((prev) =>
          prev.map((p) => (p.id === dragging.id ? { ...p, canvasX: Math.max(8, pt.x - dragging.dx), canvasY: Math.max(8, pt.y - dragging.dy) } : p))
        );
        setDragging((d) => (d ? { ...d, moved: true } : d));
      } else if (connecting) {
        setConnecting((c) => (c ? { ...c, point: pt } : c));
      }
    }

    function onUp(e: PointerEvent) {
      const pt = pointFromClient(e.clientX, e.clientY);
      if (dragging) {
        if (dragging.moved) {
          const p = positions.find((x) => x.id === dragging.id);
          if (p) movePositionAction(p.id, p.canvasX, p.canvasY);
        } else {
          setSelectedId(dragging.id);
        }
        setDragging(null);
      }
      if (connecting) {
        const target = positions.find(
          (p) =>
            p.id !== connecting.fromId &&
            pt.x >= p.canvasX &&
            pt.x <= p.canvasX + NODE_WIDTH &&
            pt.y >= p.canvasY &&
            pt.y <= p.canvasY + NODE_HEIGHT
        );
        if (target) {
          const from = positions.find((p) => p.id === connecting.fromId);
          if (from) {
            const previousParents = from.reportsToPositionIds;
            const already = previousParents.includes(target.id);
            const nextParents = already
              ? previousParents.filter((id) => id !== target.id)
              : [...previousParents, target.id];
            setPositions((prev) => prev.map((p) => (p.id === from.id ? { ...p, reportsToPositionIds: nextParents } : p)));
            updatePositionParentsAction(from.id, nextParents).then((result) => {
              if (!result.ok) {
                setPositions((prev) => prev.map((p) => (p.id === from.id ? { ...p, reportsToPositionIds: previousParents } : p)));
                setNotice(result.error ?? "That connection isn't possible.");
              } else {
                router.refresh();
              }
            });
          }
        }
        setConnecting(null);
      }
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, connecting, positions]);

  const canvasWidth = Math.max(1000, ...positions.map((p) => p.canvasX + NODE_WIDTH + 120));
  const canvasHeight = Math.max(560, ...positions.map((p) => p.canvasY + NODE_HEIGHT + 120));

  const createNewNode = () => {
    if (!newNodeName.trim() || !newNodeAt) return;
    const { x, y } = newNodeAt;
    setNewNodeAt(null);
    setNewNodeName("");
    createPositionOnCanvasAction({ name: newNodeName.trim(), canvasX: x, canvasY: y }).then(() => router.refresh());
  };

  const selected = positions.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="relative">
      {notice && (
        <div className="os-anim-backdrop absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full border border-border bg-elevated px-4 py-1.5 text-xs text-muted">
          {notice}
        </div>
      )}
      <div
        ref={containerRef}
        className="relative h-[68vh] w-full overflow-auto rounded-2xl border border-border bg-surface/20"
        style={{ backgroundImage: "radial-gradient(circle, var(--os-border) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        onClick={(e) => {
          if (!(e.target as HTMLElement).dataset.canvasBg) return;
          if (!canManage) {
            setNotice("Managing positions isn't your responsibility here — you can still look around.");
            return;
          }
          setNewNodeAt(pointFromClient(e.clientX, e.clientY));
        }}
      >
        <div data-canvas-bg style={{ width: canvasWidth, height: canvasHeight, position: "relative" }}>
          <svg width={canvasWidth} height={canvasHeight} className="pointer-events-none absolute inset-0">
            {positions.flatMap((p) =>
              p.reportsToPositionIds.map((parentId) => {
                const parent = positions.find((x) => x.id === parentId);
                if (!parent) return null;
                const x1 = p.canvasX + NODE_WIDTH / 2;
                const y1 = p.canvasY;
                const x2 = parent.canvasX + NODE_WIDTH / 2;
                const y2 = parent.canvasY + NODE_HEIGHT;
                return (
                  <path
                    key={`${p.id}-${parentId}`}
                    d={`M ${x1} ${y1} C ${x1} ${y1 - 34}, ${x2} ${y2 + 34}, ${x2} ${y2}`}
                    stroke="var(--os-border)"
                    strokeWidth={2}
                    fill="none"
                  />
                );
              })
            )}
            {connecting &&
              (() => {
                const from = positions.find((p) => p.id === connecting.fromId);
                if (!from) return null;
                return (
                  <line
                    x1={from.canvasX + NODE_WIDTH / 2}
                    y1={from.canvasY}
                    x2={connecting.point.x}
                    y2={connecting.point.y}
                    stroke="var(--os-accent-bright)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                );
              })()}
          </svg>

          {positions.map((p) => {
            const holder = holderName(p.id);
            return (
              <div
                key={p.id}
                onPointerDown={(e) => startDragNode(e, p)}
                className={`absolute flex cursor-grab select-none flex-col justify-center rounded-xl border bg-bg px-4 py-2 shadow-sm active:cursor-grabbing ${
                  selectedId === p.id ? "border-accent" : "border-border"
                }`}
                style={{ left: p.canvasX, top: p.canvasY, width: NODE_WIDTH, height: NODE_HEIGHT }}
              >
                <p className="truncate text-sm text-text">{p.name}</p>
                <p className={`truncate text-xs ${holder ? "text-dim" : "text-accent-bright"}`}>{holder ?? "Unfilled"}</p>
                <div
                  onPointerDown={(e) => startConnect(e, p.id)}
                  title="Drag to a position this reports to"
                  className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 cursor-crosshair rounded-full border-2 border-bg bg-accent"
                />
              </div>
            );
          })}

          {newNodeAt && (
            <div
              className="os-anim-dialog absolute z-10 w-56 rounded-xl border border-border bg-elevated p-3"
              style={{ left: newNodeAt.x, top: newNodeAt.y }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <input
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createNewNode()}
                autoFocus
                placeholder="Position name"
                className="w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
              />
              <div className="mt-2 flex items-center gap-2">
                <Button size="sm" onClick={createNewNode} disabled={!newNodeName.trim()}>
                  Add
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNewNodeAt(null);
                    setNewNodeName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {positions.length === 0 && !newNodeAt && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted">
          Click anywhere to add the first position.
        </p>
      )}

      {selected && (
        <PositionSidePanel
          position={selected}
          allPositions={positions}
          holders={holdersByPosition[selected.id] ?? []}
          roster={roster}
          canManage={canManage}
          isFounder={isFounder}
          institutionType={institutionType}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
