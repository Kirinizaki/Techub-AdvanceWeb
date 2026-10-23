
import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  CalendarDays,
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
  LockKeyhole,
  ChartNoAxesColumnIncreasing,
  Settings,
  LogOut,
  House,
  ShoppingBag,
  UserRound,
  Boxes,
  X,
  Check,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";

const initialProducts = [
  {
    id: 1,
    sku: "ROG-RTX4070TIS-O16G",
    name: "ASUS ROG Strix RTX 4070 Ti SUPER",
    cost: 45000,
    selling: 58480,
    standard: 61300,
    margin: 27.1,
    rules: "None",
    category: "GPU",
  },
  {
    id: 2,
    sku: "AMD-AM5-100000910WOF",
    name: "AMD Ryzen 7 7800X3D",
    cost: 16800,
    selling: 24480,
    standard: 27490,
    margin: 31.4,
    rules: "3% Bundle",
    category: "CPU",
  },
  {
    id: 3,
    sku: "MSI-MAG-B650-TOMA",
    name: "MSI MAG B650 Tomahawk WiFi",
    cost: 11200,
    selling: 13890,
    standard: 14990,
    margin: 18.4,
    rules: "None",
    category: "Motherboard",
  },
  {
    id: 4,
    sku: "SAMS-LS49AG950NNXZA",
    name: 'Samsung Odyssey Neo G9 49"',
    cost: 72000,
    selling: 90280,
    standard: 94350,
    margin: 34.8,
    rules: "7.5% Off (2+)",
    category: "Monitor",
  },
  {
    id: 5,
    sku: "CMH32GX5M2B6000C30",
    name: "Corsair Vengeance RGB DDR5 32GB",
    cost: 6800,
    selling: 7480,
    standard: 7980,
    margin: 22.1,
    rules: "None",
    category: "RAM",
  },
  {
    id: 6,
    sku: "WD-BLACK-SN850X-1TB",
    name: "WD Black SN850X NVMe SSD 1TB",
    cost: 4200,
    selling: 5290,
    standard: 5990,
    margin: 20.6,
    rules: "None",
    category: "Storage",
  },
  {
    id: 7,
    sku: "LOG-G502-HERO",
    name: "Logitech G502 HERO Gaming Mouse",
    cost: 2100,
    selling: 2890,
    standard: 3290,
    margin: 27.3,
    rules: "5% Bundle",
    category: "Accessories",
  },
  {
    id: 8,
    sku: "COR-4000D-AIRFLOW",
    name: "Corsair 4000D Airflow Case",
    cost: 3900,
    selling: 4990,
    standard: 5490,
    margin: 21.8,
    rules: "None",
    category: "Accessories",
  },
];

const money = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("PHP", "₱");

const categories = [
  "All Categories",
  "GPU",
  "CPU",
  "Motherboard",
  "Monitor",
  "RAM",
  "Storage",
  "Accessories",
];

const marginOptions = [
  "All Margin Thresholds",
  "Below 20%",
  "20% - 30%",
  "Above 30%",
];

export default function AdminPriceManagement({ onLogout }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [marginFilter, setMarginFilter] = useState(
    "All Margin Thresholds"
  );
  const [page, setPage] = useState(1);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkPercent, setBulkPercent] = useState("5");
  const [message, setMessage] = useState("");

  const pageSize = 5;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query);

      const matchesCategory =
        category === "All Categories" ||
        product.category === category;

      let matchesMargin = true;

      if (marginFilter === "Below 20%") {
        matchesMargin = product.margin < 20;
      } else if (marginFilter === "20% - 30%") {
        matchesMargin =
          product.margin >= 20 && product.margin <= 30;
      } else if (marginFilter === "Above 30%") {
        matchesMargin = product.margin > 30;
      }

      return matchesSearch && matchesCategory && matchesMargin;
    });
  }, [products, search, category, marginFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const averageMargin =
    products.length > 0
      ? products.reduce((sum, product) => sum + product.margin, 0) /
        products.length
      : 0;

  const updateProduct = (event) => {
    event.preventDefault();

    const cost = Number(editingProduct.cost);
    const selling = Number(editingProduct.selling);
    const standard = Number(editingProduct.standard);

    if (
      !Number.isFinite(cost) ||
      !Number.isFinite(selling) ||
      !Number.isFinite(standard) ||
      cost <= 0 ||
      selling <= 0 ||
      standard <= 0
    ) {
      setMessage("Please enter valid prices greater than zero.");
      return;
    }

    const margin = ((selling - cost) / selling) * 100;

    setProducts((previous) =>
      previous.map((product) =>
        product.id === editingProduct.id
          ? {
              ...product,
              cost,
              selling,
              standard,
              margin: Number(margin.toFixed(1)),
            }
          : product
      )
    );

    setEditingProduct(null);
    setMessage("Product pricing updated successfully.");
  };

  const applyBulkAdjustment = () => {
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

    setProducts((previous) =>
      previous.map((product) => {
        if (!selected.includes(product.id)) return product;

        const selling = Math.round(
          product.selling * (1 + percentage / 100)
        );

        const margin =
          selling > 0
            ? ((selling - product.cost) / selling) * 100
            : 0;

        return {
          ...product,
          selling,
          margin: Number(margin.toFixed(1)),
        };
      })
    );

    setSelected([]);
    setBulkMode(false);
    setMessage("Bulk price adjustment applied.");
  };

  const toggleSelected = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = visibleProducts.map((product) => product.id);

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selected.includes(id));

    setSelected((previous) =>
      allSelected
        ? previous.filter((id) => !visibleIds.includes(id))
        : [...new Set([...previous, ...visibleIds])]
    );
  };

  const exportCSV = () => {
    const headers = [
      "SKU",
      "Product",
      "Category",
      "Cost",
      "Selling Price",
      "Standard Price",
      "Gross Margin",
      "Active Rules",
    ];

    const rows = filteredProducts.map((product) => [
      product.sku,
      product.name,
      product.category,
      product.cost,
      product.selling,
      product.standard,
      `${product.margin}%`,
      product.rules,
    ]);

    const escapeCSV = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

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
    <AdminLayout>
      <div className="min-h-full space-y-4 text-slate-800">
        {/* Page heading */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Price Management
              </h1>

              <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                Live &amp; Managed
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Full System Access • Manage MSRP, margin markups, wholesale
              rates, discounts, and promotional campaigns.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setBulkMode(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <SlidersHorizontal size={14} />
            Bulk Price Adjustment
          </button>
        </div>

        {/* Profile and pricing summary cards */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Average Gross Margin"
            value={`${averageMargin.toFixed(1)}%`}
            note="vs. previous cycle"
            detail="12.4%"
            icon={Percent}
            iconStyle="bg-emerald-50 text-emerald-600"
            valueStyle="text-slate-800"
          />

          <SummaryCard
            title="Active Promotions"
            value="12 Promos"
            note="Nearest ends in 4 days"
            action="View Details"
            icon={Tag}
            iconStyle="bg-indigo-50 text-indigo-600"
          />

          <SummaryCard
            title="Price Overrides"
            value="86 Items"
            note="Brands & VIP tiers applied"
            action="Manage"
            icon={CalendarDays}
            iconStyle="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            title="Pending Approvals"
            value="5 Items"
            note="Pending Super Admin review"
            action="Review Queue"
            icon={AlertTriangle}
            iconStyle="bg-rose-50 text-rose-600"
            valueStyle="text-rose-600"
            alert
          />
        </section>

        {/* Pricing matrix */}
        <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <h2 className="text-sm font-bold">
                Pricing Matrix &amp; SKU Overrides
              </h2>

              <p className="mt-0.5 text-[11px] text-slate-500">
                Manage product pricing, SKU-specific overrides, and bulk
                price adjustments.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportCSV}
                title="Export CSV"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-blue-600"
              >
                <Download size={14} />
              </button>

              <button
                type="button"
                onClick={() => setView("list")}
                title="List view"
                className={`rounded-lg border p-2 ${
                  view === "list"
                    ? "border-blue-100 bg-blue-50 text-blue-600"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <List size={14} />
              </button>

              <button
                type="button"
                onClick={() => setView("grid")}
                title="Grid view"
                className={`rounded-lg border p-2 ${
                  view === "grid"
                    ? "border-blue-100 bg-blue-50 text-blue-600"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-2 px-4 pb-4 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_auto]">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3">
              <Search size={14} className="shrink-0 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by SKU, code or product description..."
                className="min-w-0 flex-1 bg-transparent py-2.5 text-xs outline-none placeholder:text-slate-400"
                aria-label="Search products"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 pr-8 text-xs text-slate-600 outline-none focus:border-blue-300"
                aria-label="Filter by category"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                value={marginFilter}
                onChange={(event) => {
                  setMarginFilter(event.target.value);
                  setPage(1);
                }}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 pr-8 text-xs text-slate-600 outline-none focus:border-blue-300"
                aria-label="Filter by gross margin"
              >
                {marginOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <Filter
                size={13}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>

          {/* Desktop table view */}
          {view === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-200 text-left">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    <th className="w-9 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={
                          visibleProducts.length > 0 &&
                          visibleProducts.every((product) =>
                            selected.includes(product.id)
                          )
                        }
                        onChange={toggleAllVisible}
                        aria-label="Select all visible products"
                        className="accent-blue-600"
                      />
                    </th>
                    <th className="px-2 py-3">SKU &amp; Product Details</th>
                    <th className="px-3 py-3">Cost Basis</th>
                    <th className="px-3 py-3">Selling Price</th>
                    <th className="px-3 py-3">Standard MSRP</th>
                    <th className="px-3 py-3">Gross Margin</th>
                    <th className="px-3 py-3">Active Rules</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {visibleProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="transition hover:bg-blue-50/30"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(product.id)}
                          onChange={() => toggleSelected(product.id)}
                          aria-label={`Select ${product.name}`}
                          className="accent-blue-600"
                        />
                      </td>

                      <td className="px-2 py-3">
                        <div className="flex min-w-57.5 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                            <Package size={15} />
                          </span>

                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              {product.name}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              SKU - {product.sku}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">
                        {money(product.cost)}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-slate-800">
                        {money(product.selling)}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">
                        {money(product.standard)}
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                            product.margin < 20
                              ? "bg-rose-50 text-rose-600"
                              : product.margin > 30
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {product.margin.toFixed(1)}%
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-[10px] font-medium ${
                            product.rules === "None"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {product.rules}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct({ ...product });
                            setMessage("");
                          }}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-blue-700"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}

                  {visibleProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-12 text-center text-xs text-slate-500"
                      >
                        <Package
                          size={24}
                          className="mx-auto mb-2 text-slate-300"
                        />
                        No products match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid view */
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-slate-100 p-4 transition hover:border-blue-200 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Package size={15} />
                      </span>
                      <div>
                        <p className="text-xs font-semibold">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {product.sku}
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      onChange={() => toggleSelected(product.id)}
                      aria-label={`Select ${product.name}`}
                      className="accent-blue-600"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-400">
                        Cost Basis
                      </p>
                      <p className="mt-1 text-xs">{money(product.cost)}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400">
                        Selling Price
                      </p>
                      <p className="mt-1 text-xs font-semibold">
                        {money(product.selling)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400">
                        Standard MSRP
                      </p>
                      <p className="mt-1 text-xs">
                        {money(product.standard)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400">
                        Gross Margin
                      </p>
                      <p className="mt-1 text-xs font-semibold text-blue-600">
                        {product.margin.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...product })}
                    className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Update Pricing
                  </button>
                </div>
              ))}

              {visibleProducts.length === 0 && (
                <p className="col-span-full py-10 text-center text-xs text-slate-500">
                  No products match your filters.
                </p>
              )}
            </div>
          )}

          {/* Table footer and pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <p className="text-[10px] text-slate-500">
              Showing{" "}
              {filteredProducts.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              {" - "}
              {Math.min(currentPage * pageSize, filteredProducts.length)} of{" "}
              {filteredProducts.length} matching SKUs
            </p>

            <div className="flex items-center gap-1">
              <PaginationButton
                label="First page"
                disabled={currentPage === 1}
                onClick={() => setPage(1)}
              >
                <ChevronsLeft size={13} />
              </PaginationButton>

              <PaginationButton
                label="Previous page"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={13} />
              </PaginationButton>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                  (number) =>
                    number === 1 ||
                    number === totalPages ||
                    Math.abs(number - currentPage) <= 1
                )
                .map((number, index, numbers) => (
                  <span key={number} className="contents">
                    {index > 0 && numbers[index - 1] !== number - 1 && (
                      <span className="px-1 text-[10px] text-slate-400">
                        ...
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setPage(number)}
                      aria-label={`Page ${number}`}
                      aria-current={
                        number === currentPage ? "page" : undefined
                      }
                      className={`h-7 min-w-7 rounded-md px-2 text-[10px] font-medium ${
                        number === currentPage
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {number}
                    </button>
                  </span>
                ))}

              <PaginationButton
                label="Next page"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
              >
                <ChevronRight size={13} />
              </PaginationButton>

              <PaginationButton
                label="Last page"
                disabled={currentPage === totalPages}
                onClick={() => setPage(totalPages)}
              >
                <ChevronsRight size={13} />
              </PaginationButton>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1 pt-2 text-[10px] text-slate-400">
          <p>© 2026 TechHub Inc. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-3">
            <a href="#" className="hover:text-blue-600">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:text-blue-600">
              Terms of Service
            </a>
            <span>|</span>
            <a href="#" className="hover:text-blue-600">
              Support Center
            </a>
          </div>
        </footer>
      </div>

      {/* Update product modal */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditingProduct(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-pricing-title"
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="edit-pricing-title" className="text-sm font-bold">
                  Update Product Pricing
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  {editingProduct.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                aria-label="Close modal"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={updateProduct} className="mt-5 space-y-4">
              <PriceInput
                label="Cost Basis (₱)"
                value={editingProduct.cost}
                onChange={(value) =>
                  setEditingProduct((previous) => ({
                    ...previous,
                    cost: value,
                  }))
                }
              />

              <PriceInput
                label="Selling Price (₱)"
                value={editingProduct.selling}
                onChange={(value) =>
                  setEditingProduct((previous) => ({
                    ...previous,
                    selling: value,
                  }))
                }
              />

              <PriceInput
                label="Standard MSRP (₱)"
                value={editingProduct.standard}
                onChange={(value) =>
                  setEditingProduct((previous) => ({
                    ...previous,
                    standard: value,
                  }))
                }
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Check size={13} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk adjustment modal */}
      {bulkMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-pricing-title"
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="bulk-pricing-title" className="text-sm font-bold">
                  Bulk Price Adjustment
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  Adjust the selling prices of selected products.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setBulkMode(false)}
                aria-label="Close bulk adjustment"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium text-slate-700">
                Selected products
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {selected.length} product(s)
              </p>
            </div>

            <label className="mt-4 block text-xs font-medium text-slate-700">
              Price adjustment (%)
              <input
                type="number"
                value={bulkPercent}
                onChange={(event) => setBulkPercent(event.target.value)}
                min="-100"
                max="100"
                step="0.5"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-400"
              />
            </label>

            <p className="mt-2 text-[10px] text-slate-400">
              Positive values increase prices. Negative values decrease them.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBulkMode(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={selected.length === 0}
                onClick={applyBulkAdjustment}
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback message */}
      {message && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-60 flex max-w-sm items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg"
        >
          <span className="flex-1 text-slate-700">{message}</span>
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
            className="text-slate-400 hover:text-slate-700"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </AdminLayout>
  );
}

function SummaryCard({
  title,
  value,
  note,
  detail,
  action,
  icon: Icon,
  iconStyle,
  valueStyle = "text-slate-800",
  alert = false,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-600">{title}</p>

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}
        >
          <Icon size={16} />
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className={`text-2xl font-bold tracking-tight ${valueStyle}`}>
          {value}
        </p>

        {detail && (
          <span className="rounded-md bg-emerald-50 px-1.5 py-1 text-[10px] font-semibold text-emerald-600">
            ↗ {detail}
          </span>
        )}

        {alert && (
          <span className="rounded-md bg-rose-50 px-1.5 py-1 text-[10px] font-medium text-rose-600">
            Action Req.
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] text-slate-500">{note}</p>

        {action && (
          <button
            type="button"
            onClick={() => {}}
            className="text-[10px] font-medium text-blue-600 hover:text-blue-800"
          >
            {action} →
          </button>
        )}
      </div>
    </div>
  );
}

function PaginationButton({ children, label, disabled, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 min-w-7 items-center justify-center rounded-md border border-slate-200 px-1 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function PriceInput({ label, value, onChange }) {
  return (
    <label className="block text-xs font-medium text-slate-700">
      {label}
      <input
        type="number"
        min="0.01"
        step="0.01"
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-400"
      />
    </label>
  );
}
