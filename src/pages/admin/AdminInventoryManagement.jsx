
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  Banknote,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  Package,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Warehouse,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";

const inventoryData = [
  {
    sku: "SKU-GPU-4770TI-OC",
    name: "ASUS ROG Strix RTX 4070 Ti SUPER",
    spec: "16GB GDDR6X · Triple Fan",
    category: "GPU",
    warehouse: "Manila Central",
    location: "Central · Bay 4B",
    stock: 14,
    reserved: 4,
    reorder: 5,
    cost: 48500,
  },
  {
    sku: "SKU-CPU-7800X3D",
    name: "AMD Ryzen 7 7800X3D",
    spec: "8-Core · 4.2GHz · AM5 Socket",
    category: "CPU",
    warehouse: "Manila Central",
    location: "Central · Bay 2A",
    stock: 28,
    reserved: 6,
    reorder: 10,
    cost: 19200,
  },
  {
    sku: "SKU-MB-B650-TUF",
    name: "MSI MAG B650 Tomahawk WiFi",
    spec: "ATX Gaming Motherboard · DDR5",
    category: "Motherboard",
    warehouse: "Manila Central",
    location: "Central · Bay 3C",
    stock: 9,
    reserved: 5,
    reorder: 8,
    cost: 11200,
  },
  {
    sku: "SKU-MON-G9-49",
    name: "Samsung Odyssey Neo G9 49″",
    spec: "49″ DQHD · 240Hz · Curved",
    category: "Monitor",
    warehouse: "Quezon City",
    location: "QC Distribution · Bay 12",
    stock: 4,
    reserved: 2,
    reorder: 5,
    cost: 72000,
  },
  {
    sku: "SKU-CASE-O11D",
    name: "Lian Li O11 Dynamic EVO",
    spec: "Black Chassis · Dual-Chamber",
    category: "Case",
    warehouse: "Cebu Logistics Hub",
    location: "Cebu Hub · Bay 1",
    stock: 0,
    reserved: 0,
    reorder: 6,
    cost: 6500,
  },
  {
    sku: "SKU-CASE-RM850X",
    name: "Corsair RM850x Gold Modular",
    spec: "850W ATX 3.0 · 80 PLUS Gold",
    category: "PSU",
    warehouse: "Cebu Logistics Hub",
    location: "Cebu Hub · Bay 2",
    stock: 3,
    reserved: 1,
    reorder: 5,
    cost: 5890,
  },
  {
    sku: "SKU-RAM-DDR5-32",
    name: "Kingston Fury Beast DDR5",
    spec: "32GB · 6000MHz · Dual Channel",
    category: "RAM",
    warehouse: "Manila Central",
    location: "Central · Bay 5A",
    stock: 18,
    reserved: 3,
    reorder: 6,
    cost: 4200,
  },
];

const warehouses = [
  "All Warehouses",
  "Manila Central",
  "Quezon City",
  "Cebu Logistics Hub",
];

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

function StockStatus({ stock, reorder }) {
  if (stock === 0) {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600">
        Out of Stock
      </span>
    );
  }

  if (stock <= Math.max(2, Math.floor(reorder / 2))) {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700">
        Critical Low
      </span>
    );
  }

  if (stock <= reorder) {
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

export default function AdminInventoryManagement({onLogout}) {
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("All Warehouses");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [stockRows, setStockRows] = useState(inventoryData);

  const pageSize = 6;

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return stockRows.filter((item) => {
      const matchesWarehouse =
        warehouse === "All Warehouses" || item.warehouse === warehouse;

      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term);

      return matchesWarehouse && matchesSearch;
    });
  }, [search, warehouse, stockRows]);

  const totalUnits = stockRows.reduce((sum, item) => sum + item.stock, 0);

  const lowStock = stockRows.filter(
    (item) => item.stock > 0 && item.stock <= item.reorder
  ).length;

  const outOfStock = stockRows.filter((item) => item.stock === 0).length;

  const inventoryValue = stockRows.reduce(
    (sum, item) => sum + item.stock * item.cost,
    0
  );

  const pageCount = Math.max(
    1,
    Math.ceil(filteredRows.length / pageSize)
  );

  const currentPage = Math.min(page, pageCount);

  const visibleRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function changeWarehouse(value) {
    setWarehouse(value);
    setPage(1);
  }

  function restockItem(item) {
    setStockRows((rows) =>
      rows.map((row) =>
        row.sku === item.sku
          ? {
              ...row,
              stock: row.stock + Math.max(row.reorder * 2, 10),
            }
          : row
      )
    );

    setNotice(`${item.name} restocked in this demo.`);
  }

  function exportInventory() {
    const header = [
      "SKU",
      "Product",
      "Warehouse",
      "Stock",
      "Reserved",
      "Available",
      "Reorder Point",
      "Unit Cost",
    ];

    const rows = filteredRows.map((item) => [
      item.sku,
      item.name,
      item.warehouse,
      item.stock,
      item.reserved,
      Math.max(0, item.stock - item.reserved),
      item.reorder,
      item.cost,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

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
    setWarehouse("All Warehouses");
    setPage(1);
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="w-full min-w-0 text-slate-800">
        {/* Page heading */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              Inventory Management &amp; SKU
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Full System Access · Monitor warehouse stock levels, SKU
              tracking, replenishment triggers, and transfer logs.
            </p>
          </div>

          <button
            onClick={() =>
              setNotice("Create Stock Order is a demo action.")
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={14} />
            Create Stock Order
          </button>
        </div>

        {/* Summary cards */}
        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Units in Stock"
            value={totalUnits.toLocaleString()}
            detail="Across all listed warehouse SKUs"
            icon={Warehouse}
            color="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Low Stock Critical"
            value={`${lowStock} SKUs`}
            detail="Below or near reorder point"
            icon={AlertTriangle}
            color="bg-rose-50 text-rose-600"
          />

          <StatCard
            title="Out of Stock SKUs"
            value={`${outOfStock} SKUs`}
            detail="Requires immediate replenishment"
            icon={Package}
            color="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            title="Total Inventory Value"
            value={money(inventoryValue)}
            detail="Estimated value at unit cost"
            icon={Banknote}
            color="bg-emerald-50 text-emerald-600"
          />
        </section>

        {/* Low stock alert */}
        {lowStock + outOfStock > 0 && (
          <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600">
                <BellRing size={15} />
              </span>

              <div>
                <p className="text-xs font-bold text-rose-800">
                  Low Stock Safety Stock Trigger Activated
                </p>

                <p className="mt-1 text-[11px] text-rose-700">
                  {lowStock + outOfStock} products need attention. Review
                  stock levels and restock where necessary.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                resetFilters();
                setNotice(
                  "Showing all inventory items for stock review."
                );
              }}
              className="rounded-lg bg-rose-700 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-800"
            >
              Review Stock
            </button>
          </section>
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
          {/* Panel heading and actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <h2 className="text-sm font-bold">Inventory Overview</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Monitor SKU quantities, warehouse locations, and stock
                availability.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setNotice(
                    "Filter inventory using the warehouse tabs and search."
                  )
                }
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Filter size={13} />
                Filters
              </button>

              <button
                onClick={exportInventory}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <ArrowDownToLine size={13} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Warehouse tabs */}
          <div className="flex flex-wrap items-center gap-2 border-y border-slate-100 px-4 py-3">
            {warehouses.map((item) => (
              <button
                key={item}
                onClick={() => changeWarehouse(item)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${
                  warehouse === item
                    ? "bg-blue-700 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Search and filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
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

            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <SlidersHorizontal size={13} />
              Reset Filters
            </button>
          </div>

          {/* Inventory table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-237.5 border-collapse text-left">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {[
                    "SKU Code",
                    "Product Name & Spec",
                    "Warehouse Location",
                    "In Stock",
                    "Reserved",
                    "Available",
                    "Reorder Point",
                    "Status",
                    "Quick Action",
                  ].map((heading) => (
                    <th key={heading} className="px-3 py-3">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleRows.map((item) => {
                  const available = Math.max(
                    0,
                    item.stock - item.reserved
                  );

                  return (
                    <tr
                      key={item.sku}
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

                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {item.spec}
                        </p>
                      </td>

                      <td className="px-3 py-3">
                        <p className="text-xs text-slate-700">
                          {item.warehouse}
                        </p>

                        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                          <MapPin size={10} />
                          {item.location}
                        </p>
                      </td>

                      <td className="px-3 py-3 text-center text-xs font-semibold">
                        {item.stock}
                      </td>

                      <td className="px-3 py-3 text-center text-xs text-slate-600">
                        {item.reserved}
                      </td>

                      <td
                        className={`px-3 py-3 text-center text-xs font-bold ${
                          available <= item.reorder
                            ? "text-rose-600"
                            : "text-blue-600"
                        }`}
                      >
                        {available}
                      </td>

                      <td className="px-3 py-3 text-center text-xs text-slate-600">
                        {item.reorder}
                      </td>

                      <td className="px-3 py-3">
                        <StockStatus
                          stock={item.stock}
                          reorder={item.reorder}
                        />
                      </td>

                      <td className="px-3 py-3">
                        <button
                          onClick={() => restockItem(item)}
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-white ${
                            item.stock === 0
                              ? "bg-rose-700 hover:bg-rose-800"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          <RotateCcw size={11} />
                          Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {visibleRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-xs text-slate-500"
                    >
                      No inventory items match your search.
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
              {filteredRows.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              {"–"}
              {Math.min(
                currentPage * pageSize,
                filteredRows.length
              )}{" "}
              of {filteredRows.length} SKUs
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setPage((value) => Math.max(1, value - 1))
                }
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={13} />
              </button>

              {Array.from(
                { length: pageCount },
                (_, index) => index + 1
              ).map((number) => (
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
              ))}

              <button
                disabled={currentPage === pageCount}
                onClick={() =>
                  setPage((value) =>
                    Math.min(pageCount, value + 1)
                  )
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
