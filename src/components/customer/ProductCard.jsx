import { ShoppingCart, ArrowUpRight, ImageOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import WishlistButton from "./WishlistButton";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const hasImage = Boolean(product.image) && !imageError;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-slate-50 p-5">
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-bold tracking-wider text-white">
            {product.badge}
          </span>
        )}

        <Link
          to={`/product/${product.id}`}
          className="flex h-full w-full items-center justify-center"
        >
          {hasImage ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImageError(true)}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-300">
              <ImageOff size={36} strokeWidth={1.5} />
              <span className="text-xs text-slate-400">Image unavailable</span>
            </div>
          )}
        </Link>

        <div className="absolute right-3 top-3 z-10">
          <WishlistButton
            productId={product.id}
            productName={product.name}
            className="h-9 w-9 border shadow-sm"
            size={17}
          />
        </div>

        <Link
          to={`/product/${product.id}`}
          aria-label={`View ${product.name}`}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 opacity-100 shadow-sm transition hover:bg-blue-600 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
        >
          <ArrowUpRight size={17} />
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {product.brand}
          </span>
          <span
            className={`text-[10px] font-medium ${
              product.stock === "In Stock" ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {product.stock}
          </span>
        </div>

        <p className="mb-1 text-[10px] text-slate-400">{product.category}</p>
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-900">
          {product.name}
        </h3>

        <div className="mt-4 flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-slate-950">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => addToCart(product, 1)}
          disabled={product.stock !== "In Stock"}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          <ShoppingCart size={15} />
          {product.stock === "In Stock" ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
