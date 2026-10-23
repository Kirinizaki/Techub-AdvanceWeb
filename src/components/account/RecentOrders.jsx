
import { Link } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";

const formatPrice = (price, currency = "PHP") =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: currency || "PHP",
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);

function StatusBadge({ status }) {
  const normalized = (status || "Unknown").trim().toLowerCase();

  const styles = {
    processing: "bg-amber-50 text-amber-700 border-amber-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    shipped: "bg-blue-50 text-blue-700 border-blue-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const label = normalized.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-medium ${
        styles[normalized] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

export default function RecentOrders({ orders = [], loading = false }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
        <div>
          <h2 className="text-sm font-bold text-[#080F24]">Recent Orders</h2>
          <p className="mt-1 text-xs text-slate-400">
            Track and view your latest purchases
          </p>
        </div>

        <Link
          to="/account/orders"
          className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          See All Orders →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-140 text-left text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Order #</th>
              <th className="px-3 py-3 font-medium">Date</th>
              <th className="px-3 py-3 font-medium">Total</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3">
                <span className="sr-only">View order</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Loading your orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  You haven't placed any orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Package size={15} />
                      </span>
                      <span className="whitespace-nowrap font-semibold text-[#080F24]">
                        {order.order_number}
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                    {new Date(order.created_at).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#080F24]">
                    {formatPrice(order.total, order.currency)}
                  </td>

                  <td className="px-3 py-3">
                    <StatusBadge status={order.order_status} />
                  </td>

                  <td className="px-3 py-3">
                    <Link
                      to={`/account/orders/${order.id}`}
                      aria-label={`View order ${order.order_number}`}
                      className="text-slate-400 hover:text-blue-600"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
