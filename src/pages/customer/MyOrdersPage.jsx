
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(amount ?? 0));

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function StatusBadge({ status }) {
  const normalizedStatus = status?.toLowerCase() ?? "unknown";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        statusStyles[normalizedStatus] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {normalizedStatus.replaceAll("_", " ")}
    </span>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setError("Please sign in to view your orders.");
        return;
      }

      const { data, error: ordersError } = await supabase
        .from("orders")
        .select(
          "id, order_number, order_status, payment_status, total, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(data ?? []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError(err.message || "Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <section className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm text-gray-500">
            Account / My Orders
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            My Orders
          </h1>

          <p className="mt-2 text-gray-600">
            View your purchases and check their latest status.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 p-10 text-center">
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={loadOrders}
              className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-7 w-7 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 7h12l1 13H5L6 7Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 9V6a3 3 0 0 1 6 0v3"
                />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              No orders yet
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Your purchases will appear here after checkout.
            </p>

            <Link
              to="/components"
              className="mt-6 inline-flex rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
            >
              Browse components
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">
                Order history
              </h2>
              <span className="text-sm text-gray-500">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </span>
            </div>

            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="break-all font-semibold text-gray-900">
                      Order #{order.order_number ?? order.id}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Placed on {formatDate(order.created_at)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusBadge status={order.order_status} />

                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                        Payment: {order.payment_status?.replaceAll("_", " ") ?? "unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="sm:text-right">
                      <p className="text-xs text-gray-500">Order total</p>
                      <p className="mt-1 font-bold text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                    </div>

                    <Link
                      to={`/account/orders/${order.id}`}
                      className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                    >
                      View details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
