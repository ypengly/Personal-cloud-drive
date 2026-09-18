import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

export type SortField = "name" | "size" | "type" | "date";

export function SortControl({
  sort,
  order,
  onChange,
}: {
  sort: SortField;
  order: "asc" | "desc";
  onChange: (sort: SortField, order: "asc" | "desc") => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <select
        value={sort}
        onChange={(e) => onChange(e.target.value as SortField, order)}
        className="rounded-md border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 px-2 py-1.5 text-sm"
      >
        <option value="name">Name</option>
        <option value="size">Size</option>
        <option value="type">Type</option>
        <option value="date">Date</option>
      </select>
      <button
        onClick={() => onChange(sort, order === "asc" ? "desc" : "asc")}
        className="p-1.5 rounded-md border border-graphite-300 dark:border-graphite-700 text-graphite-500 hover:bg-graphite-100 dark:hover:bg-graphite-800"
        title={order === "asc" ? "Ascending" : "Descending"}
      >
        {order === "asc" ? <ArrowUpAZ className="w-4 h-4" /> : <ArrowDownAZ className="w-4 h-4" />}
      </button>
    </div>
  );
}
