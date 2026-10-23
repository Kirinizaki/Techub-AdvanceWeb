
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ChatSupport from "../../components/customer/ChatSupport";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabaseClient";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);

function CheckoutPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { cartItems, subtotal, clearCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  // Keep the same key when retrying an uncertain request.
  const idempotencyKey = useRef(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true, state: { from: "/checkout" } });
      return;
    }

    let cancelled = false;

    async function loadAddresses() {
      setLoadingAddresses(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("shipping_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        setError(`Unable to load your addresses: ${fetchError.message}`);
      } else {
        const savedAddresses = data ?? [];
        setAddresses(savedAddresses);

        if (savedAddresses.length > 0) {
          setAddressId((currentId) =>
            savedAddresses.some((address) => address.id === currentId)
              ? currentId
              : savedAddresses.find((address) => address.is_default)?.id ??
                savedAddresses[0].id
          );
        }
      }

      setLoadingAddresses(false);
    }

    loadAddresses();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, navigate]);

  async function handlePlaceOrder(event) {
    event.preventDefault();
    setError("");

    if (!user) {
      setError("Please sign in before placing your order.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!addressId) {
      setError("Please select a shipping address.");
      return;
    }

    if (
      cartItems.some(
        (item) =>
          !item.id ||
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) < 1 ||
          Number(item.quantity) > 100
      )
    ) {
      setError("Your cart contains an invalid item or quantity.");
      return;
    }

    setSubmitting(true);

    try {
      if (!idempotencyKey.current) {
        idempotencyKey.current = crypto.randomUUID();
      }

      const { data, error: checkoutError } = await supabase.rpc(
        "checkout_cod_order",
        {
          p_idempotency_key: idempotencyKey.current,
          p_shipping_address_id: addressId,
          p_items: cartItems.map((item) => ({
            product_id: item.id,
            quantity: Number(item.quantity),
          })),
          p_promo_code: promoCode.trim() || null,
        }
      );

      if (checkoutError) throw checkoutError;

      const result = typeof data === "string" ? JSON.parse(data) : data;

      if (!result?.order_id) {
        throw new Error(
          "The checkout response did not include an order ID. Check your orders before trying again."
        );
      }

      setOrder(result);
      clearCart();
      idempotencyKey.current = null;
    } catch (err) {
      setError(
        err.message ||
          "We couldn't complete checkout. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedAddress = addresses.find(
    (address) => address.id === addressId
  );

  return (
    <div className="min-h-screen bg-[#F6F8FC] font-sans text-slate-900">
      <Navbar />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
          <Link
            to="/cart"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={16} />
            Back to Cart
          </Link>

          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Confirm your delivery details and place your order.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        {order ? (
          <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
            <CheckCircle2
              size={48}
              className="mx-auto text-emerald-600"
            />
            <h2 className="mt-4 font-heading text-2xl font-bold">
              Order placed successfully!
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Your order has been submitted and is awaiting confirmation.
            </p>

            {order.order_number && (
              <p className="mt-5 text-sm">
                Order number:{" "}
                <strong>{order.order_number}</strong>
              </p>
            )}

            <p className="mt-3 text-lg font-bold">
              Total: {formatPrice(order.total)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Payment method: Cash on Delivery
            </p>

            <Link
              to="/account/orders"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View My Orders
            </Link>
          </section>
        ) : cartItems.length === 0 ? (
          <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <Package size={36} className="mx-auto text-slate-400" />
            <h2 className="mt-4 text-xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-sm text-slate-500">
              Add products to your cart before checking out.
            </p>
            <Link
              to="/components"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </section>
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
          >
            <div className="space-y-6">
              <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <MapPin className="text-blue-600" size={21} />
                  <h2 className="text-lg font-bold">
                    Shipping Address
                  </h2>
                </div>

                {loadingAddresses ? (
                  <p className="mt-5 text-sm text-slate-500">
                    Loading your saved addresses...
                  </p>
                ) : addresses.length === 0 ? (
                  <div className="mt-5 rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">
                      You haven't saved a shipping address yet.
                    </p>
                    <Link
                      to="/account/addresses"
                      className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Add a Shipping Address
                    </Link>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${
                          addressId === address.id
                            ? "border-blue-500 bg-blue-50/50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping-address"
                          value={address.id}
                          checked={addressId === address.id}
                          onChange={() => setAddressId(address.id)}
                          className="mt-1 accent-blue-600"
                        />
                        <span className="min-w-0 text-sm">
                          <span className="flex flex-wrap items-center gap-2 font-semibold">
                            {address.recipient_name}
                            {address.is_default && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                Default
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block text-slate-500">
                            {address.phone}
                          </span>
                          <span className="mt-1 block leading-6 text-slate-600">
                            {address.address_line}
                            {address.barangay && `, ${address.barangay}`}
                            {`, ${address.city}, ${address.province}, ${address.postal_code}`}
                          </span>
                        </span>
                      </label>
                    ))}

                    <Link
                      to="/account/addresses"
                      className="inline-flex text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Manage Saved Addresses
                    </Link>
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <Truck className="text-blue-600" size={21} />
                  <h2 className="text-lg font-bold">Payment Method</h2>
                </div>
                <div className="mt-5 flex gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                  <input
                    type="radio"
                    checked
                    readOnly
                    aria-label="Cash on Delivery"
                    className="mt-1 accent-blue-600"
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      Cash on Delivery (COD)
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Pay when your order is delivered. Your order will
                      remain pending until the team confirms it.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-5">
              <h2 className="text-lg font-bold">Order Summary</h2>

              <div className="mt-5 space-y-4 border-b border-slate-100 pb-5">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-between gap-3 text-sm">
                <span className="text-slate-500">Estimated subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Final prices and discounts are calculated by the server.
                Shipping charges are not included in this checkout yet.
              </p>

              <label
                htmlFor="checkout-promo"
                className="mt-5 block text-sm font-semibold"
              >
                Promo Code (optional)
              </label>
              <input
                id="checkout-promo"
                type="text"
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="Enter promo code"
                maxLength={100}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={
                  submitting ||
                  loadingAddresses ||
                  !selectedAddress ||
                  cartItems.length === 0
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShieldCheck size={17} />
                {submitting ? "Placing Order..." : "Place COD Order"}
              </button>

              <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                By placing your order, you confirm your selected shipping
                address and Cash on Delivery payment method.
              </p>
            </aside>
          </form>
        )}
      </main>

      <Footer />
      <ChatSupport />
    </div>
  );
}

export default CheckoutPage;
