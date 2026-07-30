"use client";

import { useMemo, useState } from "react";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  /** Text columns left-align, numeric columns right-align — per the
   *  frozen Visual Design System's table rule, never left to per-column
   *  guesswork. */
  align?: "left" | "right";
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
};

/**
 * The one reusable table primitive for RDIOS — Implementation Sprint 2.5
 * §5. No real data uses this yet (Money and Reports arrive with M7), so
 * this is built and proven against the People roster instead: real rows,
 * real sorting, real empty state, not a speculative demo. Every rule from
 * the frozen document is here: no zebra striping (`.os-table` in
 * globals.css), a hairline divider between rows, a hover highlight,
 * sticky headers, tabular figures available via the `.os-table-num`
 * class on numeric cells. Selection and a loading skeleton are built in
 * since the frozen document names them explicitly, even though nothing
 * in RDIOS exercises them live yet — named honestly in the Sprint 2.5
 * report rather than left out silently.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  loadingRowCount = 4,
  emptyTitle,
  emptyDescription,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  onRowClick,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  loadingRowCount?: number;
  emptyTitle: string;
  emptyDescription?: string;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  onRowClick?: (row: T) => void;
}) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const withValues = rows.map((row) => ({ row, value: col.sortValue!(row) }));
    withValues.sort((a, b) => (a.value < b.value ? -1 : a.value > b.value ? 1 : 0));
    if (sort.dir === "desc") withValues.reverse();
    return withValues.map((w) => w.row);
  }, [rows, sort, columns]);

  const toggleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;
    setSort((prev) => {
      if (prev?.key !== col.key) return { key: col.key, dir: "asc" };
      if (prev.dir === "asc") return { key: col.key, dir: "desc" };
      return null;
    });
  };

  const allKeys = useMemo(() => new Set(rows.map(rowKey)), [rows, rowKey]);
  const allSelected = selectable && selectedKeys && allKeys.size > 0 && [...allKeys].every((k) => selectedKeys.has(k));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? new Set() : new Set(allKeys));
  };

  const toggleOne = (key: string) => {
    if (!onSelectionChange || !selectedKeys) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  if (!loading && rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    // Responsive: the table scrolls horizontally within its own container
    // on narrow viewports rather than breaking the page layout — the
    // frozen document's "no overflow" rule, satisfied the simple way,
    // not a separate stacked-card layout this sprint didn't have time to
    // build and verify properly.
    <div className="max-h-[70vh] overflow-auto rounded-2xl border border-border">
      <table className="os-table">
        <thead>
          <tr>
            {selectable && (
              <th className="w-10">
                <input type="checkbox" checked={!!allSelected} onChange={toggleAll} aria-label="Select all rows" />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.align === "right" ? "os-table-num" : undefined}
                aria-sort={sort?.key === col.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
              >
                {col.sortable ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(col)}
                    className="inline-flex items-center gap-1 hover:text-text"
                  >
                    {col.header}
                    {sort?.key === col.key && <span aria-hidden="true">{sort.dir === "asc" ? "↑" : "↓"}</span>}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: loadingRowCount }).map((_, i) => (
                <tr key={`skeleton-${i}`} aria-hidden="true">
                  {selectable && (
                    <td>
                      <Skeleton className="h-4 w-4" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key}>
                      <Skeleton className="h-4 w-full max-w-[10rem]" />
                    </td>
                  ))}
                </tr>
              ))
            : sorted.map((row) => {
                const key = rowKey(row);
                return (
                  <tr
                    key={key}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={onRowClick ? "cursor-pointer" : undefined}
                  >
                    {selectable && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={!!selectedKeys?.has(key)}
                          onChange={() => toggleOne(key)}
                          aria-label="Select row"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={col.align === "right" ? "os-table-num tabular-nums" : undefined}>
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}
