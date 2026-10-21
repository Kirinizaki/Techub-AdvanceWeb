
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  Banknote,
  BellRing,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
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
    <div className="min-w-0 rounded-lg border border-slate-100 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${color}`}>
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
      <span className="inline-flex rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600">
        Out of Stock
      </span>
    );
  }

  if (stock <= Math.max(2, Math.floor(reorder / 2))) {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700">
        Critical Low
      </span>
    );
  }

  if (stock <= reorder) {
    return (
      <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-semibold text-indigo-700">
        Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
      ● Optimal
    </span>
  );
}

export default function AdminInventoryManagement() {
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

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
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
          ? { ...row, stock: row.stock + Math.max(row.reorder * 2, 10) }
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

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Inventory CSV exported.");
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f4f7ff] p-4 text-slate-800 sm:p-5">
        {/* Page heading */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
              Product Management / Inventory Operations
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              Inventory Management &amp; SKU
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Full System Access · Monitor warehouse stock levels, SKU tracking,
              replenishment triggers, and transfer logs.
            </p>
          </div>

          <button
            onClick={() => setNotice("Create Stock Order is a demo action.")}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={14} />
            Create Stock Order
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Units in Stock"
            value={totalUnits.toLocaleString()}
            detail="Across all listed warehouse SKUs"
            icon={Warehouse}
            color="bg-blue-100 text-blue-700"
          />
          <StatCard
            title="Low Stock Critical"
            value={`${lowStock} SKUs`}
            detail="Below or near reorder point"
            icon={AlertTriangle}
            color="bg-red-100 text-red-600"
          />
          <StatCard
            title="Out of Stock SKUs"
            value={`${outOfStock} SKUs`}
            detail="Requires immediate replenishment"
            icon={Package}
            color="bg-indigo-100 text-indigo-700"
          />
          <StatCard
            title="Total Inventory Value"
            value={money(inventoryValue)}
            detail="Estimated value at unit cost"
            icon={Banknote}
            color="bg-emerald-100 text-emerald-700"
          />
        </div>

        {/* Low stock alert */}
        {lowStock + outOfStock > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-100/80 p-3">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-red-600">
                <BellRing size={15} />
              </span>
              <div>
                <p className="text-xs font-bold text-red-800">
                  Low Stock Safety Stock Trigger Activated
                </p>
                <p className="mt-1 text-[11px] text-red-700">
                  {lowStock + outOfStock} products need attention. Review stock
                  levels and restock where necessary.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSearch("");
                setWarehouse("All Warehouses");
                setPage(1);
                setNotice("Showing all inventory items for stock review.");
              }}
              className="rounded-md bg-red-700 px-3 py-2 text-[11px] font-semibold text-white hover:bg-red-800"
            >
              Review Stock
            </button>
          </div>
        )}

        {notice && (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              className="font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Inventory panel */}
        <section className="overflow-hidden rounded-lg border border-slate-100 bg-white">
          {/* Warehouse tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-3">
            <div className="flex flex-wrap gap-1">
              {warehouses.map((item) => (
                <button
                  key={item}
                  onClick={() => changeWarehouse(item)}
                  className={`rounded-md px-3 py-2 text-[10px] font-medium ${
                    warehouse === item
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotice("Filter options are shown through the search and warehouse tabs.")}
                className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                title="Filter inventory"
              >
                <Filter size={14} />
              </button>
              <button
                onClick={exportInventory}
                className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                title="Export CSV"
              >
                <ArrowDownToLine size={14} />
              </button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-slate-200 px-3 py-2 sm:max-w-md">
              <Search size={14} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by SKU, product, or category..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={() => {
                setSearch("");
                setWarehouse("All Warehouses");
                setPage(1);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
            >
              <SlidersHorizontal size={13} />
              Reset Filters
            </button>
          </div>

          {/* Inventory table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead className="bg-slate-50">
                <tr className="border-y border-slate-100">
                  {[
                    "SKU CODE",
                    "PRODUCT NAME & SPEC",
                    "WAREHOUSE LOCATION",
                    "IN STOCK",
                    "RESERVED",
                    "AVAILABLE",
                    "REORDER POINT",
                    "STATUS",
                    "QUICK ACTION",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-3 py-3 text-[10px] font-semibold text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleRows.map((item, index) => {
                  const available = Math.max(0, item.stock - item.reserved);

                  return (
                    <tr
                      key={item.sku}
                      className={`border-b border-slate-100 ${
                        item.stock === 0
                          ? "bg-red-50/60"
                          : index % 2 === 0
                            ? "bg-white"
                            : "bg-slate-50/50"
                      }`}
                    >
                      <td className="px-3 py-4">
                        <span className="rounded-sm bg-indigo-100 px-1.5 py-1 text-[10px] font-semibold text-indigo-800">
                          {item.sku}
                        </span>
                      </td>

                      <td className="max-w-[220px] px-3 py-4">
                        <p className="text-xs font-semibold text-slate-800">
                          {item.name}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {item.spec}
                        </p>
                      </td>

                      <td className="px-3 py-4">
                        <p className="text-xs text-slate-700">
                          {item.warehouse}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                          <MapPin size={10} />
                          {item.location}
                        </p>
                      </td>

                      <td className="px-3 py-4 text-center text-xs font-semibold">
                        {item.stock}
                      </td>

                      <td className="px-3 py-4 text-center text-xs text-slate-600">
                        {item.reserved}
                      </td>

                      <td
                        className={`px-3 py-4 text-center text-xs font-bold ${
                          available <= item.reorder
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {available}
                      </td>

                      <td className="px-3 py-4 text-center text-xs text-slate-600">
                        {item.reorder}
                      </td>

                      <td className="px-3 py-4">
                        <StockStatus stock={item.stock} reorder={item.reorder} />
                      </td>

                      <td className="px-3 py-4">
                        <button
                          onClick={() => restockItem(item)}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-semibold text-white ${
                            item.stock === 0
                              ? "bg-red-700 hover:bg-red-800"
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
                      className="px-4 py-12 text-center text-xs text-slate-500"
                    >
                      No inventory items match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-3 py-3">
            <p className="text-[10px] text-slate-500">
              Showing{" "}
              {filteredRows.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              {"–"}
              {Math.min(currentPage * pageSize, filteredRows.length)} of{" "}
              {filteredRows.length} SKUs
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded border border-slate-200 p-1.5 text-slate-500 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={13} />
              </button>

              {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => setPage(number)}
                    className={`min-w-7 rounded px-2 py-1.5 text-[10px] ${
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
                className="rounded border border-slate-200 p-1.5 text-slate-500 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* Page footer */}
        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[10px] text-slate-500">
          <p>© 2026 TechHub Inc. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Privacy Policy</span>
            <span className="text-slate-300">|</span>
            <span>Terms of Service</span>
            <span className="text-slate-300">|</span>
            <span>Support Center</span>
          </div>
        </footer>
      </div>
    </AdminLayout>
  );
}
