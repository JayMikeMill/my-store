import { useState, useEffect, type ReactNode } from "react";
import { Search } from "lucide-react";
import type { QueryObject } from "@shared/types/QueryObject";

import "./dynamic-table.css";

export interface TableColumn<T> {
  id: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode; // render a cell
  renderHeader?: () => ReactNode; // render the header
  width?: string; // e.g. "200px" or "15%"
  className?: string;
  headerClassName?: string;
}

export interface DynamicTableProps<T> {
  columns: TableColumn<T>[];
  pageSize?: number;
  fetchPage: (query?: QueryObject) => Promise<{ data: T[]; total: number }>;
  searchable?: boolean;
  onRowClick?: (row: T) => void;
  headerButton?: ReactNode;
  objectsName?: string;
}

export default function DynamicTable<T extends { id?: string }>({
  columns = [],
  pageSize = 10,
  fetchPage,
  searchable = true,
  onRowClick,
  headerButton: button,
  objectsName = "Objects",
}: DynamicTableProps<T>) {
  const [pageData, setPageData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  const loadPage = async (pageNumber: number) => {
    setLoading(true);
    try {
      const fetchQuery = {
        search: search || undefined,
        sortBy: sortKey || undefined,
        sortOrder: sortKey ? sortOrder : undefined,
        limit: pageSize,
        page: pageNumber,
      } as QueryObject;

      const { data, total } = await fetchPage(fetchQuery);

      setPageData(data);
      setTotal(total);
    } catch (err) {
      console.error("Failed to load table page:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reload whenever page, search, or sort changes
  useEffect(() => {
    loadPage(page);
  }, [page, search, sortKey, sortOrder]);

  const handleSort = (col: TableColumn<T>) => {
    if (!col.sortable) return;
    if (sortKey === col.id) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(col.id);
      setSortOrder("asc");
    }
    setPage(1); // reset to first page when sorting changes
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearch(searchInput); // triggers useEffect → fetchPage
    setPage(1); // reset pagination
    console.log("Search submitted:", searchInput);
  };

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="flex flex-row w-full gap-2 items-center">
        {button && <div className="h-full">{button}</div>}

        {searchable && (
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full h-full"
          >
            <input
              type="text"
              placeholder={
                objectsName ? `Search ${objectsName}...` : "Search..."
              }
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-box w-full h-full px-3 py-2 rounded border focus:outline-none"
            />
            <Search
              className="text-text absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
              size={20}
              onClick={() => handleSearchSubmit(new Event("submit") as any)}
            />
          </form>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        {loading || (pageData || []).length === 0 ? (
          <div className="w-full flex items-center justify-center border-border border rounded h-24 text-text text-3xl">
            {loading ? "" : "No" + (objectsName ? ` ${objectsName}` : "")}
          </div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    className={`${col.sortable ? "sortable" : ""} ${col.headerClassName || ""}`}
                    style={
                      col.width ? { width: col.width } : { width: "120px" }
                    }
                    onClick={() => handleSort(col)}
                  >
                    {col.renderHeader ? (
                      col.renderHeader()
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        {col.label}
                        {sortKey === col.id && (
                          <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(structuredClone(row))}
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={col.className || ""}
                      style={
                        col.width ? { width: col.width } : { width: "120px" }
                      }
                    >
                      {col.render ? col.render(row) : (row as any)[col.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="table-pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          <span className="flex items-center text-text">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
