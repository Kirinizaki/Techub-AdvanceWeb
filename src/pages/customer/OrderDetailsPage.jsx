
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const money = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value ?? 0));

const dateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const steps = ["confirmed", "processing", "shipped", "delivered"];

const statusStyle = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function formatStatus(status) {
  return (status ?? "unknown").replaceAll("_", " ");
}

function ShippingAddress({ order }) {
  // Accommodate common snapshot formats without assuming a particular schema.
  const snapshot =
    order.shipping_address_snapshot ??
    order.shipping_address ??
    order.shipping_address_details;

  if (!snapshot) {
    return <p className="text-sm text-gray-500">No address snapshot available.</p>;
  }

  if (typeof snapshot === "string") {
    return <p className="whitespace-pre-line text-sm text-gray-700">{snapshot}</p>;
  }

  if (typeof snapshot === "object") {
    const fields = [
      snapshot.full_name,
      snapshot.recipient_name,
      snapshot.phone,
      snapshot.phone_number,
      snapshot.address_line1,
      snapshot.address_line2,
      snapshot.street_address,
      snapshot.barangay,
      snapshot.city,
      snapshot.province,
      snapshot.postal_code,
    ].filter(Boolean);

    if (fields.length) {
      return (
        <div className="space-y-1 text-sm text-gray-700">
          {fields.map((field, index) => (
            <p key={`${field}-${index}`}>{field}</p>
          ))}
        </div>
      );
    }
  }

  return (
    <p className="text-sm text-gray-500">
      Shipping address details are unavailable.
    </p>
  );
}

function OrderProgress({ status }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        This order has been cancelled.
      </div>
    );
  }

  const currentIndex = steps.indexOf(status);

  return (
    <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {steps.map((step, index) => {
        const complete = currentIndex >= index && currentIndex !== -1;
        const current = currentIndex === index;

        return (
          <li key={step} className="flex items-start gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                complete
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {complete ? "✓" : index + 1}
            </span>

            <div>
              <p
                className={`text-sm font-semibold capitalize ${
                  current ? "text-gray-900" : "text-gray-600"
                }`}
              >
                {step}
              </p>
              {current && (
                <p className="mt-1 text-xs text-gray-500">Current status</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please sign in to view this order.");

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (orderError) throw orderError;
      if (!orderData) throw new Error("Order not found.");

      const { data: itemData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderData.id)
        .order("product_name", { ascending: true });

      if (itemsError) throw itemsError;

      setOrder(orderData);
      setItems(itemData ?? []);
    } catch (err) {
      console.error("Failed to load order:", err);
      setError(err.message || "Unable to load this order.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  
  async function cancelOrder() {
    if (cancelling) return;

    setCancelling(true);
    setError("");
    setNotice("");

    try {
      const { error: cancelError } = await supabase.rpc(
        "cancel_customer_order",
        { p_order_id: orderId }
      );

      if (cancelError) throw cancelError;

      setShowCancelModal(false);
      setNotice("Your order has been cancelled.");

      await loadOrder();
    } catch (err) {
      console.error("Failed to cancel order:", {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
      });

      setError(err.message || "Unable to cancel this order.");
    } finally {
      setCancelling(false);
    }
  }


  if (loading) {
    return (
      <section className="px-4 py-12 text-center text-gray-600">
        Loading order details...
      </section>
    );
  }

  if (error && !order) {
    return (
      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 p-6">
          <p className="text-red-700">{error}</p>
          <Link
            to="/account/orders"
            className="mt-4 inline-block font-semibold text-gray-900 underline"
          >
            Back to My Orders
          </Link>
        </div>
      </section>
    );
  }

  if (!order) return null;

  const subtotal = Number(order.subtotal ?? 0);
  const automaticDiscount = Number(order.automatic_discount_total ?? 0);
  const promoDiscount = Number(order.promo_code_discount_total ?? 0);
  const otherDiscount = Number(order.other_discount_total ?? 0);
  const total = Number(order.total ?? 0);

  return (
    <section className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/account/orders"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to My Orders
        </Link>

        <header className="mt-5 flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">Order details</p>
            <h1 className="mt-1 break-all text-2xl font-bold text-gray-900">
              Order #{order.order_number ?? order.id}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Placed {dateTime(order.created_at)}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${
              statusStyle[order.order_status] ??
              "bg-gray-100 text-gray-700"
            }`}
          >
            {formatStatus(order.order_status)}
          </span>
        </header>

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {notice}
          </div>
        )}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="mb-5 font-bold text-gray-900">Order progress</h2>
          <OrderProgress status={order.order_status} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-bold text-gray-900">Items ordered</h2>
              </div>

              {items.length === 0 ? (
                <p className="p-5 text-sm text-gray-500">
                  No items were found for this order.
                </p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className="flex justify-between gap-4 p-5"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {item.product_name ?? "Product"}
                        </p>
                        {item.product_sku && (
                          <p className="mt-1 text-xs text-gray-500">
                            SKU: {item.product_sku}
                          </p>
                        )}
                        <p className="mt-2 text-sm text-gray-600">
                          Qty: {item.quantity} × {money(item.unit_price)}
                        </p>
                      </div>

                      <p className="shrink-0 font-semibold text-gray-900">
                        {money(item.line_total)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-4 font-bold text-gray-900">
                Shipping address
              </h2>
              <ShippingAddress order={order} />
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-4 font-bold text-gray-900">
                Payment summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-gray-600">
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>

                {automaticDiscount > 0 && (
                  <div className="flex justify-between gap-4 text-green-700">
                    <span>Automatic discount</span>
                    <span>−{money(automaticDiscount)}</span>
                  </div>
                )}

                {promoDiscount > 0 && (
                  <div className="flex justify-between gap-4 text-green-700">
                    <span>Promo code discount</span>
                    <span>−{money(promoDiscount)}</span>
                  </div>
                )}

                {otherDiscount > 0 && (
                  <div className="flex justify-between gap-4 text-green-700">
                    <span>Other discounts</span>
                    <span>−{money(otherDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between gap-4 border-t border-gray-200 pt-4 text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>{money(total)}</span>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-200 pt-4">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-600">Payment method</span>
                  <span className="font-medium text-gray-900">
                    Cash on Delivery
                  </span>
                </div>

                <div className="mt-3 flex justify-between gap-4 text-sm">
                  <span className="text-gray-600">Payment status</span>
                  <span className="font-semibold capitalize text-gray-900">
                    {formatStatus(order.payment_status)}
                  </span>
                </div>
              </div>
            </section>

            {order.order_status === "pending" && (
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="font-bold text-gray-900">Cancel order</h2>
                <p className="mt-2 text-sm text-gray-600">
                  You can cancel this order while it is still pending.
                </p>

                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  disabled={cancelling}
                  className="mt-4 w-full rounded-lg border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel order"}
                </button>
              </section>
            )}
          </aside>
        </div>
      </div>

    {showCancelModal && (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#080F24]/60 p-4 backdrop-blur-sm"
        onClick={() => {
        if (!cancelling) setShowCancelModal(false);
        }}
    >
        <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-order-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6"
            aria-hidden="true"
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.3 3.86 2.8 17a2 2 0 0 0 1.74 3h14.92a2 2 0 0 0 1.74-3l-7.46-13.14a2 2 0 0 0-3.44 0Z"
            />
            </svg>
        </div>

        <h2
            id="cancel-order-title"
            className="text-xl font-bold text-[#080F24]"
        >
            Cancel this order?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
            Are you sure you want to cancel this order? This action
            cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
            <button
            type="button"
            disabled={cancelling}
            onClick={() => setShowCancelModal(false)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
            Keep Order
            </button>

            <button
            type="button"
            disabled={cancelling}
            onClick={cancelOrder}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
            {cancelling ? "Cancelling..." : "Yes, Cancel Order"}
            </button>
        </div>
        </div>
    </div>
    )}
    </section>
  );
}
