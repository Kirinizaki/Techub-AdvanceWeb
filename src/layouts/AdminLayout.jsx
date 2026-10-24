import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

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

import TechubLogo from '../assets/TechubLogo.png';

const productSubLinks = [
  { label: 'Products Catalog', href: '/admin/products' },
  { label: 'Price Management', href: '/admin/price-management' },
  { label: 'Inventory & SKU', href: '/admin/inventory' },
];

const navItems = [
  {
    label: 'Order Fulfillment',
    href: '/admin/orders',
    icon: ClipboardList,
    badge: 8,
  },
  {
    label: 'Reports & Sales',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    label: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({ children, onLogout }) {
  const location = useLocation();

  const isProductCenterActive = productSubLinks.some(
    (item) => location.pathname === item.href
  );

  const [productsOpen, setProductsOpen] = useState(
    isProductCenterActive || true
  );

  const isActive = (href) => location.pathname === href;

const linkClass = (href) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive(href)
      ? 'bg-blue-50 text-blue-700'
      : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
  }`;

  return (
    <div className="min-h-screen bg-[#f4f6fb] font-sans text-slate-900">
      {/* Top Navbar */}
      <header className="bg-[#0b1f3a] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-350 items-center gap-4 sm:gap-6">
          {/* Brand Logo */}
          <Link
            to="/admin"
            className="flex shrink-0 items-center gap-2"
            aria-label="TechHub Admin Home"
          >
            <img
              src={TechubLogo}
              alt="TechHub Logo"
              className="h-12 w-12 object-contain sm:h-14 sm:w-14"
            />

            <span className="text-lg font-bold tracking-tight text-white sm:text-xl">
              Tech<span className="text-blue-400">Hub</span>
            </span>
          </Link>

          {/* Search Bar */}
          <div className="mx-auto hidden w-full max-w-xl items-center gap-2 rounded-full bg-white px-4 py-2 md:flex">
            <Search size={16} className="shrink-0 text-slate-400" />

            <input
              type="search"
              placeholder="Search for products, brands, laptops, GPUs..."
              aria-label="Search products"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Admin Profile */}
          <button
            type="button"
            className="ml-auto flex shrink-0 items-center gap-2 text-white"
            aria-label="Admin profile menu"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-[11px] font-bold text-blue-700">
              JU
            </span>

            <span className="hidden text-sm font-medium sm:inline">
              Jaime Uy
            </span>

            <ChevronDown size={14} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="mx-auto flex max-w-350 flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        {/* Sidebar */}
        <aside className="w-full shrink-0 space-y-3 lg:w-55">
          {/* Admin Information */}
          <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <User size={18} />

              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                Jaime Uy
              </p>

              <p className="truncate text-[11px] text-slate-400">
                admin@tec
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Admin navigation"
            className="rounded-xl bg-white p-2 shadow-sm"
          >
            {/* Dashboard */}
            <Link
              to="/admin"
              className={`relative ${linkClass('/admin')}`}
            >
              {isActive('/admin') && (
                <span className="absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-blue-600" />
              )}

              <LayoutDashboard size={16} />
              <span>Dashboard Overview</span>
            </Link>

            {/* Product Center */}
            <button
              type="button"
              onClick={() => setProductsOpen((open) => !open)}
              aria-expanded={productsOpen}
              className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isProductCenterActive
                  ? 'font-semibold text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Package size={16} />

              <span className="flex-1 text-left">
                Product Center
              </span>

              <ChevronDown
                size={14}
                className={`transition-transform ${
                  productsOpen ? '' : '-rotate-90'
                }`}
              />
            </button>

            {productsOpen && (
              <div className="space-y-0.5 pb-1 pl-10">
                {productSubLinks.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`block rounded-md px-1 py-1.5 text-xs transition-colors ${
                      isActive(item.href)
                        ? 'font-semibold text-blue-700'
                        : 'text-slate-500 hover:text-blue-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Other Navigation Links */}
            {navItems.map(({ label, href, icon: Icon, badge }) => (
              <Link
                key={href}
                to={href}
                className={`mt-1 ${linkClass(href)}`}
              >
                <Icon size={16} />

                <span className="flex-1">{label}</span>

                {badge !== undefined && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-[11px] font-semibold text-blue-700">
                    {badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Logout */}
            <div className="my-2 border-t border-slate-100" />

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-500 transition-colors hover:bg-rose-50"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </nav>
        </aside>

        {/* Page Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}