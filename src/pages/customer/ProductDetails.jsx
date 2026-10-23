
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Check,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Package,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ChatSupport from "../../components/customer/ChatSupport";
import { getProducts } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import WishlistButton from "../../components/customer/WishlistButton";

const relatedProducts = [];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);


export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const products = await getProducts();
        const matchingProduct = products.find(
          (item) => item.id === id
        );

        if (!matchingProduct) {
          setError("Product not found or is no longer available.");
          return;
        }

        setProduct(matchingProduct);
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Unable to load this product. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);
  
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const stock = Number(product?.stockQuantity ?? 0);
  const numericQuantity = Number(quantity);
  const validQuantity =
    Number.isInteger(numericQuantity) &&
    numericQuantity >= 1 &&
    numericQuantity <= stock;

  const updateQuantity = (value) => {
    if (value === "") {
      setQuantity("");
      return;
    }

    if (!/^\d+$/.test(value)) return;

    const parsed = Number(value);

    if (parsed >= 1 && parsed <= stock) {
      setQuantity(parsed);
    }
  };

  const handleQuantityBlur = () => {
    if (!validQuantity) {
      setQuantity(stock > 0 ? 1 : 0);
    }
  };

  const handleAddToCart = () => {
    if (!validQuantity || stock === 0 || !product) return;

    addToCart(product, numericQuantity);

    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 2000);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] text-[#080F24]">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-20 text-center">
          <p className="text-sm text-slate-500">
            Loading product details...
          </p>
        </main>
        <Footer />
        <ChatSupport />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] text-[#080F24]">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-xl font-bold">
            {error || "Product not found."}
          </h1>
          <Link
            to="/components"
            className="mt-5 inline-flex rounded-lg bg-[#0798F9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#087FD0]"
          >
            Back to Components
          </Link>
        </main>
        <Footer />
        <ChatSupport />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#080F24]">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500"
        >
          <Link to="/" className="transition hover:text-[#0798F9]">
            Home
          </Link>

          <ChevronRight size={15} />

          <Link to="/products" className="transition hover:text-[#0798F9]">
            Products
          </Link>

          <ChevronRight size={15} />

          <Link
            to={`/products?category=${encodeURIComponent(product.category)}`}
            className="transition hover:text-[#0798F9]"
          >
            {product.category}
          </Link>

          <ChevronRight size={15} />

          <span
            aria-current="page"
            className="font-medium text-[#080F24]"
          >
            {product.name}
          </span>
        </nav>

        {/* Main product section */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product image */}
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 sm:min-h-110 sm:p-10">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-105 w-full object-contain"
            />
          </div>

          {/* Product information */}
          <div className="flex flex-col">
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                {product.category}
              </span>

              <WishlistButton
                productId={product.id}
                productName={product.name}
                className="h-10 w-10 border"
                size={20}
              />
            </div>

            <p className="mb-2 text-sm font-medium text-slate-500">
              {product.brand}
            </p>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#080F24] sm:text-4xl">
              {product.name}
            </h1>

            {/* Customer rating */}
            <div className="mt-4">
              <p className="text-sm text-slate-500">
                Customer reviews are not available yet.
              </p>
            </div>

            {/* Price */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-[#080F24]">
                {formatPrice(product.price)}
              </span>

              {product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-slate-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>

                  <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600">
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100
                    )}
                    % OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div className="mt-5 flex items-center gap-2 text-sm">
              {stock > 0 ? (
                <>
                  <Check size={17} className="text-emerald-600" />
                  <span className="font-medium text-emerald-700">
                    In Stock
                  </span>
                  <span className="text-slate-500">
                    ({stock} available)
                  </span>
                </>
              ) : (
                <span className="font-medium text-rose-600">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-7 border-t border-slate-200 pt-6">
              <h2 className="mb-3 text-lg font-semibold text-[#080F24]">
                Product Description
              </h2>

              <p className="text-sm leading-7 text-slate-600 sm:text-base">
                {product.description}
              </p>
            </div>

            {/* Quantity and cart actions */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex h-12 items-center overflow-hidden rounded-lg border border-slate-300 bg-white">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, (Number(current) || 1) - 1)
                    )
                  }
                  disabled={stock === 0 || Number(quantity) <= 1}
                  aria-label="Decrease quantity"
                  className="h-full px-3 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus size={16} />
                </button>

                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={stock}
                  step="1"
                  value={quantity}
                  onChange={(event) =>
                    updateQuantity(event.target.value)
                  }
                  onBlur={handleQuantityBlur}
                  disabled={stock === 0}
                  aria-label="Product quantity"
                  className="h-full w-16 border-x border-slate-200 bg-transparent text-center font-semibold text-[#080F24] outline-none disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(stock, (Number(current) || 0) + 1)
                    )
                  }
                  disabled={stock === 0 || Number(quantity) >= stock}
                  aria-label="Increase quantity"
                  className="h-full px-3 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!validQuantity || stock === 0}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0798F9] px-5 font-semibold text-white transition hover:bg-[#087FD0] disabled:cursor-not-allowed disabled:bg-slate-400 sm:flex-none"
              >
                {addedToCart ? (
                  <>
                    <Check size={19} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={19} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Purchase benefits */}
            <div className="mt-8 grid grid-cols-1 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <Truck
                  size={22}
                  className="mt-0.5 shrink-0 text-[#0798F9]"
                />
                <div>
                  <p className="text-sm font-semibold text-[#080F24]">
                    Fast Delivery
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Delivery options at checkout
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={22}
                  className="mt-0.5 shrink-0 text-[#0798F9]"
                />
                <div>
                  <p className="text-sm font-semibold text-[#080F24]">
                    1 Year Store Warranty
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Subject to warranty terms
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RotateCcw
                  size={22}
                  className="mt-0.5 shrink-0 text-[#0798F9]"
                />
                <div>
                  <p className="text-sm font-semibold text-[#080F24]">
                    7 Day Replacement
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Subject to replacement policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specifications */}
        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:mt-16">
          <h2 className="text-2xl font-bold text-[#080F24]">
            Product Specifications
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Technical information and details about this product.
          </p>

          <div className="mt-6 divide-y divide-slate-100">
            {(product.specifications ?? []).map(([label, value]) => (
              <p
                key={label}
                className="py-4 text-sm leading-6 text-slate-600 sm:text-base"
              >
                <span className="font-semibold text-[#080F24]">
                  {label}:
                </span>{" "}
                {value}
              </p>
            ))}
          </div>
        </section>

        {/* Additional product information */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <Package
              size={24}
              className="mt-1 shrink-0 text-[#0798F9]"
            />

            <div>
              <h2 className="text-xl font-bold text-[#080F24]">
                Need Help With This Product?
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                If you have questions about compatibility, availability,
                or product specifications, contact our support team
                before purchasing.
              </p>
            </div>
          </div>
        </section>

        {/* Related Products */}
        <section className="mt-12 border-t border-slate-200 pt-10 lg:mt-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
            <p className="mb-2 text-xl font-extrabold uppercase tracking-wider text-[#080F24]">
                You May Also Like
            </p>

            <p className="mt-2 text-sm text-slate-500">
                Explore more components for your next PC build.
            </p>
            </div>

            <Link
            to="/products"
            className="text-sm font-semibold text-[#0798F9] transition hover:text-[#087FD0]"
            >
            View All Products →
            </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {relatedProducts
            .filter((item) => item.id !== id)
            .map((item) => (
                <Link
                key={item.id}
                to={`/product/${item.id}`}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                >
                <div className="flex aspect-4/3 items-center justify-center overflow-hidden bg-slate-50 p-4">
                    <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                    />
                </div>

                <div className="p-4">
                    <p className="text-xs font-medium text-slate-500">
                    {item.category}
                    </p>

                    <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-semibold text-[#080F24] transition group-hover:text-[#0798F9] sm:text-base">
                    {item.name}
                    </h3>

                    <p className="mt-3 text-base font-bold text-[#080F24] sm:text-lg">
                    {formatPrice(item.price)}
                    </p>

                    <span className="mt-4 flex w-full items-center justify-center rounded-lg border border-[#0798F9] px-3 py-2 text-sm font-semibold text-[#0798F9] transition group-hover:bg-[#0798F9] group-hover:text-white">
                    View Product
                    </span>
                </div>
                </Link>
            ))}
        </div>
        </section>

      </main>
          
      <Footer />
      <ChatSupport />
    </div>
  );
}
