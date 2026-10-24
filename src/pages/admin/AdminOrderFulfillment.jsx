
import { useMemo, useState } from 'react';
import {
  Download,
  Printer,
  Search,
  Calendar,
  Warehouse,
  SlidersHorizontal,
  ChevronDown,
  ClipboardList,
  Package,
  Truck,
  CircleCheck,
  ArrowRight,
  Clock,
  Hourglass,
  TrendingUp,
  Globe,
  Monitor,
  Keyboard,
  CreditCard,
  Send,
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';

<<<<<<< HEAD
/* ---------- Static data (replace with Supabase later) ---------- */
=======
/* ---------- Static data ---------- */
>>>>>>> origin/Kael

const summaryCards = [
  {
    label: 'Orders in Queue',
    value: '24 Orders',
    note: '12 awaiting packing station',
    noteDot: 'bg-blue-600',
    footer: 'Queue capacity: 68%',
    footerStyle: 'text-blue-700',
    footerIcon: ArrowRight,
    icon: ClipboardList,
    iconStyle: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Processing & Packing',
    value: '8 Orders',
    note: 'Ready for courier pickup',
    noteDot: 'bg-blue-600',
    footer: 'Next batch: 11:30 AM',
    footerStyle: 'text-slate-600',
    footerIcon: Clock,
    icon: Package,
    iconStyle: 'bg-slate-100 text-slate-500',
  },
  {
    label: 'Shipped / In Transit',
    value: '46 Orders',
    note: 'Out for delivery today',
    noteDot: 'bg-emerald-500',
    footer: 'Avg transit: 1.4 days',
    footerStyle: 'text-blue-700',
    footerIcon: Hourglass,
    icon: Truck,
    iconStyle: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Completed Today',
    value: '19 Orders',
    note: '₱418,200 total settled',
    noteDot: 'bg-emerald-500',
    footer: '100% on-time fulfillment',
    footerStyle: 'text-emerald-700',
    footerIcon: TrendingUp,
    icon: CircleCheck,
    iconStyle: 'bg-emerald-50 text-emerald-600',
  },
];

const tabs = [
  { label: 'All Orders (98)', status: 'All' },
  { label: 'Pending Payment (4)', status: 'Pending Payment' },
  { label: 'Processing (24)', status: 'Processing' },
  { label: 'Ready to Ship (8)', status: 'Ready to Ship' },
  { label: 'In Transit (46)', status: 'In Transit' },
  { label: 'Delivered', status: 'Delivered' },
  { label: 'Returned/Cancelled', status: 'Returned/Cancelled' },
];

const orders = [
  {
    id: '#TH2026-0918',
    when: 'Today, 09:15 AM',
    icon: Globe,
    iconStyle: 'bg-blue-50 text-blue-600',
    customer: 'Jaime Uy',
    location: 'Walk-in SuperAdmin',
    qty: 1,
    item: 'RTX 4070 Ti SUPER OC',
    payment: 'GCash Paid',
    payDot: 'bg-emerald-500',
    total: 58490,
    status: 'Processing',
    action: 'ship',
  },
  {
    id: '#TH2026-0917',
    when: 'Today, 08:30 AM',
    icon: Monitor,
    iconStyle: 'bg-blue-50 text-blue-600',
    customer: 'John Vincent Almonia',
    location: 'Metro Manila',
    item: 'Full Custom Gaming PC',
    note: 'Ryzen 7 • 32GB RAM',
    payment: 'Bank Transfer Verified',
    payDot: 'bg-emerald-500',
    total: 84200,
    status: 'Processing',
    action: 'ship',
  },
  {
    id: '#TH2026-0916',
    when: 'Yesterday, 04:20 PM',
    icon: Keyboard,
    iconStyle: 'bg-blue-50 text-blue-600',
    customer: 'Joseph Armia Jr.',
    location: 'Makati City',
    qty: 1,
    item: 'Mechanical Keyboard',
    note: '1x 2TB NVMe PCIe 4.0',
    payment: 'Maya Online',
    payDot: 'bg-emerald-500',
    total: 14850,
    status: 'Ready to Ship',
    action: 'label',
  },
  {
    id: '#TH2026-0915',
    when: 'Yesterday, 02:10 PM',
    icon: Monitor,
    iconStyle: 'bg-blue-50 text-blue-600',
    customer: 'James Alba',
    location: 'Cebu City',
    qty: 1,
    item: 'Samsung Neo G9 Monitor',
    payment: 'Credit Card (Mastercard)',
    payDot: 'bg-blue-600',
    total: 89990,
    status: 'In Transit',
    statusNote: 'LBC Express',
    action: 'track',
  },
  {
    id: '#TH2026-0914',
    when: 'Sep 16, 2026',
    icon: Package,
    iconStyle: 'bg-emerald-100 text-emerald-700',
    customer: 'Marvin Caseres',
    location: 'Quezon City',
    qty: 2,
    item: 'Corsair DDR5 RAM 32GB Kit',
    payment: 'COD Approved',
    payDot: 'bg-emerald-500',
    total: 14900,
    status: 'Delivered',
    action: 'details',
  },
  {
    id: '#TH2026-0913',
    when: 'Sep 15, 2026',
    icon: Package,
    iconStyle: 'bg-emerald-100 text-emerald-700',
    customer: 'Angelo Ramos',
    location: 'Pasig City',
    qty: 1,
    item: 'MSI B650 Motherboard',
    payment: 'GCash Paid',
    payDot: 'bg-emerald-500',
    total: 13800,
    status: 'Delivered',
    action: 'details',
  },
];

const statusStyle = {
  'Pending Payment': {
    pill: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-500',
  },
  Processing: {
    pill: 'bg-slate-100 text-slate-600',
    dot: 'bg-slate-500',
  },
  'Ready to Ship': {
    pill: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  'In Transit': {
    pill: 'bg-sky-100 text-sky-700',
    dot: 'bg-sky-500',
  },
  Delivered: {
    pill: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-600',
  },
  'Returned/Cancelled': {
    pill: 'bg-rose-100 text-rose-600',
    dot: 'bg-rose-500',
  },
};

const formatPrice = (n) => `₱${n.toLocaleString('en-PH')}`;

/* ---------- Small components ---------- */

function SelectBox({ icon: Icon, value, onChange, options, label }) {
  return (
<<<<<<< HEAD
    <div className="relative">
=======
    <div className="relative shrink-0">
>>>>>>> origin/Kael
      <Icon
        size={13}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
      />
<<<<<<< HEAD
=======

>>>>>>> origin/Kael
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-9 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-7 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
<<<<<<< HEAD
=======

>>>>>>> origin/Kael
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </div>
  );
}

function ActionButton({ type }) {
  const base =
<<<<<<< HEAD
    'inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-center text-[10px] font-semibold leading-tight';

  if (type === 'ship') {
    return (
      <button className={`${base} w-16 bg-blue-600 text-white hover:bg-blue-700`}>
        View /<br />
=======
    'inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-center text-[10px] font-semibold leading-tight';

  if (type === 'ship') {
    return (
      <button
        type="button"
        className={`${base} w-16 bg-blue-600 text-white hover:bg-blue-700`}
      >
        View /
        <br />
>>>>>>> origin/Kael
        Ship
      </button>
    );
  }

  if (type === 'label') {
    return (
<<<<<<< HEAD
      <button className={`${base} bg-blue-50 text-blue-700 hover:bg-blue-100`}>
=======
      <button
        type="button"
        className={`${base} bg-blue-50 text-blue-700 hover:bg-blue-100`}
      >
>>>>>>> origin/Kael
        <Printer size={12} />
        <span>
          Print
          <br />
          Label
        </span>
      </button>
    );
  }

  if (type === 'track') {
    return (
<<<<<<< HEAD
      <button className={`${base} bg-slate-100 text-slate-700 hover:bg-slate-200`}>
=======
      <button
        type="button"
        className={`${base} bg-slate-100 text-slate-700 hover:bg-slate-200`}
      >
>>>>>>> origin/Kael
        <Send size={11} />
        Track
      </button>
    );
  }

  return (
<<<<<<< HEAD
    <button className={`${base} bg-slate-100 text-slate-700 hover:bg-slate-200`}>
=======
    <button
      type="button"
      className={`${base} bg-slate-100 text-slate-700 hover:bg-slate-200`}
    >
>>>>>>> origin/Kael
      Details
    </button>
  );
}

/* ---------- Page ---------- */

export default function AdminOrderFulfillment() {
  const [activeTab, setActiveTab] = useState('All');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState('Last 7 Days');
  const [warehouse, setWarehouse] = useState('All Warehouses');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return orders.filter((o) => {
      const matchesTab = activeTab === 'All' || o.status === activeTab;

      const matchesQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q) ||
        o.item.toLowerCase().includes(q);

      return matchesTab && matchesQuery;
    });
  }, [activeTab, query]);

<<<<<<< HEAD
  const isFiltering = activeTab !== 'All' || query;
=======
  const isFiltering = activeTab !== 'All' || query.trim() !== '';
>>>>>>> origin/Kael
  const pageNumbers = [1, 2, 3, '...', 17];

  const exportCsv = () => {
    const header = [
      'Order ID',
      'Date',
      'Customer',
      'Location',
      'Items',
      'Payment',
      'Total',
      'Status',
    ];

    const rows = filtered.map((o) => [
      o.id,
      o.when,
      o.customer,
      o.location,
      `${o.qty ? `${o.qty}x ` : ''}${o.item}`,
      o.payment,
      o.total,
      o.status,
    ]);

    const csv = [header, ...rows]
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      )
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    );

    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
<<<<<<< HEAD
      {/* Heading */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Order Fulfillment</h1>

            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700">
              Live Dispatch
            </span>
          </div>

          <p className="mt-1 max-w-md text-xs text-slate-500">
            Full System Access • Process customer orders, verify payments, generate shipping
            labels, and track deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold leading-tight text-slate-700 hover:bg-slate-50"
          >
            <Download size={13} />
            <span>
              Export Orders
              <br />
              (CSV)
            </span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-left text-xs font-semibold leading-tight text-white hover:bg-blue-700"
          >
            <Printer size={14} />
            <span>
              Print Packing
              <br />
              Slips
            </span>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(
          ({
            label,
            value,
            note,
            noteDot,
            footer,
            footerStyle,
            footerIcon: FooterIcon,
            icon: Icon,
            iconStyle,
          }) => (
            <div key={label} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase leading-tight tracking-wide text-slate-500">
                  {label}
                </p>

                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}
                >
                  <Icon size={15} />
                </span>
              </div>

              <p className="mt-2 text-2xl font-bold">{value}</p>

              <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full ${noteDot}`} />
                {note}
              </p>

              <div
                className={`mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-semibold ${footerStyle}`}
              >
                <span>{footer}</span>
                <FooterIcon size={12} />
              </div>
            </div>
          ),
        )}
      </section>

      {/* Tabs */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.label}
            onClick={() => setActiveTab(t.status)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              activeTab === t.status
                ? 'bg-blue-700 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table card */}
      <section className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 min-w-60 flex-1 items-center gap-2 rounded-lg bg-blue-50 px-3">
            <Search size={14} className="text-slate-500" />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Order #, Customer Name, Contact, or Tracking Number..."
              className="w-full bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>

          <SelectBox
            icon={Calendar}
            label="Date range"
            value={range}
            onChange={setRange}
            options={['Today', 'Last 7 Days', 'Last 30 Days']}
          />

          <SelectBox
            icon={Warehouse}
            label="Warehouse"
            value={warehouse}
            onChange={setWarehouse}
            options={['All Warehouses', 'Manila Central Hub', 'Cebu Hub']}
          />

          <button
            aria-label="More filters"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-230 text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase leading-tight tracking-wide text-slate-500">
                <th className="py-3 pr-3">
                  Order ID &amp;
                  <br />
                  Date
                </th>

                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Items &amp; Breakdown</th>

                <th className="px-3 py-3">
                  Payment
                  <br />
                  Method
                </th>

                <th className="px-3 py-3">
                  Total
                  <br />
                  Amount (₱)
                </th>

                <th className="px-3 py-3">
                  Fulfillment
                  <br />
                  Status
                </th>

                <th className="py-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((o) => {
                const Icon = o.icon;
                const st = statusStyle[o.status];

                return (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${o.iconStyle}`}
                        >
                          <Icon size={13} />
                        </span>

                        <div>
                          <p className="text-xs font-bold">{o.id}</p>
                          <p className="text-[10px] text-slate-500">{o.when}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <p className="text-xs font-bold">{o.customer}</p>
                      <p className="text-[10px] text-slate-500">{o.location}</p>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        {o.qty && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            {o.qty}x
                          </span>
                        )}

                        <span>{o.item}</span>
                      </div>

                      {o.note && (
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {o.note}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded bg-blue-50 px-2 py-1 text-[10px] font-semibold text-slate-700">
                        {o.payment.includes('Card') ? (
                          <CreditCard size={11} className="text-blue-600" />
                        ) : (
                          <span className={`h-1.5 w-1.5 rounded-full ${o.payDot}`} />
                        )}

                        {o.payment}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-xs font-bold">
                      {formatPrice(o.total)}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${st.pill}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        {o.status}
                        {o.statusNote && ` • ${o.statusNote}`}
                      </span>
                    </td>

                    <td className="py-3 pl-3">
                      <div className="flex justify-end">
                        <ActionButton type={o.action} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            No orders match this tab or search. Try another status or clear the search box.
          </p>
        )}

        {/* Table footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          {isFiltering ? (
            <p>
              Showing <b className="text-slate-800">{filtered.length}</b> matching{' '}
              {filtered.length === 1 ? 'order' : 'orders'}
            </p>
          ) : (
            <p>
              Showing <b className="text-slate-800">1</b> to{' '}
              <b className="text-slate-800">6</b> of{' '}
              <b className="text-slate-800">98</b> recorded orders
            </p>
          )}

          {!isFiltering && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-400 enabled:text-slate-700 enabled:hover:bg-slate-200"
=======
      <div className="w-full min-w-0 text-slate-800">
        {/* Heading */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">
                Order Fulfillment
              </h1>

              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                Live Dispatch
              </span>
            </div>

            <p className="mt-1 max-w-md text-xs text-slate-500">
              Full System Access • Process customer orders, verify payments,
              generate shipping labels, and track deliveries.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold leading-tight text-slate-700 hover:bg-slate-50"
            >
              <Download size={13} />
              <span>
                Export Orders
                <br />
                (CSV)
              </span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-left text-xs font-semibold leading-tight text-white hover:bg-blue-700"
            >
              <Printer size={14} />
              <span>
                Print Packing
                <br />
                Slips
              </span>
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(
            ({
              label,
              value,
              note,
              noteDot,
              footer,
              footerStyle,
              footerIcon: FooterIcon,
              icon: Icon,
              iconStyle,
            }) => (
              <div
                key={label}
                className="flex min-h-39.5 flex-col rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium uppercase leading-tight tracking-wide text-slate-500">
                    {label}
                  </p>

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}
                  >
                    <Icon size={15} />
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold">{value}</p>

                <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${noteDot}`} />
                  {note}
                </p>

                <div
                  className={`mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-semibold ${footerStyle}`}
                >
                  <span>{footer}</span>
                  <FooterIcon size={12} />
                </div>
              </div>
            ),
          )}
        </section>

        {/* Status tabs: one line, horizontally scrollable */}
        <div className="mt-5 overflow-x-auto pb-1">
          <div className="flex w-max min-w-full flex-nowrap items-center gap-2">
            {tabs.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => {
                  setActiveTab(t.status);
                  setPage(1);
                }}
                aria-pressed={activeTab === t.status}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === t.status
                    ? 'bg-blue-700 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table card */}
        <section className="mt-4 rounded-xl bg-white p-4 shadow-sm">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-9 min-w-50 flex-1 items-center gap-2 rounded-lg bg-blue-50 px-3">
              <Search size={14} className="shrink-0 text-slate-500" />

              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by Order #, Customer Name, Contact, or Tracking Number..."
                aria-label="Search orders"
                className="w-full min-w-0 bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none"
              />
            </div>

            <SelectBox
              icon={Calendar}
              label="Date range"
              value={range}
              onChange={setRange}
              options={['Today', 'Last 7 Days', 'Last 30 Days']}
            />

            <SelectBox
              icon={Warehouse}
              label="Warehouse"
              value={warehouse}
              onChange={setWarehouse}
              options={[
                'All Warehouses',
                'Manila Central Hub',
                'Cebu Hub',
              ]}
            />

            <button
              type="button"
              aria-label="More filters"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            >
              <SlidersHorizontal size={14} />
            </button>
          </div>

          {/* Fixed-height table viewport */}
          <div className="mt-4 h-80 overflow-auto rounded-md">
            <table className="w-full min-w-250 table-fixed text-left">
              <colgroup>
                <col className="w-[17%]" />
                <col className="w-[17%]" />
                <col className="w-[21%]" />
                <col className="w-[17%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[6%]" />
              </colgroup>

              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase leading-tight tracking-wide text-slate-500">
                  <th className="py-3 pr-3">
                    Order ID &amp;
                    <br />
                    Date
                  </th>

                  <th className="px-3 py-3">Customer</th>

                  <th className="px-3 py-3">
                    Items &amp; Breakdown
                  </th>

                  <th className="px-3 py-3">
                    Payment
                    <br />
                    Method
                  </th>

                  <th className="px-3 py-3">
                    Total
                    <br />
                    Amount (₱)
                  </th>

                  <th className="px-3 py-3">
                    Fulfillment
                    <br />
                    Status
                  </th>

                  <th className="py-3 pl-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((o) => {
                  const Icon = o.icon;
                  const st = statusStyle[o.status];

                  return (
                    <tr
                      key={o.id}
                      className="h-14.5 border-b border-slate-50 last:border-0"
                    >
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${o.iconStyle}`}
                          >
                            <Icon size={13} />
                          </span>

                          <div className="min-w-0">
                            <p className="wrap-break-word text-xs font-bold">
                              {o.id}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {o.when}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <p className="wrap-break-word text-xs font-bold">
                          {o.customer}
                        </p>
                        <p className="wrap-break-word text-[10px] text-slate-500">
                          {o.location}
                        </p>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          {o.qty && (
                            <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              {o.qty}x
                            </span>
                          )}

                          <span className="wrap-break-word">{o.item}</span>
                        </div>

                        {o.note && (
                          <p className="mt-0.5 wrap-break-word text-[10px] text-slate-500">
                            {o.note}
                          </p>
                        )}
                      </td>

                      <td className="px-3 py-3">
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded bg-blue-50 px-2 py-1 text-[10px] font-semibold text-slate-700">
                          {o.payment.includes('Card') ? (
                            <CreditCard
                              size={11}
                              className="shrink-0 text-blue-600"
                            />
                          ) : (
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${o.payDot}`}
                            />
                          )}

                          <span className="wrap-break-word">
                            {o.payment}
                          </span>
                        </span>
                      </td>

                      <td className="px-3 py-3 text-xs font-bold">
                        {formatPrice(o.total)}
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ${st.pill}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${st.dot}`}
                          />
                          <span className="wrap-break-word">
                            {o.status}
                            {o.statusNote && ` • ${o.statusNote}`}
                          </span>
                        </span>
                      </td>

                      <td className="py-3 pl-3">
                        <div className="flex justify-end">
                          <ActionButton type={o.action} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Empty state stays inside the fixed-height viewport */}
            {filtered.length === 0 && (
              <div className="flex min-h-55 items-center justify-center px-4 text-center text-xs text-slate-500">
                No orders match this tab or search. Try another status or
                clear the search box.
              </div>
            )}
          </div>

          {/* Stable table footer and pagination */}
          <div className="mt-4 flex min-h-8 flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            {isFiltering ? (
              <p>
                Showing{' '}
                <b className="text-slate-800">{filtered.length}</b>{' '}
                matching{' '}
                {filtered.length === 1 ? 'order' : 'orders'}
              </p>
            ) : (
              <p>
                Showing <b className="text-slate-800">1</b> to{' '}
                <b className="text-slate-800">{filtered.length}</b> of{' '}
                <b className="text-slate-800">98</b> recorded orders
              </p>
            )}

            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-400 enabled:text-slate-700 enabled:hover:bg-slate-200 disabled:cursor-not-allowed"
>>>>>>> origin/Kael
              >
                Previous
              </button>

              {pageNumbers.map((n, i) =>
                n === '...' ? (
                  <span key={`gap-${i}`} className="px-1">
                    ...
                  </span>
                ) : (
                  <button
                    key={n}
<<<<<<< HEAD
                    onClick={() => setPage(n)}
=======
                    type="button"
                    onClick={() => setPage(n)}
                    aria-current={page === n ? 'page' : undefined}
>>>>>>> origin/Kael
                    className={`h-7 w-7 rounded-md text-xs font-semibold ${
                      page === n
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {n}
                  </button>
                ),
              )}

              <button
<<<<<<< HEAD
                onClick={() => setPage((p) => Math.min(17, p + 1))}
                className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
=======
                type="button"
                onClick={() => setPage((p) => Math.min(17, p + 1))}
                disabled={page === 17}
                className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
>>>>>>> origin/Kael
              >
                Next
              </button>
            </div>
<<<<<<< HEAD
          )}
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
=======
          </div>
        </section>

        {/* Page footer */}
        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-5 py-3 text-[10px] text-slate-500 shadow-sm">
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
>>>>>>> origin/Kael
    </AdminLayout>
  );
}
