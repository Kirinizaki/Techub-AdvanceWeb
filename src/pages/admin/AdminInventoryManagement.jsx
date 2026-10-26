import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  Banknote,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Package,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Warehouse,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { supabase } from "../../lib/supabaseClient";
import { edgeFunctionErrorMessage } from "../../lib/edgeFunctionErrors";

/*
  Uses only columns that exist on public.products:
  id, sku, name, description, price, product_type, stock_quantity
*/
const REORDER_POINT = 5; // at or below this = Low Stock

const money = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

function StatCard({ title, value, detail, icon: Icon, color }) {
  return (
    <div className="min-w-0 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-600">{title}</p>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${color}`}
        >
          <Icon size={15} />
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
        {value}
      </p>

      <p className="mt-2 text-[10px] text-slate-500">{detail}</p>
    </div>
  );
}

function StockStatus({ stock }) {
  if (stock === 0) {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600">
        Out of Stock
      </span>
    );
  }

  if (stock <= Math.max(2, Math.floor(REORDER_POINT / 2))) {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700">
        Critical Low
      </span>
    );
  }

  if (stock <= REORDER_POINT) {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-semibold text-indigo-700">
        Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex whitespace-nowrap rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
      ● Optimal
    </span>
  );
}

export default function AdminInventoryManagement({ onLogout }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [restockingId, setRestockingId] = useState(null);
  const [stockEditor, setStockEditor] = useState(null);
  const [stockInput, setStockInput] = useState("");
  const [stockMode, setStockMode] = useState("set");
  const [sortAscending, setSortAscending] = useState(true);
  const activeStockRequests = useRef(new Set());

  const pageSize = 6;

  async function loadInventory() {
    setLoading(true);
    setLoadError("");

    const pageSize = 1000;
    const data = [];
    let offset = 0;
    let error = null;
    while (true) {
      const result = await supabase.from("products")
        .select("id, sku, name, description, price, product_type, category_id, stock_quantity, categories(name)")
        .order("id", { ascending: true })
        .range(offset, offset + pageSize - 1);
      if (result.error) { error = result.error; break; }
      data.push(...(result.data ?? []));
      if ((result.data ?? []).length < pageSize) break;
      offset += pageSize;
      if (offset >= 100_000) {
        error = new Error("Inventory is too large to load in one view. Narrow your search or contact support.");
        break;
      }
    }

    if (error) {
      setLoadError(error.message);
      setProducts([]);
    } else {
      setProducts(
        (data ?? []).map((p) => ({
          id: p.id,
          sku: p.sku ?? "—",
          name: p.name ?? "Unnamed product",
          spec: p.description ?? "",
          category: p.categories?.name ?? p.product_type ?? "Uncategorized",
          price: Number(p.price ?? 0),
          stock: Number(p.stock_quantity ?? 0),
        }))
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matching = !term ? products : products.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
    );
    const inCategory = categoryFilter === "All" ? matching : matching.filter((item) => item.category === categoryFilter);
    return [...inCategory].sort((a, b) => sortAscending
      ? a.stock - b.stock || a.name.localeCompare(b.name)
      : b.stock - a.stock || a.name.localeCompare(b.name));
  }, [search, categoryFilter, products, sortAscending]);
  const categoryOptions = useMemo(() => [...new Set(products.map((item) => item.category))].sort((a, b) => a.localeCompare(b)), [products]);

  const totalUnits = products.reduce((sum, item) => sum + item.stock, 0);
  const lowStock = products.filter(
    (item) => item.stock > 0 && item.stock <= REORDER_POINT
  ).length;
  const outOfStock = products.filter((item) => item.stock === 0).length;
  const inventoryValue = products.reduce(
    (sum, item) => sum + item.stock * item.price,
    0
  );

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  async function saveStock(item) {
    if (activeStockRequests.current.has(item.id)) return;
    const amount = Number(stockInput);
    if (stockInput.trim() === "" || !Number.isSafeInteger(amount) || amount < 0 || (stockMode === "add" && amount === 0)) {
      setNotice("Enter a valid whole number. Stock must remain nonnegative.");
      return;
    }
    activeStockRequests.current.add(item.id);
    setRestockingId(item.id);
    try {
      const { data, error } = await supabase.functions.invoke("manage-inventory", {
        body: {
          action: stockMode,
          product_id: item.id,
          quantity: amount,
          expected_stock: item.stock,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const savedStock = Number(data?.stock_quantity);
      if (!Number.isSafeInteger(savedStock) || savedStock < 0) throw new Error("The saved stock quantity could not be confirmed.");
      setProducts((rows) => rows.map((row) => row.id === item.id ? { ...row, stock: savedStock } : row));
      setNotice(stockMode === "add" ? `${item.name}: added ${amount} units (now ${savedStock}).` : `${item.name}: stock set to ${savedStock}.`);
      setStockEditor(null);
    } catch (failure) {
      const message = await edgeFunctionErrorMessage(failure, "Stock update failed.");
      setNotice(`Stock update failed: ${message}`);
      if (message.toLowerCase().includes("changed elsewhere")) await loadInventory();
    } finally {
      activeStockRequests.current.delete(item.id);
      setRestockingId(null);
    }
  }

  function exportInventory() {
    const header = ["SKU", "Product", "Category", "Stock", "Price"];

    const rows = filteredRows.map((item) => [
      item.sku,
      item.name,
      item.category,
      item.stock,
      item.price,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "inventory-report.csv";
    link.click();

    URL.revokeObjectURL(url);
    setNotice("Inventory CSV exported.");
  }

  function resetFilters() {
    setSearch("");
    setCategoryFilter("All");
    setPage(1);
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="w-full min-w-0 text-slate-800">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold">Inventory Management &amp; SKU</h1>
          <p className="mt-1 text-xs text-slate-500">
            Monitor stock levels, SKU tracking, and replenishment.
          </p>
        </div>

        {/* Summary cards */}
        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Units in Stock"
            value={loading ? "…" : loadError ? "—" : totalUnits.toLocaleString()}
            detail="Across all products"
            icon={Warehouse}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            title="Low Stock"
            value={loading ? "…" : loadError ? "—" : `${lowStock} SKUs`}
            detail={`${REORDER_POINT} units or fewer remaining`}
            icon={AlertTriangle}
            color="bg-rose-50 text-rose-600"
          />
          <StatCard
            title="Out of Stock SKUs"
            value={loading ? "…" : loadError ? "—" : `${outOfStock} SKUs`}
            detail="Requires immediate replenishment"
            icon={Package}
            color="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            title="Total Inventory Value"
            value={loading ? "…" : loadError ? "—" : money(inventoryValue)}
            detail="Stock × selling price"
            icon={Banknote}
            color="bg-emerald-50 text-emerald-600"
          />
        </section>

        {/* Low stock alert */}
        {!loading && lowStock + outOfStock > 0 && (
          <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600">
                <BellRing size={15} />
              </span>
              <div>
                <p className="text-xs font-bold text-rose-800">
                  Stock needs attention
                </p>
                <p className="mt-1 text-[11px] text-rose-700">
                  {lowStock + outOfStock} products are low or out of stock.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                resetFilters();
                setNotice("Showing all inventory items for stock review.");
              }}
              className="rounded-lg bg-rose-700 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-800"
            >
              Review Stock
            </button>
          </section>
        )}

        {/* Load error */}
        {loadError && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
            <span>Could not load inventory: {loadError}</span>
            <button
              onClick={loadInventory}
              className="shrink-0 font-semibold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Notice */}
        {notice && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800">
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              className="shrink-0 font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Inventory panel */}
        <section className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <h2 className="text-sm font-bold">Inventory Overview</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Monitor SKU quantities and stock availability.
              </p>
            </div>

            <button
              onClick={exportInventory}
              disabled={loading || filteredRows.length === 0}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <ArrowDownToLine size={13} />
              Export CSV
            </button>
          </div>

          {/* Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4">
            <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 sm:max-w-md">
              <Search size={14} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by SKU, product, or category..."
                className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setPage(1); }} aria-label="Filter inventory by category" className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700">
              <option value="All">All categories</option>
              {categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>

            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <SlidersHorizontal size={13} />
              Reset Filters
            </button>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-175 border-collapse text-left">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {[
                    "SKU Code",
                    "Product Name & Spec",
                    "Category",
                    "In Stock",
                    "Status",
                    "Quick Action",
                  ].map((heading) => (
                    <th key={heading} className="px-3 py-3">
                      {heading === "In Stock" ? <button type="button" className="inline-flex items-center gap-1" onClick={() => setSortAscending((value) => !value)} aria-label={`Sort stock ${sortAscending ? "descending" : "ascending"}`}>{heading} <span>{sortAscending ? "↑" : "↓"}</span></button> : heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-xs text-slate-500"
                    >
                      Loading inventory…
                    </td>
                  </tr>
                )}

                {!loading &&
                  visibleRows.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b border-slate-100 last:border-0 ${
                        item.stock === 0 ? "bg-rose-50/60" : "bg-white"
                      }`}
                    >
                      <td className="px-3 py-3">
                        <span className="whitespace-nowrap rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700">
                          {item.sku}
                        </span>
                      </td>

                      <td className="max-w-60 px-3 py-3">
                        <p className="text-xs font-semibold text-slate-800">
                          {item.name}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
                          {item.spec}
                        </p>
                      </td>

                      <td className="px-3 py-3 text-xs text-slate-700">
                        {item.category}
                      </td>

                      <td
                        className={`px-3 py-3 text-center text-xs font-bold ${
                          item.stock <= REORDER_POINT
                            ? "text-rose-600"
                            : "text-blue-600"
                        }`}
                      >
                        {item.stock}
                      </td>

                      <td className="px-3 py-3">
                        <StockStatus stock={item.stock} />
                      </td>

                      <td className="px-3 py-3">
                        {stockEditor === item.id ? <div className="flex min-w-44 flex-col gap-1.5">
                          <span className="text-[10px] text-slate-600">Current: {item.stock}</span>
                          <select aria-label="Stock operation" value={stockMode} onChange={(event) => setStockMode(event.target.value)} className="rounded border px-2 py-1 text-[10px]"><option value="set">Set exact quantity</option><option value="add">Add units</option></select>
                          <input type="number" min={stockMode === "add" ? "1" : "0"} step="1" value={stockInput} onChange={(event) => setStockInput(event.target.value)} aria-label={stockMode === "add" ? "Units to add" : "New stock quantity"} className="w-full rounded border px-2 py-1 text-[10px]" />
                          <span className="text-[10px] text-slate-600">Proposed: {stockInput === "" || !Number.isSafeInteger(Number(stockInput)) ? "—" : stockMode === "add" ? item.stock + Number(stockInput) : Number(stockInput)}</span>
                          <div className="flex gap-1"><button type="button" onClick={() => saveStock(item)} disabled={restockingId === item.id} className="rounded bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white disabled:opacity-50">{restockingId === item.id ? "Saving…" : "Save"}</button><button type="button" onClick={() => setStockEditor(null)} className="rounded border px-2 py-1 text-[10px]">Cancel</button></div>
                        </div> : <div className="flex gap-1"><button type="button" onClick={() => { setStockMode("set"); setStockInput(String(item.stock)); setStockEditor(item.id); }} className="rounded-lg border border-slate-200 px-2 py-1.5 text-[10px] font-semibold text-slate-700">Edit</button><button
                          onClick={() => { setStockMode("add"); setStockInput(""); setStockEditor(item.id); }}
                          disabled={restockingId === item.id}
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-white disabled:opacity-60 ${
                            item.stock === 0
                              ? "bg-rose-700 hover:bg-rose-800"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          <RotateCcw size={11} />
                          {restockingId === item.id
                            ? "Saving…"
                            : "Restock"}
                        </button></div>}
                      </td>
                    </tr>
                  ))}

                {!loading && visibleRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-xs text-slate-500"
                    >
                      {loadError
                        ? "Inventory could not be loaded."
                        : "No inventory items match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <p className="text-[10px] text-slate-500">
              Showing{" "}
              {filteredRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              {"–"}
              {Math.min(currentPage * pageSize, filteredRows.length)} of{" "}
              {filteredRows.length} SKUs
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={13} />
              </button>

              {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => setPage(number)}
                    className={`min-w-7 rounded-lg px-2 py-1.5 text-[10px] ${
                      currentPage === number
                        ? "bg-blue-600 font-semibold text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}

              <button
                disabled={currentPage === pageCount}
                onClick={() =>
                  setPage((value) => Math.min(pageCount, value + 1))
                }
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* Page footer */}
        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-5 py-3 text-[10px] text-slate-500 shadow-sm">
          <p>© 2026 TechHub Inc. All rights reserved.</p>

          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-blue-600">
              Privacy Policy
            </a>
            <span className="text-slate-300">|</span>
            <a href="#" className="hover:text-blue-600">
              Terms of Service
            </a>
            <span className="text-slate-300">|</span>
            <a href="#" className="hover:text-blue-600">
              Support Center
            </a>
          </div>
        </footer>
      </div>
    </AdminLayout>
  );
}
