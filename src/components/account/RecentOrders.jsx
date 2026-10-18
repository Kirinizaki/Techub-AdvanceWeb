
import { Link } from "react-router-dom";
import { ChevronRight, Package, Monitor, Cpu } from "lucide-react";

import { mockOrders } from "../../data/accountMockData";

const orderIcons = {
  package: Package,
  monitor: Monitor,
  cpu: Cpu,
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(price);

function StatusBadge({ status }) {
  const styles = {
    Processing: "bg-amber-50 text-amber-700 border-amber-200",
    Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Shipped: "bg-blue-50 text-blue-700 border-blue-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-medium ${
        styles[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

export default function RecentOrders() {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
        <div>
          <h2 className="text-sm font-bold text-[#080F24]">
            Recent Orders
          </h2>
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

      {/* Scroll horizontally on narrow screens instead of crushing columns. */}
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
            {mockOrders.slice(0, 3).map((order) => {
              const Icon = orderIcons[order.icon] || Package;

              return (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Icon size={15} />
                      </span>
                      <span className="whitespace-nowrap font-semibold text-[#080F24]">
                        #{order.id}
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                    {order.date}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#080F24]">
                    {formatPrice(order.total)}
                  </td>

                  <td className="px-3 py-3">
                    <StatusBadge status={order.status} />
                  </td>

                  <td className="px-3 py-3">
                    <Link
                      to={`/account/orders/${order.id}`}
                      aria-label={`View order ${order.id}`}
                      className="text-slate-400 hover:text-blue-600"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
