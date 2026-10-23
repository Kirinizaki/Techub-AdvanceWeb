
import { useState } from "react";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  PackageCheck,
} from "lucide-react";

import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ChatSupport from "../../components/customer/ChatSupport";
import { useCart } from "../../context/CartContext";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(price);

function CartPage() {
  const {
    cartItems,
    totalItems,
    subtotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");

  const applyPromo = (event) => {
    event.preventDefault();
    setPromoMessage(
      promoCode.trim()
        ? "Promo code validation will be available when checkout is connected."
        : "Please enter a promo code."
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] font-sans text-slate-900">
      <Navbar />

      {/* Page heading */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">
          <p className="mb-2 text-xs font-medium text-slate-400">
            Home <span className="mx-2">/</span> Shopping Cart
          </p>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Your next upgrade starts here
          </p>

          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Shopping Cart
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review your items before proceeding to checkout.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
        {cartItems.length > 0 ? (
          <>
            {/* Cart title and item count */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold">
                  Your Items
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {totalItems} {totalItems === 1 ? "item" : "items"} in
                  your cart
                </p>
              </div>

              <Link
                to="/components"
                className="flex items-center gap-2 text-xs font-semibold text-blue-600 transition hover:text-blue-800"
              >
                <ArrowLeft size={15} />
                Continue Shopping
              </Link>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
              {/* Cart items */}
              <section className="min-w-0 space-y-4">
                {cartItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      {/* Product image */}
                      <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F6F8FC] sm:h-32 sm:w-32">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain p-3"
                        />
                      </div>

                      {/* Product details */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              {item.brand} · {item.category}
                            </p>

                            <h3 className="mt-1 font-heading text-sm font-bold leading-6 text-slate-900 sm:text-base">
                              {item.name}
                            </h3>

                            <p
                              className={`mt-2 flex items-center gap-1.5 text-[11px] font-medium ${
                                item.stockQuantity > 0
                                  ? "text-emerald-600"
                                  : "text-red-500"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  item.stockQuantity > 0
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                                }`}
                              />
                              {item.stock ? "In Stock" : "Out of Stock"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-end justify-between gap-4">
                          {/* Quantity controls */}
                          <div>
                            <p className="mb-2 text-[10px] font-medium text-slate-400">
                              Quantity
                            </p>

                            <div className="flex items-center rounded-lg border border-slate-200">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                aria-label="Decrease quantity"
                                className="p-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <Minus size={14} />
                              </button>

                              <span className="min-w-9 text-center text-xs font-semibold">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={item.quantity >= item.stockQuantity}
                                aria-label="Increase quantity"
                                className="p-2 text-slate-500 transition hover:bg-slate-50"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] text-slate-400">
                              {formatPrice(item.price)} each
                            </p>
                            <p className="mt-1 font-heading text-base font-bold text-slate-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}

                {/* Shopping benefits */}
                <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Secure Shopping</p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Your checkout should be protected.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                      <PackageCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Quality Hardware</p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Find the right gear for your setup.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Order summary */}
              <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-5">
                <h2 className="font-heading text-lg font-bold">
                  Order Summary
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Review your estimated total.
                </p>

                <div className="mt-6 space-y-4 border-b border-slate-100 pb-5">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-500">
                      Subtotal ({totalItems} items)
                    </span>
                    <span className="font-semibold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-500">
                      <Truck size={15} />
                      Shipping
                    </span>
                    <span className="text-xs text-slate-400">
                      Calculated at checkout
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-500">Discount</span>
                    <span className="font-medium text-slate-400">
                      —
                    </span>
                  </div>
                </div>

                {/* Promo code */}
                <form onSubmit={applyPromo} className="py-5">
                  <label
                    htmlFor="promo-code"
                    className="mb-2 flex items-center gap-2 text-xs font-semibold"
                  >
                    <Tag size={15} className="text-blue-600" />
                    Promo Code
                  </label>

                  <div className="flex gap-2">
                    <input
                      id="promo-code"
                      type="text"
                      value={promoCode}
                      onChange={(event) => {
                        setPromoCode(event.target.value);
                        setPromoMessage("");
                      }}
                      placeholder="Enter code"
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none transition focus:border-blue-500"
                    />

                    <button
                      type="submit"
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold transition hover:border-blue-300 hover:text-blue-600"
                    >
                      Apply
                    </button>
                  </div>

                  {promoMessage && (
                    <p className="mt-2 text-[11px] leading-5 text-slate-500">
                      {promoMessage}
                    </p>
                  )}
                </form>

                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">Estimated Total</p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Shipping and taxes calculated later
                      </p>
                    </div>

                    <p className="font-heading text-xl font-bold text-slate-900">
                      {formatPrice(subtotal)}
                    </p>
                  </div>

                  <Link
                    to="/checkout"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Proceed to Checkout
                    <ArrowRight size={17} />
                  </Link>

                  <p className="mt-3 text-center text-[10px] leading-5 text-slate-400">
                    Secure checkout with Cash on Delivery.
                  </p>

                  <Link
                    to="/components"
                    className="mt-4 flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </aside>
            </div>
          </>
        ) : (
          /* Empty cart */
          <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <ShoppingBag size={28} />
            </div>

            <h2 className="mt-5 font-heading text-xl font-bold">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Looks like you haven't added any hardware yet. Explore our
              collection and find your next upgrade.
            </p>

            <Link
              to="/components"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Products
              <ArrowRight size={17} />
            </Link>
          </section>
        )}
      </main>

      <Footer />
      <ChatSupport />
    </div>
  );
}

export default CartPage;
