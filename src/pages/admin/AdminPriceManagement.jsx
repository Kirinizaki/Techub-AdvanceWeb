import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { fetchAllRows } from "../../lib/fetchAllRows";
import {
  Search,
  SlidersHorizontal,
  Tag,
  AlertTriangle,
  Percent,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  LayoutGrid,
  List,
  Filter,
  Package,
  X,
  Check,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";

const money = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const marginOptions = [
  "All Margin Thresholds",
  "Below 20%",
  "20% - 30%",
  "Above 30%",
];

const getMargin = (cost, selling) => {
  if (cost === null || cost === undefined || cost === "") return null;
  const c = Number(cost);
  const s = Number(selling) || 0;
  return Number.isFinite(c) && s > 0 ? Number((((s - c) / s) * 100).toFixed(1)) : null;
};

// Map the database product/category records to the fields used by this page.
const mapProduct = (row) => {
  const price = Number(row.price) || 0;
  const rawCost = row.cost_price ?? row.cost;
  const cost = rawCost === null || rawCost === undefined || rawCost === "" ? null : Number(rawCost);
  return {
    id: row.id,
    sku: row.sku || "",
    name: row.name || "Unnamed product",
    cost,
    selling: price,
    standard: row.standard_price ?? row.msrp ?? null,
    margin: getMargin(cost, price),
    rules: "None",
    category: row.categories?.name || "Uncategorized",
    categoryId: row.category_id || "",
    is_active: row.is_active ?? true,
  };
};

export default function AdminPriceManagement({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [marginFilter, setMarginFilter] = useState("All Margin Thresholds");
  const [page, setPage] = useState(1);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkPercent, setBulkPercent] = useState("5");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const pageSize = 5;

  const loadProducts = async () => {
    setLoading(true);
    setMessage("");
    // Only update the product price fields used by this screen. Cost and MSRP
    // are optional app fields, so they are read only if those columns exist.
    const { data, error } = await fetchAllRows(() => supabase
      .from("products")
      .select("id, sku, name, slug, description, price, image_url, category_id, brand_id, stock_quantity, is_active, created_at, updated_at, product_type, categories(name)")
      .order("name", { ascending: true }).order("id", { ascending: true }));

    if (error) {
      console.error("Pricing data load failed:", error);
      setMessage("Could not load prices.");
      setProducts([]);
    } else {
      setProducts((data || []).map(mapProduct));
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      // Categories are only used for display/filtering on this page.
      console.error("Could not load categories:", error.message);
      setCategories([]);
      return;
    }
    setCategories(data || []);
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const categoryNames = useMemo(
    () => ["All Categories", ...new Set([
      ...categories.map((item) => item.name),
      ...products.map((item) => item.category),
    ].filter(Boolean))],
    [categories, products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query);
      const matchesCategory =
        category === "All Categories" || product.category === category;
      let matchesMargin = true;
      if (marginFilter === "Below 20%") matchesMargin = product.margin !== null && product.margin < 20;
      else if (marginFilter === "20% - 30%") {
        matchesMargin = product.margin !== null && product.margin >= 20 && product.margin <= 30;
      } else if (marginFilter === "Above 30%") {
        matchesMargin = product.margin !== null && product.margin > 30;
      }
      return matchesSearch && matchesCategory && matchesMargin;
    });
  }, [products, search, category, marginFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const margins = products.map((product) => product.margin).filter((margin) => margin !== null);
  const averageMargin = margins.length
    ? margins.reduce((sum, margin) => sum + margin, 0) / margins.length
    : null;
  const pricingStatus = loading
    ? { value: "Loading…", note: "Loading product prices" }
    : message.startsWith("Could not load")
      ? { value: "Unable to load prices", note: "Refresh to try again" }
      : message.startsWith("Could not update") || message.startsWith("Price was not saved") || message.startsWith("Bulk update stopped")
        ? { value: "Unable to save prices", note: "Review the error and retry" }
        : message.includes("successfully")
          ? { value: "Prices saved", note: "The changes were confirmed" }
          : averageMargin === null && products.length > 0
            ? { value: "Pricing data incomplete", note: "Cost information is not available" }
            : { value: "Prices loaded", note: "Product price data is ready" };

  const updateProduct = async (event) => {
    event.preventDefault();
    if (!editingProduct) return;

    const selling = Number(editingProduct.selling);
    if (!Number.isFinite(selling) || selling <= 0) {
      setMessage("Enter a valid selling price greater than zero.");
      return;
    }
    // The provided schema confirms `price`, but does not show cost_price or
    // standard_price columns. Update only the confirmed database field.
    setSaving(true);
    const { data, error } = await supabase
      .from("products")
      .update({ price: selling, updated_at: new Date().toISOString() })
      .eq("id", editingProduct.id).select("id");

    if (error) {
      console.error("Price update failed:", error);
      setMessage("Could not update price. Review the product and try again.");
      setSaving(false);
      return;
    }
    if (!data?.length) {
      setMessage("Price was not saved. Refresh the product and try again.");
      setSaving(false);
      return;
    }

    setProducts((previous) =>
      previous.map((product) =>
        product.id === editingProduct.id
          ? {
              ...product,
              selling,
              // Cost and standard are display values unless matching columns
              // are added to the database schema.
              margin: getMargin(product.cost, selling),
            }
          : product
      )
    );
    setEditingProduct(null);
    setSaving(false);
    setMessage("Price updated successfully.");
  };

  const applyBulkAdjustment = async () => {
    const percentage = Number(bulkPercent);
    if (
      selected.length === 0 ||
      !Number.isFinite(percentage) ||
      percentage < -100 ||
      percentage > 100
    ) {
      setMessage("Select products and enter an adjustment from -100% to 100%.");
      return;
    }

    const selectedProducts = products.filter((product) => selected.includes(product.id));
    const updates = selectedProducts.map((product) => ({
      id: product.id,
      price: Math.round(product.selling * (1 + percentage / 100) * 100) / 100,
    }));

    setSaving(true);
    for (const item of updates) {
      const { data, error } = await supabase
        .from("products")
        .update({ price: item.price, updated_at: new Date().toISOString() })
        .eq("id", item.id).select("id");
      if (error || !data?.length) {
        if (error) console.error("Bulk price update failed:", error);
        setMessage("Bulk update stopped. Earlier prices may already have been saved; refresh and review them.");
        setSaving(false);
        await loadProducts();
        return;
      }
    }

    setProducts((previous) =>
      previous.map((product) => {
        const update = updates.find((item) => item.id === product.id);
        if (!update) return product;
        return {
          ...product,
          selling: update.price,
          margin: getMargin(product.cost, update.price),
        };
      })
    );
    setSelected([]);
    setBulkMode(false);
    setSaving(false);
    setMessage(`Updated ${updates.length} product price(s) successfully.`);
  };

  const toggleSelected = (id) => {
    setSelected((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = visibleProducts.map((product) => product.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
    setSelected((previous) =>
      allSelected
        ? previous.filter((id) => !visibleIds.includes(id))
        : [...new Set([...previous, ...visibleIds])]
    );
  };

  const exportCSV = () => {
    const headers = ["SKU", "Product", "Category", "Cost", "Selling Price", "Standard Price", "Gross Margin", "Active Rules"];
    const rows = filteredProducts.map((product) => [
      product.sku, product.name, product.category, product.cost,
      product.selling, product.standard, `${product.margin}%`, product.rules,
    ]);
    const escapeCSV = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "techhub-price-management.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setMarginFilter("All Margin Thresholds");
    setPage(1);
  };

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="min-h-full space-y-4 text-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Price Management</h1>
              <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600">Live &amp; Managed</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Review and update product selling prices.</p>
          </div>
          <button type="button" onClick={() => setBulkMode(true)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50" disabled={saving}>
            <SlidersHorizontal size={14} /> Bulk Price Adjustment
          </button>
        </div>

        {message && (
          <div role="status" className="flex items-start justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-slate-700">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")} aria-label="Dismiss message"><X size={14} /></button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Average Gross Margin" value={averageMargin === null ? "Unavailable" : `${averageMargin.toFixed(1)}%`} note={averageMargin === null ? "Cost information is not available" : `${margins.length} products with cost data`} icon={Percent} iconStyle="bg-emerald-50 text-emerald-600" />
          <SummaryCard title="Products Loaded" value={loading ? "…" : message.startsWith("Could not load") ? "—" : String(products.length)} note="Products with available pricing" icon={Package} iconStyle="bg-indigo-50 text-indigo-600" />
          <SummaryCard title="Selected Products" value={String(selected.length)} note="For bulk price changes" icon={Tag} iconStyle="bg-blue-50 text-blue-600" />
          <SummaryCard title="Pricing Status" value={pricingStatus.value} note={pricingStatus.note} icon={AlertTriangle} iconStyle="bg-blue-50 text-blue-600" />
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <h2 className="text-sm font-bold">Pricing Matrix &amp; SKU Overrides</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">Search, filter, export, and update product selling prices.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={loadProducts} title="Refresh products" className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50" disabled={loading}>Refresh</button>
              <button type="button" onClick={exportCSV} title="Export CSV" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-blue-600"><Download size={14} /></button>
              <button type="button" onClick={() => setView("list")} title="List view" className={`rounded-lg border p-2 ${view === "list" ? "border-blue-100 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}><List size={14} /></button>
              <button type="button" onClick={() => setView("grid")} title="Grid view" className={`rounded-lg border p-2 ${view === "grid" ? "border-blue-100 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}><LayoutGrid size={14} /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 px-4 pb-4 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_auto]">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3">
              <Search size={14} className="shrink-0 text-slate-400" />
              <input type="text" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by SKU or product name..." className="min-w-0 flex-1 bg-transparent py-2.5 text-xs outline-none placeholder:text-slate-400" aria-label="Search products" />
              {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="text-slate-400 hover:text-slate-700"><X size={13} /></button>}
            </div>
            <div className="relative">
              <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 pr-8 text-xs text-slate-600 outline-none focus:border-blue-300" aria-label="Filter by category">
                {categoryNames.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="relative">
              <select value={marginFilter} onChange={(event) => { setMarginFilter(event.target.value); setPage(1); }} className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 pr-8 text-xs text-slate-600 outline-none focus:border-blue-300" aria-label="Filter by gross margin">
                {marginOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <Filter size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button type="button" onClick={resetFilters} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Reset</button>
          </div>

          {view === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left">
                <thead><tr className="border-y border-slate-100 bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="w-9 px-4 py-3"><input type="checkbox" checked={visibleProducts.length > 0 && visibleProducts.every((product) => selected.includes(product.id))} onChange={toggleAllVisible} aria-label="Select all visible products" className="accent-blue-600" /></th>
                  <th className="px-2 py-3">SKU &amp; Product Details</th><th className="px-3 py-3">Cost Basis</th><th className="px-3 py-3">Selling Price</th><th className="px-3 py-3">Standard MSRP</th><th className="px-3 py-3">Gross Margin</th><th className="px-3 py-3">Active Rules</th><th className="px-4 py-3 text-right">Action</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? <tr><td colSpan={8} className="px-4 py-12 text-center text-xs text-slate-500">Loading product prices…</td></tr> : visibleProducts.map((product) => (
                    <tr key={product.id} className="transition hover:bg-blue-50/30">
                      <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelected(product.id)} aria-label={`Select ${product.name}`} className="accent-blue-600" /></td>
                      <td className="px-2 py-3"><div className="flex min-w-57.5 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600"><Package size={15} /></span><div><p className="text-xs font-semibold text-slate-800">{product.name}</p><p className="mt-0.5 text-[10px] text-slate-400">SKU - {product.sku || "Not set"}</p><p className="text-[10px] text-slate-400">{product.category}</p></div></div></td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">{product.cost === null ? "Unavailable" : money(product.cost)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-slate-800">{money(product.selling)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">{product.standard == null ? "Unavailable" : money(product.standard)}</td>
                      <td className="px-3 py-3">{product.margin === null ? <span className="text-[10px] text-slate-500">Unavailable</span> : <span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${product.margin < 20 ? "bg-rose-50 text-rose-600" : product.margin > 30 ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{product.margin.toFixed(1)}%</span>}</td>
                      <td className="px-3 py-3"><span className="inline-block rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">{product.rules}</span></td>
                      <td className="px-4 py-3 text-right"><button type="button" onClick={() => { setEditingProduct({ ...product }); setMessage(""); }} className="rounded-md bg-blue-600 px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-blue-700">Update</button></td>
                    </tr>
                  ))}
                  {!loading && visibleProducts.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-xs text-slate-500"><Package size={24} className="mx-auto mb-2 text-slate-300" />No products match your filters.</td></tr>}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {loading ? <p className="col-span-full py-10 text-center text-xs text-slate-500">Loading products…</p> : visibleProducts.map((product) => (
                <div key={product.id} className="rounded-xl border border-slate-100 p-4 transition hover:border-blue-200 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Package size={15} /></span><div><p className="text-xs font-semibold">{product.name}</p><p className="text-[10px] text-slate-400">{product.sku || "No SKU"}</p></div></div><input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelected(product.id)} aria-label={`Select ${product.name}`} className="accent-blue-600" /></div>
                  <div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-[10px] text-slate-400">Cost Basis</p><p className="mt-1 text-xs">{product.cost === null ? "Unavailable" : money(product.cost)}</p></div><div><p className="text-[10px] text-slate-400">Selling Price</p><p className="mt-1 text-xs font-semibold">{money(product.selling)}</p></div><div><p className="text-[10px] text-slate-400">Standard MSRP</p><p className="mt-1 text-xs">{product.standard == null ? "Unavailable" : money(product.standard)}</p></div><div><p className="text-[10px] text-slate-400">Gross Margin</p><p className="mt-1 text-xs font-semibold text-blue-600">{product.margin === null ? "Unavailable" : `${product.margin.toFixed(1)}%`}</p></div></div>
                  <button type="button" onClick={() => { setEditingProduct({ ...product }); setMessage(""); }} className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700">Update Pricing</button>
                </div>
              ))}
              {!loading && visibleProducts.length === 0 && <p className="col-span-full py-10 text-center text-xs text-slate-500">No products match your filters.</p>}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <p className="text-[10px] text-slate-500">Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} matching SKUs</p>
            <div className="flex items-center gap-1">
              <PaginationButton label="First page" disabled={currentPage === 1} onClick={() => setPage(1)}><ChevronsLeft size={13} /></PaginationButton>
              <PaginationButton label="Previous page" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft size={13} /></PaginationButton>
              {Array.from({ length: totalPages }, (_, index) => index + 1).filter((number) => number === 1 || number === totalPages || Math.abs(number - currentPage) <= 1).map((number, index, numbers) => <span key={number} className="contents">{index > 0 && numbers[index - 1] !== number - 1 && <span className="px-1 text-[10px] text-slate-400">...</span>}<button type="button" onClick={() => setPage(number)} aria-label={`Page ${number}`} aria-current={number === currentPage ? "page" : undefined} className={`h-7 min-w-7 rounded-md px-2 text-[10px] font-medium ${number === currentPage ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{number}</button></span>)}
              <PaginationButton label="Next page" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}><ChevronRight size={13} /></PaginationButton>
              <PaginationButton label="Last page" disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}><ChevronsRight size={13} /></PaginationButton>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1 pt-2 text-[10px] text-slate-400">
          <p>© 2026 TechHub Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3"><span>Privacy Policy</span><span>|</span><span>Terms of Service</span><span>|</span><span>Support Center</span></div>
        </footer>
      </div>

      {editingProduct && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingProduct(null); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="edit-pricing-title" className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
          <div className="flex items-start justify-between gap-3"><div><h2 id="edit-pricing-title" className="text-sm font-bold">Update Product Pricing</h2><p className="mt-1 text-[11px] text-slate-500">{editingProduct.name}</p></div><button type="button" onClick={() => setEditingProduct(null)} aria-label="Close modal" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X size={16} /></button></div>
          <form onSubmit={updateProduct} className="mt-5 space-y-4">
            <PriceInput label="Selling Price (₱)" value={editingProduct.selling} onChange={(value) => setEditingProduct((previous) => ({ ...previous, selling: value }))} />
            <p className="text-[10px] text-amber-700">Cost and MSRP values are unavailable, so gross margin cannot be calculated.</p>
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setEditingProduct(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"><Check size={13} />{saving ? "Saving…" : "Save Changes"}</button></div>
          </form>
        </div>
      </div>}

      {bulkMode && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setBulkMode(false); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="bulk-pricing-title" className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
          <div className="flex items-start justify-between gap-3"><div><h2 id="bulk-pricing-title" className="text-sm font-bold">Bulk Price Adjustment</h2><p className="mt-1 text-[11px] text-slate-500">Adjust selected products' selling prices.</p></div><button type="button" onClick={() => setBulkMode(false)} aria-label="Close bulk adjustment" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X size={16} /></button></div>
          <div className="mt-5"><p className="text-xs font-medium text-slate-700">Selected products</p><p className="mt-1 text-xs text-slate-500">{selected.length} product(s)</p></div>
          <label className="mt-4 block text-xs font-medium text-slate-700">Price adjustment (%)<input type="number" value={bulkPercent} onChange={(event) => setBulkPercent(event.target.value)} min="-100" max="100" step="0.5" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-400" /></label>
          <p className="mt-2 text-[10px] text-slate-400">Positive values increase prices; negative values decrease them.</p>
          <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setBulkMode(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">Cancel</button><button type="button" disabled={selected.length === 0 || saving} onClick={applyBulkAdjustment} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : "Apply Adjustment"}</button></div>
        </div>
      </div>}
    </AdminLayout>
  );
}

function SummaryCard({ title, value, note, icon: Icon, iconStyle }) {
  return <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-2"><p className="text-xs font-medium text-slate-600">{title}</p><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}><Icon size={16} /></span></div><div className="mt-2"><p className="text-2xl font-bold tracking-tight text-slate-800">{value}</p></div><p className="mt-3 text-[10px] text-slate-500">{note}</p></div>;
}

function PaginationButton({ children, label, disabled, onClick }) {
  return <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="flex h-7 min-w-7 items-center justify-center rounded-md border border-slate-200 px-1 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">{children}</button>;
}

function PriceInput({ label, value, onChange }) {
  return <label className="block text-xs font-medium text-slate-700">{label}<input type="number" min="0" step="0.01" required value={value ?? 0} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-400" /></label>;
}
