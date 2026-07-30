"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui";

export type PositionRow = {
  id: string;
  name: string;
  reportsTo: string;
  holderName: string | null;
  holderPersonId: string | null;
};

/** The Positions list, rebuilt on the shared DataTable primitive
 *  (Implementation Sprint 2.5 §5) — three real, comparable columns
 *  (Position, Reports to, Holder) across every row, exactly the shape
 *  the frozen document reserves tables for. The People roster one
 *  section up deliberately stays a plain List: two fields, one person
 *  per row, no real column comparison happening — forcing it into a
 *  table would contradict the frozen document's own "Lists... a
 *  consistent divider is enough" rule rather than prove the pattern. */
export function PositionsTable({ rows }: { rows: PositionRow[] }) {
  const columns: DataTableColumn<PositionRow>[] = [
    {
      key: "name",
      header: "Position",
      sortable: true,
      sortValue: (r) => r.name.toLowerCase(),
      render: (r) => <span className="text-text">{r.name}</span>,
    },
    {
      key: "reportsTo",
      header: "Reports to",
      sortable: true,
      sortValue: (r) => r.reportsTo.toLowerCase(),
      render: (r) => <span className="text-dim">{r.reportsTo}</span>,
    },
    {
      key: "holder",
      header: "Holder",
      sortable: true,
      sortValue: (r) => (r.holderName ?? "").toLowerCase(),
      render: (r) =>
        r.holderPersonId ? (
          <Link href={`/people/${r.holderPersonId}`} className="text-accent-bright hover:underline">
            {r.holderName}
          </Link>
        ) : (
          <span className="text-accent-bright">Unfilled</span>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      emptyTitle="No positions yet"
      emptyDescription="Add one to start appointing people to roles."
    />
  );
}
