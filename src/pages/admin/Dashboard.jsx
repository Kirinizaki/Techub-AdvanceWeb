import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  User,
  FileText,
  CircleCheck,
  AlertTriangle,
  TrendingUp,
  Truck,
  ChevronRight,
  Package,
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { useUserRole } from '../../hooks/useUserRole';

const LOW_STOCK_LEVEL = 5; // same threshold as the Inventory page

const peso = (n) =>
  `₱${Number(n || 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;

const STATUS_STYLES = {
  pending: 'bg-orange-100 text-orange-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-sky-100 text-sky-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-600',
};

const label = (s) =>
  String(s ?? '').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

function customerName(o) {
  const a = o.shipping_address ?? {};
  return (
    a.full_name ??
    a.fullName ??
    a.name ??
    a.recipient_name ??
    ([a.first_name, a.last_name].filter(Boolean).join(' ') || null) ??
    o.customer_email ??
    'Customer'
  ) || o.customer_email || 'Customer';
}

export default function Dashboard({ onLogout }) {
  const { user, isAdmin, loading: roleLoading } = useUserRole();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileName, setProfileName] = useState('');
  
useEffect(() => {
  if (!user?.id) return;

  let active = true;

  async function loadProfileName() {
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', user.id)
      .maybeSingle();

    if (!active || error) {
      if (error) console.error('Failed to load profile name:', error);
      return;
    }

    setProfileName(data?.display_name || data?.username || '');
  }

  loadProfileName();

  return () => {
    active = false;
  };
}, [user?.id]);

  useEffect(() => {
    if (roleLoading) return undefined;
    let active = true;

    async function load() {
      setLoading(true);
      setError('');

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const head = { count: 'exact', head: true };

      const calls = [
        supabase.from('products').select('id', head),
        supabase
          .from('orders')
          .select('id', head)
          .in('order_status', ['pending', 'confirmed', 'processing']),
        supabase.from('products').select('id', head).lte('stock_quantity', LOW_STOCK_LEVEL),
        supabase
          .from('orders')
          .select('*, order_items(*)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('orders').select('id', head).eq('order_status', 'shipped'),
      ];

      if (isAdmin) {
        calls.push(
          supabase.rpc('admin_sales_report', {
            p_from: monthStart.toISOString(),
            p_to: new Date(now.getTime() + 60_000).toISOString(),
          })
        );
      }

      const results = await Promise.all(calls);
      if (!active) return;

      const failed = results.find((r) => r.error);
      if (failed) {
        console.error('Dashboard data load failed:', failed.error);
        setError('Some dashboard information could not be loaded. Refresh to try again.');
        setData(null);
        setLoading(false);
        return;
      }

      const [products, queue, low, recent, shipped, revenue] = results;
      setData({
        productCount: products.count ?? 0,
        queueCount: queue.count ?? 0,
        lowCount: low.count ?? 0,
        shippedCount: shipped.count ?? 0,
        recentOrders: recent.data ?? [],
        totalOrders: recent.count ?? 0,
        revenue: revenue?.data?.summary ?? null,
      });
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [roleLoading, isAdmin]);

 const email = user?.email ?? '';
const displayName = profileName || 'Account';

const lastSignIn = user?.last_sign_in_at
  ? new Date(user.last_sign_in_at).toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  : '—';

  // 4th card: revenue for admins, deliveries for staff
  const rev = data?.revenue;
  const revNow = Number(rev?.gross_revenue ?? 0);
  const revPrev = Number(rev?.prev_gross_revenue ?? 0);
  const revChange =
    revPrev > 0 ? `${(((revNow - revPrev) / revPrev) * 100).toFixed(1)}% vs previous period` : null;

  const stats = [
    {
      label: 'Total Products & SKUs',
      value: data?.productCount?.toLocaleString(),
      link: 'View catalog',
      to: '/admin/products',
      icon: FileText,
      iconStyle: 'bg-amber-50 text-amber-500',
    },
    {
      label: 'Orders in Queue',
      value: data?.queueCount?.toLocaleString(),
      note: 'Pending, confirmed or processing',
      link: 'View details',
      to: '/admin/orders',
      icon: CircleCheck,
      iconStyle: 'bg-emerald-50 text-emerald-500',
    },
    {
      label: 'Low Stock Alerts',
      value: data ? `${data.lowCount} Items` : undefined,
      valueStyle: 'text-rose-600',
      note: `${LOW_STOCK_LEVEL} units or fewer`,
      link: 'Restock manager',
      to: '/admin/inventory',
      icon: AlertTriangle,
      iconStyle: 'bg-blue-50 text-blue-500',
    },
    isAdmin
      ? {
          label: 'Revenue (MTD)',
          value: data ? peso(revNow) : undefined,
          note: revChange ?? 'Paid orders this month',
          icon: TrendingUp,
          iconStyle: 'bg-blue-50 text-blue-500',
        }
      : {
          label: 'Out for Delivery',
          value: data?.shippedCount?.toLocaleString(),
          link: 'View shipped orders',
          to: '/admin/orders',
          icon: Truck,
          iconStyle: 'bg-sky-50 text-sky-500',
        },
  ];

  return (
    <AdminLayout onLogout={onLogout}>
      {/* Page heading */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {isAdmin ? 'Admin Console' : 'Staff Console'}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {isAdmin
              ? 'Full System Access • Manage products, pricing, stock levels, orders, and sales reports.'
              : 'Staff Access • Manage products, pricing, stock levels, and order fulfillment.'}
          </p>
        </div>
        <Link
          to="/admin/products"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={14} />
          Add New Product
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
          Some dashboard data could not be loaded: {error}
        </div>
      )}

      {/* Profile card */}
      <section className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <User size={22} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">
  {profileName || 'Profile name not loaded'}
</p>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                {isAdmin ? 'Admin' : 'Staff'}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {email} • Last sign in: {lastSignIn}
            </p>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label: title, value, valueStyle, link, to, note, icon: Icon, iconStyle }) => (
          <div key={title} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-slate-600">{title}</p>
              <span className={`flex h-6 w-6 items-center justify-center rounded-md ${iconStyle}`}>
                <Icon size={13} />
              </span>
            </div>
            <p className={`mt-2 text-2xl font-bold ${valueStyle ?? ''}`}>
              {loading ? '…' : value ?? '—'}
            </p>
            {note && <p className="mt-1 text-[11px] text-slate-500">{note}</p>}
            {link && (
              <Link to={to} className="mt-2 inline-block text-xs font-medium text-blue-600">
                {link} →
              </Link>
            )}
          </div>
        ))}
      </section>

      {/* Recent orders */}
      <section className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm xl:max-w-[75%]">
        <div className="flex items-start justify-between p-4">
          <div>
            <h2 className="text-sm font-bold">Recent Orders</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Your latest customer orders
            </p>
          </div>
          <Link to="/admin/orders" className="text-xs font-semibold text-blue-600">
            See All Orders →
          </Link>
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
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-500">
                    Loading orders…
                  </td>
                </tr>
              )}

              {!loading && data?.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-500">
                    No orders yet.
                  </td>
                </tr>
              )}

              {!loading &&
                data?.recentOrders.map((o) => {
                  const first = o.order_items?.[0];
                  return (
                    <tr key={o.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                            <Package size={13} />
                          </span>
                          <div>
                            <p className="text-xs font-bold">{o.order_number}</p>
                            <p className="text-[10px] text-slate-400">
                              {customerName(o)}
                              {first ? ` (${first.product_name ?? 'Item'}` : ''}
                              {o.order_items?.length > 1 ? ` +${o.order_items.length - 1}` : ''}
                              {first ? ')' : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(o.created_at).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold">{peso(o.total)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            STATUS_STYLES[o.order_status] ?? 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {label(o.order_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        <Link to="/admin/orders" aria-label={`Open ${o.order_number}`}>
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[10px] text-slate-400">
          <span>
            Displaying {data?.recentOrders.length ?? 0} of {data?.totalOrders ?? 0} orders
          </span>
        </div>
      </section>
    </AdminLayout>
  );
}
