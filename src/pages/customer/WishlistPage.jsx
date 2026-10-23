import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ImageOff } from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

export default function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadWishlist = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("wishlists")
      .select(`
        id,
        product_id,
        created_at,
        product:products (
          id,
          name,
          price,
          image_url,
          stock_quantity,
          is_active,
          brand:brands (name),
          category:categories (name)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Unable to load wishlist:", queryError);
      setError("We couldn't load your wishlist. Please try again.");
      setItems([]);
    } else {
      setItems(
        (data ?? []).filter(
          (item) => item.product && item.product.is_active
        )
      );
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  async function handleRemove(item) {
    if (!user?.id || removingId) return;

    setRemovingId(item.product_id);
    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Unable to remove wishlist item:", deleteError);
      setError("Unable to remove this product. Please try again.");
    } else {
      setItems((current) => current.filter((saved) => saved.id !== item.id));
      setMessage(`${item.product.name} was removed from your wishlist.`);
    }

    setRemovingId(null);
  }

  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-600">
            <Heart size={17} />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
              Saved for later
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#080F24]">
            My Wishlist
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Keep track of the products you love.
          </p>
        </div>

        {!loading && items.length > 0 && (
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
          <button
            type="button"
            onClick={loadWishlist}
            className="ml-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {message && (
        <p
          role="status"
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {message}
        </p>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading your wishlist...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center px-3 py-12 text-center sm:py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Heart size={26} strokeWidth={1.7} />
          </div>
          <h3 className="mt-5 text-base font-bold text-[#080F24]">
            Your wishlist is empty
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Browse Techub and tap the heart on a product to save it here for
            later.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              to="/components"
              className="rounded-lg bg-[#080F24] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Browse Components
            </Link>
            <Link
              to="/desktop"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600"
            >
              Browse Desktops
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-2 2xl:grid-cols-3">
          {items.map((item) => {
            const product = item.product;
            const inStock = Number(product.stock_quantity) > 0;

            return (
              <article
                key={item.id}
                className="flex min-w-0 gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-200 hover:shadow-sm sm:gap-4 sm:p-4"
              >
                <Link
                  to={`/product/${product.id}`}
                  className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-2 sm:h-28 sm:w-28"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <ImageOff size={25} className="text-slate-300" />
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {product.brand?.name ?? "Unbranded"}
                  </p>
                  <Link
                    to={`/product/${product.id}`}
                    className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[#080F24] transition hover:text-blue-600"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    {product.category?.name ?? "Uncategorized"}
                  </p>
                  <p className="mt-2 text-base font-bold text-[#080F24]">
                    {formatPrice(product.price)}
                  </p>
                  <p
                    className={`mt-1 text-[11px] font-medium ${
                      inStock ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {inStock ? "In Stock" : "Out of Stock"}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-3">
                    <Link
                      to={`/product/${product.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <ShoppingBag size={14} />
                      View product
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      disabled={removingId === item.product_id}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {removingId === item.product_id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
