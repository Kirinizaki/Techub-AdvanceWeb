import {
  Calendar,
  Plus,
  Pencil,
  User,
  FileText,
  CircleCheck,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Cpu,
  Monitor,
  Keyboard,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';

const stats = [
  {
    label: 'Total Products & SKUs',
    value: '1,428',
    link: 'View catalog',
    icon: FileText,
    iconStyle: 'bg-amber-50 text-amber-500',
  },
  {
    label: 'Orders in Queue',
    value: '24',
    link: 'View details',
    icon: CircleCheck,
    iconStyle: 'bg-emerald-50 text-emerald-500',
  },
  {
    label: 'Low Stock Alerts',
    value: '9 Items',
    valueStyle: 'text-rose-600',
    link: 'Restock manager',
    icon: AlertTriangle,
    iconStyle: 'bg-blue-50 text-blue-500',
  },
  {
    label: 'Revenue (MTD)',
    value: '₱842,900',
    note: '+14.2% vs last month',
    icon: TrendingUp,
    iconStyle: 'bg-blue-50 text-blue-500',
  },
];

const orders = [
  {
    id: '#TH20240918',
    customer: 'Jaime Uy (RTX 4070 Dual)',
    date: 'Sep 18, 2026',
    total: '₱18,350',
    status: 'Processing',
    icon: Cpu,
  },
  {
    id: '#TH20240912',
    customer: 'Kael Rivera (Gaming PC)',
    date: 'Sep 12, 2026',
    total: '₱52,090',
    status: 'Delivered',
    icon: Monitor,
  },
  {
    id: '#TH20240905',
    customer: 'Sarah Chen (Mechanical KB)',
    date: 'Sep 5, 2026',
    total: '₱10,750',
    status: 'Delivered',
    icon: Keyboard,
  },
];

const statusStyles = {
  Processing: 'bg-amber-100 text-amber-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
};

const collapsibles = [
  {
    title: 'Saved Shipping Addresses',
    desc: 'Warehouse delivery terminals and hub destinations',
    meta: '2 Addresses',
    icon: MapPin,
  },
  {
    title: 'Security & Password',
    desc: 'Two-factor authentication and role credentials',
    icon: ShieldCheck,
  },
];

export default function Dashboard({ onLogout })  {
  return (
    <AdminLayout onLogout={onLogout}>
      {/* Page heading */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin Console</h1>
          <p className="mt-1 text-xs text-slate-500">
            Full System Access • Manage products, pricing, stock levels, orders, and real-time
            analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Calendar size={13} />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
            <Plus size={14} />
            Add New Product
          </button>
        </div>
      </div>

      {/* Profile card */}
      <section className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <User size={22} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">Jaime Uy</p>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                Super Admin
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Primary Warehouse: Manila Central Hub • Last logged in: Today, 08:42 AM
            </p>
          </div>
        </div>
        <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50">
          <Pencil size={12} />
          Edit Profile
        </button>
      </section>

      {/* Stat cards */}
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, valueStyle, link, note, icon: Icon, iconStyle }) => (
          <div key={label} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-slate-600">{label}</p>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-md ${iconStyle}`}
              >
                <Icon size={13} />
              </span>
            </div>
            <p className={`mt-2 text-2xl font-bold ${valueStyle ?? ''}`}>{value}</p>
            {link && (
              <a href="#" className="mt-2 inline-block text-xs font-medium text-blue-600">
                {link} →
              </a>
            )}
            {note && <p className="mt-2 text-[11px] font-medium text-emerald-600">{note}</p>}
          </div>
        ))}
      </section>

      {/* Recent orders */}
      <section className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm xl:max-w-[75%]">
        <div className="flex items-start justify-between p-4">
          <div>
            <h2 className="text-sm font-bold">Recent Orders</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Track and manage your latest fulfillment orders
            </p>
          </div>
          <a href="/admin/orders" className="text-xs font-semibold text-blue-600">
            See All Orders →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-y border-slate-100 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5">Order #</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Total</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(({ id, customer, date, total, status, icon: Icon }) => (
                <tr key={id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                        <Icon size={13} />
                      </span>
                      <div>
                        <p className="text-xs font-bold">{id}</p>
                        <p className="text-[10px] text-slate-400">{customer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{date}</td>
                  <td className="px-4 py-3 text-xs font-bold">{total}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[status]}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    <ChevronRight size={14} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[10px] text-slate-400">
          <span>Displaying 3 of 42 active transactions</span>
          <span className="text-slate-500">Automatic sync enabled</span>
        </div>
      </section>

      {/* Collapsible rows */}
      <div className="mt-4 space-y-3">
        {collapsibles.map(({ title, desc, meta, icon: Icon }) => (
          <button
            key={title}
            className="flex w-full items-center gap-3 rounded-xl bg-white p-4 text-left shadow-sm hover:bg-slate-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Icon size={15} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold">{title}</p>
              <p className="text-[11px] text-slate-500">{desc}</p>
            </div>
            {meta && <span className="text-xs text-slate-400">{meta}</span>}
            <ChevronRight size={15} className="text-slate-400" />
          </button>
        ))}
      </div>
    </AdminLayout>
  );
}
