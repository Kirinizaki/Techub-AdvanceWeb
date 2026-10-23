
import { useState } from "react";
import {
  CalendarDays,
  Download,
  Wallet,
  ChartNoAxesCombined,
  ShoppingCart,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  Monitor,
  Cpu,
  MemoryStick,
  ChevronDown,
  ChartColumnIncreasing,
  CircleHelp,
  FileSpreadsheet,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";

/* -------------------- STATIC DATA -------------------- */

const revenueData = [
  { month: "Jan", revenue: 45 },
  { month: "Feb", revenue: 49 },
  { month: "Mar", revenue: 55 },
  { month: "Apr", revenue: 59 },
  { month: "May", revenue: 62 },
  { month: "Jun", revenue: 67 },
  { month: "Jul", revenue: 72 },
  { month: "Aug", revenue: 81 },
  { month: "Sep (Est.)", revenue: 70 },
];

const categories = [
  {
    name: "GPU & Graphics Cards",
    amount: "₱6.23M",
    percent: 42,
    color: "bg-blue-600",
  },
  {
    name: "Pre-built Gaming Rigs",
    amount: "₱4.15M",
    percent: 28,
    color: "bg-blue-500",
  },
  {
    name: "Processors & Motherboards",
    amount: "₱2.37M",
    percent: 16,
    color: "bg-emerald-700",
  },
  {
    name: "Monitors & Displays",
    amount: "₱1.33M",
    percent: 9,
    color: "bg-slate-500",
  },
  {
    name: "Peripherals & Accessories",
    amount: "₱742K",
    percent: 5,
    color: "bg-slate-400",
  },
];

const products = [
  {
    rank: 1,
    name: "ASUS ROG RTX 4070 Ti SUPER",
    sku: "ASU-ROG-RTX4070TI-S16",
    category: "GPU Component",
    categoryStyle: "bg-blue-100 text-blue-700",
    units: "114 units",
    revenue: "₱6,667,860",
    profit: "+₱1,137,720",
    margin: "17.06% Net",
    icon: Monitor,
    iconStyle: "bg-blue-100 text-blue-700",
  },
  {
    rank: 2,
    name: "AMD Ryzen 7 7800X3D",
    sku: "AMD-R7-7800X3D-BOX",
    category: "Processors",
    categoryStyle: "bg-emerald-100 text-emerald-700",
    units: "182 units",
    revenue: "₱4,540,900",
    profit: "+₱882,700",
    margin: "19.43% Net",
    icon: Cpu,
    iconStyle: "bg-emerald-100 text-emerald-700",
  },
  {
    rank: 3,
    name: 'Samsung Odyssey Neo G9 49"',
    sku: "SAM-LS49AG950NXXN",
    category: "Monitors",
    categoryStyle: "bg-indigo-100 text-indigo-700",
    units: "38 units",
    revenue: "₱3,419,620",
    profit: "+₱683,620",
    margin: "19.99% Net",
    icon: Monitor,
    iconStyle: "bg-slate-100 text-slate-600",
  },
  {
    rank: 4,
    name: "MSI MAG B650 Tomahawk",
    sku: "MSI-MAG-B650-WIFI",
    category: "Motherboards",
    categoryStyle: "bg-blue-100 text-blue-700",
    units: "145 units",
    revenue: "₱2,001,000",
    profit: "+₱377,000",
    margin: "18.84% Net",
    icon: Cpu,
    iconStyle: "bg-indigo-100 text-indigo-700",
  },
  {
    rank: 5,
    name: "Corsair DDR5 32GB Kit",
    sku: "COR-VEN-5S-D6000-32G",
    category: "RAM Memory",
    categoryStyle: "bg-violet-100 text-violet-700",
    units: "210 units",
    revenue: "₱1,564,500",
    profit: "+₱346,500",
    margin: "22.14% Net",
    icon: MemoryStick,
    iconStyle: "bg-indigo-100 text-indigo-700",
  },
];

/* -------------------- SUMMARY CARD -------------------- */

function SummaryCard({
  label,
  value,
  change,
  description,
  icon: Icon,
  positive = true,
  iconStyle = "bg-blue-50 text-blue-600",
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

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
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            positive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {positive ? (
            <TrendingUp size={10} />
          ) : (
            <TrendingDown size={10} />
          )}
          {change}
        </span>

        <span className="text-[10px] text-slate-500">
          {description}
        </span>
      </div>
    </div>
  );
}

/* -------------------- REVENUE CHART -------------------- */

function RevenueChart() {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  return (
    <section className="flex min-w-0 flex-col rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Revenue Velocity & Monthly Target
          </h2>

          <p className="mt-1 text-[11px] text-slate-500">
            Monthly progression comparison across FY2026 Q1–Q3
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-blue-700" />
            Actual Revenue
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 border-t border-dashed border-slate-400" />
            Target (₱1.60M Avg)
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-blue-50/80 p-3">
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500">
            Peak Month
          </p>

          <p className="mt-1 text-xs font-bold text-blue-700">
            August <span className="text-[10px]">₱2.10M</span>
          </p>
        </div>

        <div className="min-w-0 border-x border-blue-100 px-2 sm:px-3">
          <p className="text-[10px] text-slate-500">
            Current September Pace
          </p>

          <p className="mt-1 text-xs font-bold text-emerald-700">
            ₱1.85M
          </p>

          <p className="text-[10px] text-emerald-600">
            +15% Target
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-[10px] text-slate-500">
            Quarterly Run Rate
          </p>

          <p className="mt-1 text-xs font-bold text-slate-800">
            ₱5.58M
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[30px_minmax(0,1fr)] gap-2">
        <div className="flex h-36 flex-col justify-between pb-5 pt-0.5 text-right text-[9px] text-slate-400">
          <span>₱3.0M</span>
          <span>₱2.0M</span>
          <span>₱1.0M</span>
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
            {revenueData.map((item, index) => (
              <button
                key={item.month}
                type="button"
                onMouseEnter={() => setHoveredMonth(index)}
                onMouseLeave={() => setHoveredMonth(null)}
                onFocus={() => setHoveredMonth(index)}
                onBlur={() => setHoveredMonth(null)}
                aria-label={`${item.month}: revenue index ${item.revenue}`}
                className="group relative flex h-full min-w-0 flex-1 items-end justify-center outline-none"
              >
                {hoveredMonth === index && (
                  <span className="absolute bottom-[calc(100%-1.5rem)] z-10 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] text-white shadow">
                    {item.month}: {item.revenue}%
                  </span>
                )}

                <span
                  className={`w-full max-w-5 rounded-t-sm transition-colors ${
                    index === 8
                      ? "bg-emerald-700"
                      : "bg-blue-700 group-hover:bg-blue-500"
                  }`}
                  style={{ height: `${item.revenue}%` }}
                />
              </button>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-around gap-1">
            {revenueData.map((item, index) => (
              <span
                key={item.month}
                className={`min-w-0 flex-1 truncate text-center text-[9px] ${
                  index === 7
                    ? "font-bold text-blue-700"
                    : index === 8
                    ? "font-semibold text-emerald-700"
                    : "text-slate-400"
                }`}
              >
                {item.month}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------- CATEGORY CARD -------------------- */

function CategoryCard() {
  return (
    <section className="flex min-w-0 flex-col rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Revenue by Product Category
          </h2>

          <p className="mt-1 text-[11px] text-slate-500">
            Contribution across active hardware inventories
          </p>
        </div>

        <button
          type="button"
          aria-label="About category revenue"
          title="Category revenue breakdown"
          className="shrink-0 text-slate-400 hover:text-blue-600"
        >
          <CircleHelp size={14} />
        </button>
      </div>

      <div className="mt-4 flex-1 space-y-3">
        {categories.map((category) => (
          <div key={category.name}>
            <div className="flex items-center justify-between gap-2">
              <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${category.color}`}
                />

                <span className="truncate">
                  {category.name}
                </span>
              </p>

              <p className="shrink-0 text-[10px] font-semibold text-slate-700">
                {category.amount}

                <span className="ml-1 text-slate-400">
                  {category.percent}%
                </span>
              </p>
            </div>

            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${category.color}`}
                style={{ width: `${category.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-lg bg-blue-50 p-2.5">
        <ChartColumnIncreasing
          size={15}
          className="shrink-0 text-blue-600"
        />

        <p className="min-w-0 text-[10px] leading-relaxed text-slate-600">
          GPU inventory turns 3.4x faster.

          <button
            type="button"
            className="ml-1 font-semibold text-blue-700 hover:underline"
          >
            Auditing →
          </button>
        </p>
      </div>
    </section>
  );
}

/* -------------------- MAIN REPORTS PAGE -------------------- */

export default function AdminReportsAnalytics() {
  const [dateRange, setDateRange] = useState(
    "Jan 1, 2026 – Sep 30, 2026"
  );

  const [sortBy, setSortBy] = useState("By Revenue");
  const [showDateOptions, setShowDateOptions] = useState(false);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "By Units") {
      return (
        Number(b.units.split(" ")[0]) -
        Number(a.units.split(" ")[0])
      );
    }

    if (sortBy === "By Margin %") {
      return (
        Number(b.margin.match(/[\d.]+/)[0]) -
        Number(a.margin.match(/[\d.]+/)[0])
      );
    }

    return a.rank - b.rank;
  });

  const exportReport = () => {
    const header = [
      "Rank",
      "Product",
      "SKU",
      "Category",
      "Units Sold",
      "Revenue",
      "Profit Contribution",
      "Net Margin",
    ];

    const rows = sortedProducts.map((product) => [
      product.rank,
      product.name,
      product.sku,
      product.category,
      product.units,
      product.revenue,
      product.profit,
      product.margin,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "techhub-sales-report.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="w-full min-w-0 space-y-4 text-slate-800">
        {/* Page heading */}
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reports &amp; Analytics
            </h1>

            <p className="mt-1 max-w-xl text-xs text-slate-500">
              Full System Access • Executive sales performance, revenue margins,
              top-selling hardware categories, and fulfillment metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date range dropdown */}
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
                <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                  {[
                    "Jan 1, 2026 – Sep 30, 2026",
                    "Last 30 Days",
                    "Last 7 Days",
                    "Today",
                  ].map((range) => (
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
              className="flex min-h-9 items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              <Download size={13} />
              <span>Export Full Financial Report (CSV)</span>
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Gross Revenue"
            value="₱14,842,900"
            change="+18.4%"
            description="vs previous YOY"
            icon={Wallet}
          />

          <SummaryCard
            label="Net Profit Margin"
            value="22.4%"
            change="+2.1%"
            description="vs Q2 closing"
            icon={ChartNoAxesCombined}
            iconStyle="bg-emerald-50 text-emerald-700"
          />

          <SummaryCard
            label="Average Order Value (AOV)"
            value="₱32,450"
            change="+8.6%"
            description="vs last quarter"
            icon={ShoppingCart}
            iconStyle="bg-indigo-50 text-indigo-700"
          />

          <SummaryCard
            label="Return / Refund Rate"
            value="0.8%"
            change="Benchmark: < 2.0%"
            description="Exceptional"
            icon={ClipboardCheck}
            iconStyle="bg-slate-100 text-slate-600"
          />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[1.65fr_1fr]">
          <RevenueChart />
          <CategoryCard />
        </section>

        {/* Top performing products */}
        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Top 5 Performing SKUs
                </h2>

                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  High Value Matrix
                </span>
              </div>

              <p className="mt-1 text-[11px] text-slate-500">
                Ranked by consolidated revenue and direct gross profit contribution
              </p>
            </div>

            {/* Sort controls */}
            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-50 p-1">
              {["By Revenue", "By Units", "By Margin %"].map((option) => (
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
                <col className="w-[30%]" />
                <col className="w-[19%]" />
                <col className="w-[12%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
              </colgroup>

              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-3 py-3">Hardware Model</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3 text-right">Units Sold</th>
                  <th className="px-3 py-3 text-right">Revenue Generated</th>
                  <th className="px-4 py-3 text-right">Profit Contribution</th>
                </tr>
              </thead>

              <tbody>
                {sortedProducts.map((product) => {
                  const Icon = product.icon;

                  return (
                    <tr
                      key={product.sku}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-blue-700">
                          #{product.rank}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${product.iconStyle}`}
                          >
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
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-medium ${product.categoryStyle}`}
                        >
                          {product.category}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-right text-xs font-semibold text-slate-700">
                        {product.units}
                      </td>

                      <td className="px-3 py-3 text-right text-xs font-bold text-slate-800">
                        {product.revenue}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <p className="text-xs font-bold text-emerald-700">
                          {product.profit}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {product.margin}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
            <p className="text-[10px] text-slate-500">
              Showing top 5 high-yield items of 480 active catalog SKUs
            </p>

            <button
              type="button"
              onClick={exportReport}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-700 hover:text-blue-800"
            >
              <FileSpreadsheet size={12} />
              Download Granular SKU Audit (CSV)
              <Download size={11} />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-5 py-3 text-[10px] text-slate-500 shadow-sm">
          <p>© 2026 TechHub Inc. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-3">
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
