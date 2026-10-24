import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  Cpu,
  Download,
  FileSpreadsheet,
  MemoryStick,
  Monitor,
  RotateCcw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { supabase } from "../../lib/supabaseClient";

/* -------------------- HELPERS -------------------- */

const RANGE_OPTIONS = [
  "Year to Date",
  "Last 12 Months",
  "Last 6 Months",
  "Last 30 Days",
];

function getRange(label) {
  const now = new Date();
  const to = new Date(now.getTime() + 60_000);
  let from;

  if (label === "Last 30 Days") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
  } else if (label === "Last 6 Months") {
    from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  } else if (label === "Last 12 Months") {
    from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  } else {
    from = new Date(now.getFullYear(), 0, 1);
  }
  return { from, to };
}

function monthKeys(from, to) {
  const keys = [];
  const d = new Date(from.getFullYear(), from.getMonth(), 1);
  while (d <= to) {
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() + 1);
  }
  return keys;
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  const name = new Date(y, m - 1, 1).toLocaleString("en-PH", { month: "short" });
  return y === new Date().getFullYear() ? name : `${name} '${String(y).slice(2)}`;
}

const compact = (n) => {
  const v = Number(n || 0);
  if (v >= 1_000_000) return `₱${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `₱${Math.round(v / 1_000)}K`;
  return `₱${Math.round(v)}`;
};

const peso = (n) =>
  `₱${Number(n || 0).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;

const pctChange = (cur, prev) =>
  prev > 0 ? ((cur - prev) / prev) * 100 : null;

const fmtChange = (p) =>
  p === null ? null : `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`;

function niceMax(v) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / p) * p;
}

const BAR_COLORS = [
  "bg-blue-600",
  "bg-blue-500",
  "bg-emerald-700",
  "bg-slate-500",
  "bg-slate-400",
  "bg-indigo-500",
];

function iconFor(category = "") {
  const c = category.toLowerCase();
  if (c.includes("ram") || c.includes("memory") || c.includes("storage"))
    return MemoryStick;
  if (c.includes("cpu") || c.includes("processor") || c.includes("motherboard"))
    return Cpu;
  return Monitor;
}

/* -------------------- SUMMARY CARD -------------------- */

function SummaryCard({
  label,
  value,
  change,
  positive = true,
  description,
  icon: Icon,
  iconStyle = "bg-blue-50 text-blue-600",
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}
        >
          <Icon size={15} />
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <div className="mt-2 flex min-h-5 flex-wrap items-center gap-1.5">
        {change && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              positive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {change}
          </span>
        )}
        <span className="text-[10px] text-slate-500">{description}</span>
      </div>
    </div>
  );
}

/* -------------------- REVENUE CHART -------------------- */

function RevenueChart({ months }) {
  const [hovered, setHovered] = useState(null);

  const max = niceMax(Math.max(0, ...months.map((m) => m.revenue)));
  const peak = months.reduce(
    (best, m) => (m.revenue > best.revenue ? m : best),
    { revenue: 0, key: null }
  );
  const latest = months[months.length - 1];
  const average = months.length
    ? months.reduce((s, m) => s + m.revenue, 0) / months.length
    : 0;

  return (
    <section className="flex min-w-0 flex-col rounded-xl bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Monthly Revenue</h2>
        <p className="mt-1 text-[11px] text-slate-500">
          Paid orders only, grouped by order month
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-blue-50/80 p-3">
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500">Peak Month</p>
          <p className="mt-1 text-xs font-bold text-blue-700">
            {peak.key ? monthLabel(peak.key) : "—"}{" "}
            <span className="text-[10px]">{compact(peak.revenue)}</span>
          </p>
        </div>

        <div className="min-w-0 border-x border-blue-100 px-2 sm:px-3">
          <p className="text-[10px] text-slate-500">Latest Month</p>
          <p className="mt-1 text-xs font-bold text-emerald-700">
            {latest ? compact(latest.revenue) : "—"}
          </p>
          <p className="text-[10px] text-slate-500">
            {latest ? `${monthLabel(latest.key)} (in progress)` : ""}
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-[10px] text-slate-500">Monthly Average</p>
          <p className="mt-1 text-xs font-bold text-slate-800">
            {compact(average)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[38px_minmax(0,1fr)] gap-2">
        <div className="flex h-36 flex-col justify-between pb-5 pt-0.5 text-right text-[9px] text-slate-400">
          <span>{compact(max)}</span>
          <span>{compact((max * 2) / 3)}</span>
          <span>{compact(max / 3)}</span>
          <span>₱0</span>
        </div>

        <div className="relative h-36 min-w-0">
          <div className="absolute inset-0 flex flex-col justify-between pb-5">
            {[0, 1, 2, 3].map((line) => (
              <div
                key={line}
                className="w-full border-t border-dashed border-slate-100"
              />
            ))}
          </div>

          <div className="absolute inset-0 flex items-end justify-around gap-1 pb-5">
            {months.map((m, index) => (
              <button
                key={m.key}
                type="button"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                aria-label={`${monthLabel(m.key)}: ${peso(m.revenue)}`}
                className="group relative flex h-full min-w-0 flex-1 items-end justify-center outline-none"
              >
                {hovered === index && (
                  <span className="absolute bottom-[calc(100%-1.5rem)] z-10 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] text-white shadow">
                    {monthLabel(m.key)}: {peso(m.revenue)} · {m.orders} orders
                  </span>
                )}

                <span
                  className={`w-full max-w-5 rounded-t-sm transition-colors ${
                    index === months.length - 1
                      ? "bg-emerald-700"
                      : "bg-blue-700 group-hover:bg-blue-500"
                  }`}
                  style={{ height: `${(m.revenue / max) * 100}%` }}
                />
              </button>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-around gap-1">
            {months.map((m) => (
              <span
                key={m.key}
                className="min-w-0 flex-1 truncate text-center text-[9px] text-slate-400"
              >
                {monthLabel(m.key)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------- CATEGORY CARD -------------------- */

function CategoryCard({ categories }) {
  const total = categories.reduce((s, c) => s + c.revenue, 0);

  return (
    <section className="flex min-w-0 flex-col rounded-xl bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-sm font-bold text-slate-900">
          Revenue by Product Category
        </h2>
        <p className="mt-1 text-[11px] text-slate-500">
          Share of paid line-item revenue
        </p>
      </div>

      <div className="mt-4 flex-1 space-y-3">
        {categories.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-400">
            No category sales in this range.
          </p>
        )}

        {categories.slice(0, 6).map((category, i) => {
          const percent = total > 0 ? Math.round((category.revenue / total) * 100) : 0;
          const color = BAR_COLORS[i % BAR_COLORS.length];

          return (
            <div key={category.name}>
              <div className="flex items-center justify-between gap-2">
                <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
                  <span className="truncate">{category.name}</span>
                </p>

                <p className="shrink-0 text-[10px] font-semibold text-slate-700">
                  {compact(category.revenue)}
                  <span className="ml-1 text-slate-400">{percent}%</span>
                </p>
              </div>

              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${color}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------- MAIN PAGE -------------------- */

export default function AdminReportsAnalytics({ onLogout }) {
  const [dateRange, setDateRange] = useState("Year to Date");
  const [sortBy, setSortBy] = useState("By Revenue");
  const [showDateOptions, setShowDateOptions] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    setLoading(true);
    setError("");

    const { from, to } = getRange(dateRange);
    const { data, error: rpcError } = await supabase.rpc("admin_sales_report", {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
    });

    if (rpcError) {
      setError(rpcError.message);
      setReport(null);
    } else {
      setReport(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const summary = report?.summary;

  const months = useMemo(() => {
    const { from, to } = getRange(dateRange);
    const byKey = new Map((report?.monthly ?? []).map((m) => [m.month, m]));
    return monthKeys(from, to).map((key) => ({
      key,
      revenue: Number(byKey.get(key)?.revenue ?? 0),
      orders: Number(byKey.get(key)?.orders ?? 0),
    }));
  }, [report, dateRange]);

  const categories = useMemo(
    () =>
      (report?.categories ?? []).map((c) => ({
        ...c,
        revenue: Number(c.revenue),
        units: Number(c.units),
      })),
    [report]
  );

  const sortedProducts = useMemo(() => {
    const list = (report?.top_products ?? []).map((p) => ({
      ...p,
      revenue: Number(p.revenue),
      units: Number(p.units),
    }));
    list.sort((a, b) =>
      sortBy === "By Units" ? b.units - a.units : b.revenue - a.revenue
    );
    return list.slice(0, 5);
  }, [report, sortBy]);

  const grossRevenue = Number(summary?.gross_revenue ?? 0);
  const orderCount = Number(summary?.order_count ?? 0);
  const aov = orderCount > 0 ? grossRevenue / orderCount : 0;
  const prevRevenue = Number(summary?.prev_gross_revenue ?? 0);
  const prevCount = Number(summary?.prev_order_count ?? 0);
  const prevAov = prevCount > 0 ? prevRevenue / prevCount : 0;
  const settled = Number(summary?.settled_count ?? 0);
  const refunded = Number(summary?.refunded_count ?? 0);
  const refundRate = settled > 0 ? (refunded / settled) * 100 : 0;

  const revChange = pctChange(grossRevenue, prevRevenue);
  const countChange = pctChange(orderCount, prevCount);
  const aovChange = pctChange(aov, prevAov);

  function download(csv, filename) {
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const toCsv = (rows) =>
    rows
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

  function exportSkus() {
    const rows = [
      ["Rank", "Product", "SKU", "Category", "Units Sold", "Revenue"],
      ...(report?.top_products ?? []).map((p, i) => [
        i + 1, p.name, p.sku, p.category, p.units, p.revenue,
      ]),
    ];
    download(toCsv(rows), "techhub-sku-sales.csv");
  }

  function exportReport() {
    const rows = [
      ["TechHub Sales Report", dateRange],
      [],
      ["Summary"],
      ["Gross Revenue (paid)", grossRevenue],
      ["Paid Orders", orderCount],
      ["Average Order Value", Math.round(aov)],
      ["Refunded Orders", refunded],
      ["Refund Rate %", refundRate.toFixed(2)],
      [],
      ["Month", "Revenue", "Orders"],
      ...months.map((m) => [monthLabel(m.key), m.revenue, m.orders]),
      [],
      ["Category", "Revenue", "Units"],
      ...categories.map((c) => [c.name, c.revenue, c.units]),
      [],
      ["Rank", "Product", "SKU", "Category", "Units Sold", "Revenue"],
      ...(report?.top_products ?? []).map((p, i) => [
        i + 1, p.name, p.sku, p.category, p.units, p.revenue,
      ]),
    ];
    download(toCsv(rows), "techhub-sales-report.csv");
  }

  const empty = !loading && !error && orderCount === 0;

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="w-full min-w-0 space-y-4 text-slate-800">
        {/* Page heading */}
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reports &amp; Analytics
            </h1>
            <p className="mt-1 max-w-xl text-xs text-slate-500">
              Sales performance from paid orders: revenue, top-selling
              hardware, and category mix.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDateOptions((open) => !open)}
                aria-expanded={showDateOptions}
                className="flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <CalendarDays size={13} className="shrink-0 text-blue-600" />
                <span>{dateRange}</span>
                <ChevronDown
                  size={12}
                  className={`shrink-0 transition-transform ${
                    showDateOptions ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showDateOptions && (
                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                  {RANGE_OPTIONS.map((range) => (
                    <button
                      type="button"
                      key={range}
                      onClick={() => {
                        setDateRange(range);
                        setShowDateOptions(false);
                      }}
                      className={`w-full rounded-md px-3 py-2 text-left text-xs hover:bg-blue-50 ${
                        dateRange === range
                          ? "font-semibold text-blue-700"
                          : "text-slate-600"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={exportReport}
              disabled={loading || !report}
              className="flex min-h-9 items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              <Download size={13} />
              <span>Export Report (CSV)</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
            <span>
              Could not load the report: {error}
              {/could not find the function/i.test(error) &&
                " Run admin_sales_report.sql in the Supabase SQL Editor first."}
            </span>
            <button onClick={loadReport} className="shrink-0 font-semibold hover:underline">
              Retry
            </button>
          </div>
        )}

        {empty && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            No paid orders in this range. Revenue only counts orders where COD
            collection has been recorded. If paid orders exist, your staff
            account may lack read access (RLS) to orders.
          </div>
        )}

        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Gross Revenue"
            value={loading ? "…" : peso(grossRevenue)}
            change={fmtChange(revChange)}
            positive={(revChange ?? 0) >= 0}
            description="vs previous period"
            icon={Wallet}
          />

          <SummaryCard
            label="Paid Orders"
            value={loading ? "…" : orderCount.toLocaleString()}
            change={fmtChange(countChange)}
            positive={(countChange ?? 0) >= 0}
            description="vs previous period"
            icon={ClipboardCheck}
            iconStyle="bg-emerald-50 text-emerald-700"
          />

          <SummaryCard
            label="Average Order Value (AOV)"
            value={loading ? "…" : peso(aov)}
            change={fmtChange(aovChange)}
            positive={(aovChange ?? 0) >= 0}
            description="vs previous period"
            icon={ShoppingCart}
            iconStyle="bg-indigo-50 text-indigo-700"
          />

          <SummaryCard
            label="Return / Refund Rate"
            value={loading ? "…" : `${refundRate.toFixed(1)}%`}
            change={loading ? null : `${refunded} refunded`}
            positive={refunded === 0}
            description={`of ${settled} settled orders`}
            icon={RotateCcw}
            iconStyle="bg-slate-100 text-slate-600"
          />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[1.65fr_1fr]">
          <RevenueChart months={months} />
          <CategoryCard categories={categories} />
        </section>

        {/* Top products */}
        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">
                Top 5 Performing SKUs
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Ranked by paid line-item revenue or units sold
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-50 p-1">
              {["By Revenue", "By Units"].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setSortBy(option)}
                  aria-pressed={sortBy === option}
                  className={`whitespace-nowrap rounded-md px-2 py-1.5 text-[10px] font-semibold transition-colors ${
                    sortBy === option
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-190 table-fixed text-left">
              <colgroup>
                <col className="w-[7%]" />
                <col className="w-[33%]" />
                <col className="w-[20%]" />
                <col className="w-[13%]" />
                <col className="w-[15%]" />
                <col className="w-[12%]" />
              </colgroup>

              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-3 py-3">Hardware Model</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3 text-right">Units Sold</th>
                  <th className="px-3 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right">Share</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-slate-500">
                      Loading report…
                    </td>
                  </tr>
                )}

                {!loading && sortedProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-slate-500">
                      No product sales in this range.
                    </td>
                  </tr>
                )}

                {!loading &&
                  sortedProducts.map((product, i) => {
                    const Icon = iconFor(product.category);
                    const share =
                      grossRevenue > 0
                        ? ((product.revenue / grossRevenue) * 100).toFixed(1)
                        : "0.0";

                    return (
                      <tr
                        key={product.sku ?? product.name}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-blue-700">
                            #{i + 1}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                              <Icon size={14} />
                            </span>
                            <div className="min-w-0">
                              <p className="wrap-break-word text-xs font-bold text-slate-800">
                                {product.name}
                              </p>
                              <p className="mt-0.5 break-all text-[10px] text-slate-500">
                                SKU: {product.sku}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <span className="inline-flex whitespace-nowrap rounded-full bg-blue-100 px-2 py-1 text-[10px] font-medium text-blue-700">
                            {product.category}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-right text-xs font-semibold text-slate-700">
                          {product.units.toLocaleString()} units
                        </td>

                        <td className="px-3 py-3 text-right text-xs font-bold text-slate-800">
                          {peso(product.revenue)}
                        </td>

                        <td className="px-4 py-3 text-right text-xs font-semibold text-emerald-700">
                          {share}%
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
            <p className="text-[10px] text-slate-500">
              Showing top 5 of {Number(summary?.active_skus ?? 0)} active catalog SKUs
            </p>

            <button
              type="button"
              onClick={exportSkus}
              disabled={loading || !report}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-700 hover:text-blue-800 disabled:opacity-50"
            >
              <FileSpreadsheet size={12} />
              Download SKU Sales (CSV)
              <Download size={11} />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-5 py-3 text-[10px] text-slate-500 shadow-sm">
          <p>© 2026 TechHub Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
            <span className="text-slate-300">|</span>
            <a href="#" className="hover:text-blue-600">Terms of Service</a>
            <span className="text-slate-300">|</span>
            <a href="#" className="hover:text-blue-600">Support Center</a>
          </div>
        </footer>
      </div>
    </AdminLayout>
  );
}
