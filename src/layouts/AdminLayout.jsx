import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  LayoutDashboard,
  Package,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  User,
} from 'lucide-react';

const productSubLinks = [
  { label: 'Products Catalog', href: '/admin/products' },
  { label: 'Price Management', href: '/admin/pricing' },
  { label: 'Inventory & SKU', href: '/admin/inventory' },
];

const navItems = [
  { label: 'Order Fulfillment', href: '/admin/orders', icon: ClipboardList, badge: 8 },
  { label: 'Reports & Sales', href: '/admin/reports', icon: BarChart3 },
  { label: 'System Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children, onLogout }) {
  const [productsOpen, setProductsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#f4f6fb] font-sans text-slate-900">
      {/* Top navbar */}
      <header className="bg-[#0b1f3a] px-6 py-3">
        <div className="mx-auto flex max-w-[1400px] items-center gap-6">
          <a href="/admin" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-sky-400 text-[11px] font-bold text-sky-300">
              TH
            </span>
            <span className="text-xl font-bold text-white">
              Tech <span className="text-blue-500">Hub</span>
            </span>
          </a>

          <div className="mx-auto hidden w-full max-w-xl items-center gap-2 rounded-full bg-white px-4 py-2 md:flex">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search for products, brands, laptops, GPUs..."
              className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>

          <button className="ml-auto flex items-center gap-2 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-[11px] font-bold text-blue-700">
              JU
            </span>
            <span className="hidden text-sm font-medium sm:inline">Jaime Uy</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        {/* Sidebar */}
        <aside className="w-full shrink-0 space-y-3 lg:w-[220px]">
          <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <User size={18} />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Jaime Uy</p>
              <p className="truncate text-[11px] text-slate-400">admin@tec</p>
            </div>
          </div>

          <nav className="rounded-xl bg-white p-2 shadow-sm">
            {/* Dashboard (active) */}
            <a
              href="/admin"
              className="relative flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700"
            >
              <span className="absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-blue-600" />
              <LayoutDashboard size={16} />
              Dashboard Overview
            </a>

            {/* Product center */}
            <button
              onClick={() => setProductsOpen((v) => !v)}
              className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              <Package size={16} />
              <span className="flex-1 text-left">Product Center</span>
              <ChevronDown
                size={14}
                className={`transition-transform ${productsOpen ? '' : '-rotate-90'}`}
              />
            </button>
            {productsOpen && (
              <div className="space-y-0.5 pb-1 pl-10">
                {productSubLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className="block py-1.5 text-xs text-slate-500 hover:text-blue-600"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            )}

            {navItems.map(({ label, href, icon: Icon, badge }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-[11px] font-semibold text-blue-700">
                    {badge}
                  </span>
                )}
              </a>
            ))}

            <div className="my-2 border-t border-slate-100" />
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-50"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </nav>
        </aside>

        {/* Page content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
